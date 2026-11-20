#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { builtinModules, createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DEFAULT_REPO = 'https://github.com/webpack/webpack.git';
const DEFAULT_OUTPUT = resolve(ROOT, 'webpack');
const UNBUNDLED_EMIT_DIR = '.mf-unbundled-dts';
const PRESERVE_OUTPUT_ENTRIES = new Set(['package.json', 'node_modules']);
const ROOT_TYPES = 'types.d.ts';
const OPTIONS_DECLARATION = 'declarations/WebpackOptions.d.ts';
const SKIP_SCAN_DIRS = new Set(['.git', 'node_modules', UNBUNDLED_EMIT_DIR]);

function shouldIncludeDeclarationPath(relPath) {
  return !relPath.startsWith('test/') && relPath !== ROOT_TYPES;
}

function printHelp() {
  console.log(`
Regenerate unbundled webpack declaration output.

Usage:
  node scripts/sync-webpack-unbundled-types.mjs [options]

Options:
  --repo <url>         Git URL to clone (default: ${DEFAULT_REPO})
  --ref <git-ref>      Branch/tag/SHA to clone (for example: v5.104.1)
  --version <semver>   Shortcut for --ref v<semver>
  --output <path>      Output directory (default: ${DEFAULT_OUTPUT})
  --clone-dir <path>   Use a specific clone directory
  --keep-clone         Keep clone directory after completion
  --skip-install       Skip dependency install in cloned repo
  --skip-generate      Skip webpack type generation step
  --clean              Remove existing output files before syncing
  --dry-run            Print planned actions without writing output
  --verbose            Print each shell command before running it
  --help               Show this help

Examples:
  node scripts/sync-webpack-unbundled-types.mjs
  node scripts/sync-webpack-unbundled-types.mjs --version 5.104.1
  node scripts/sync-webpack-unbundled-types.mjs --ref main --output ./webpack
`);
}

function parseArgs(argv) {
  const args = {};

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--') continue;
    if (!arg.startsWith('--')) continue;

    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i++;
    } else {
      args[key] = true;
    }
  }

  return args;
}

function runCommand(command, args, options = {}) {
  const {
    cwd = ROOT,
    verbose = false,
    env: envOverrides = {},
    allowNonZeroExit = false,
  } = options;
  if (verbose) {
    console.log(`$ ${command} ${args.join(' ')}`);
  }

  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: {
      ...process.env,
      INIT_CWD: cwd,
      ...envOverrides,
    },
  });

  if (result.status !== 0 && !allowNonZeroExit) {
    throw new Error(
      `Command failed (${result.status ?? 'unknown'}): ${command} ${args.join(' ')}`,
    );
  }

  return result.status ?? 0;
}

function readWorkspaceWebpackVersion() {
  const packageJsonPath = resolve(ROOT, 'package.json');
  if (!existsSync(packageJsonPath)) return null;

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const candidate =
    packageJson.dependencies?.webpack ??
    packageJson.devDependencies?.webpack ??
    null;
  if (!candidate || typeof candidate !== 'string') return null;

  const match = candidate.match(/\d+\.\d+\.\d+/);
  return match ? match[0] : null;
}

function normalizeRef(ref, version) {
  if (ref && version) {
    throw new Error('Use either --ref or --version, not both.');
  }

  if (version) {
    return version.startsWith('v') ? version : `v${version}`;
  }

  if (ref) return ref;

  const workspaceVersion = readWorkspaceWebpackVersion();
  return workspaceVersion ? `v${workspaceVersion}` : 'main';
}

function isCommitSha(value) {
  return typeof value === 'string' && /^[0-9a-f]{7,40}$/i.test(value);
}

function resolveCloneDir(cloneDirArg) {
  if (cloneDirArg) {
    return {
      cloneDir: resolve(cloneDirArg),
      cleanupPath: null,
    };
  }

  const tempRoot = mkdtempSync(join(tmpdir(), 'webpack-unbundled-types-'));
  return {
    cloneDir: join(tempRoot, 'webpack'),
    cleanupPath: tempRoot,
  };
}

function cloneWebpackRepo({ repo, ref, cloneDir, verbose }) {
  const cloneArgs = ['clone', '--depth', '1', '--single-branch'];
  if (ref && !isCommitSha(ref)) {
    cloneArgs.push('--branch', ref);
  }
  cloneArgs.push(repo, cloneDir);
  runCommand('git', cloneArgs, { verbose });

  if (ref && isCommitSha(ref)) {
    runCommand('git', ['fetch', '--depth', '1', 'origin', ref], {
      cwd: cloneDir,
      verbose,
    });
    runCommand('git', ['checkout', ref], { cwd: cloneDir, verbose });
  }
}

function runWebpackTypeGeneration({
  cloneDir,
  skipInstall,
  skipGenerate,
  verbose,
}) {
  if (!skipInstall) {
    runCommand(
      'corepack',
      ['yarn', 'install', '--frozen-lockfile', '--ignore-engines'],
      { cwd: cloneDir, verbose },
    );
  }

  if (!skipGenerate && !existsSync(join(cloneDir, 'node_modules/tooling'))) {
    // Webpack 5.112 moved this tooling into its repository. Its releases
    // commit the generated declarations, so the clone already has them.
    console.log('No node_modules/tooling; using the committed declarations.');
  } else if (!skipGenerate) {
    const generationSteps = [
      ['node', ['node_modules/tooling/inherit-types', '--write']],
      ['node', ['node_modules/tooling/format-schemas', '--write']],
      ['node', ['tooling/generate-runtime-code.js', '--write']],
      ['node', ['tooling/generate-wasm-code.js', '--write']],
      ['node', ['node_modules/tooling/compile-to-definitions', '--write']],
      ['node', ['node_modules/tooling/precompile-schemas', '--write']],
      [
        'node',
        [
          'node_modules/tooling/generate-types',
          '--no-template-literals',
          '--write',
        ],
      ],
    ];

    for (const [command, commandArgs] of generationSteps) {
      runCommand(command, commandArgs, {
        cwd: cloneDir,
        verbose,
      });
    }
  }
}

function emitUnbundledDtsFromJavascript({ cloneDir }) {
  const tsconfigPath = join(cloneDir, 'tsconfig.mf-unbundled-types.json');
  const emittedDir = join(cloneDir, UNBUNDLED_EMIT_DIR);
  const tsConfig = {
    compilerOptions: {
      allowJs: true,
      declaration: true,
      emitDeclarationOnly: true,
      noEmitOnError: false,
      checkJs: false,
      skipLibCheck: true,
      module: 'commonjs',
      target: 'es2020',
      moduleResolution: 'node',
      resolveJsonModule: true,
      esModuleInterop: true,
      strict: false,
      outDir: `./${UNBUNDLED_EMIT_DIR}`,
    },
    include: [
      './benchmark/*.js',
      './bin/*.js',
      './examples/*.js',
      './examples/wasm-bindgen-esm/pkg/*.js',
      './hot/*.js',
      './lib/**/*.js',
      './setup/*.js',
    ],
    exclude: ['./node_modules/**'],
  };

  writeFileSync(tsconfigPath, JSON.stringify(tsConfig, null, 2));

  // `tsc` skips any file with declaration-emit diagnostics, such as private
  // members in JSDoc-inferred types, and webpack 5.112 has several. Force the
  // emit through the compiler API, as the language service does.
  const ts = createRequire(join(cloneDir, 'package.json'))('typescript');
  const config = ts.getParsedCommandLineOfConfigFile(
    tsconfigPath,
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
        throw new Error(
          ts.flattenDiagnosticMessageText(diagnostic.messageText),
        );
      },
    },
  );
  const program = ts.createProgram(config.fileNames, config.options);
  program.emit(undefined, undefined, undefined, true, undefined, true);

  const emittedFiles = collectDtsFiles(emittedDir).sort((a, b) =>
    a.localeCompare(b),
  );
  const emitted = new Set(emittedFiles);
  const cloneRoot = realpathSync(cloneDir);
  const missing = config.fileNames
    .map((fileName) => relative(cloneRoot, realpathSync(fileName)))
    .filter((relPath) => !emitted.has(relPath.replace(/\.js$/, '.d.ts')));
  if (missing.length > 0) {
    throw new Error(
      `No declaration was emitted for ${missing.length} files:\n${missing.join('\n')}`,
    );
  }

  return { emittedDir, emittedFiles };
}

function collectDtsFiles(rootDir, currentDir = rootDir, collector = []) {
  const entries = readdirSync(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_SCAN_DIRS.has(entry.name)) continue;
      const nextDir = join(currentDir, entry.name);
      collectDtsFiles(rootDir, nextDir, collector);
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith('.d.ts')) continue;
    const absPath = join(currentDir, entry.name);
    collector.push(absPath.slice(rootDir.length + 1));
  }
  return collector;
}

function cleanOutputDirectory(outputDir) {
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
    return;
  }

  const entries = readdirSync(outputDir, { withFileTypes: true });
  for (const entry of entries) {
    if (PRESERVE_OUTPUT_ENTRIES.has(entry.name)) continue;
    rmSync(join(outputDir, entry.name), { recursive: true, force: true });
  }
}

function findTypeEnd(lines, start) {
  let depth = 0;
  for (let i = start; i < lines.length; i++) {
    for (const char of lines[i].replaceAll('=>', '')) {
      if ('{([<'.includes(char)) depth++;
      else if ('})]>'.includes(char)) depth--;
    }
    if (depth <= 0 && lines[i].trimEnd().endsWith(';')) return i;
  }
  throw new Error(`Unterminated type alias at line ${start + 1}`);
}

const DECLARED_CLASS = /^declare (?:abstract )?class ([A-Za-z0-9_$]+)\b/gm;
const ROOT_EXPORT = /^export = ([A-Za-z0-9_$]+);/m;
const NAMESPACE_EXPORTS =
  /^declare namespace ([A-Za-z0-9_$]+) \{\s*export \{([^}]*)\}/gm;

// Each class a per-file declaration exports, either as the module itself
// (`export = Module`) or as a member of its namespace, as ExportsInfo.d.ts
// exports ExportInfo.
function findClassFiles(outputDir) {
  const filesByName = new Map();
  const add = (name, entry) => {
    filesByName.set(name, [...(filesByName.get(name) || []), entry]);
  };
  for (const relPath of collectDtsFiles(join(outputDir, 'lib'))) {
    const source = readFileSync(join(outputDir, 'lib', relPath), 'utf8');
    const root = ROOT_EXPORT.exec(source)?.[1];
    if (!root) continue;
    const path = `./lib/${relPath.slice(0, -'.d.ts'.length)}`;
    const declared = new Set(
      Array.from(source.matchAll(DECLARED_CLASS), ([, name]) => name),
    );
    if (declared.has(root) && path.endsWith(`/${root}`)) add(root, { path });
    for (const [, namespace, list] of source.matchAll(NAMESPACE_EXPORTS)) {
      if (namespace !== root) continue;
      for (const entry of list.split(',')) {
        const [local, member = local] = entry.trim().split(/\s+as\s+/);
        if (local !== root && declared.has(local)) {
          add(local, { path, member });
        }
      }
    }
  }
  return filesByName;
}

// Webpack ships one bundled types.d.ts. Import each class and option type from
// its per-file declaration instead, so `webpack.Module` and
// `webpack/lib/module/Module` are the same type rather than two copies.
function composeRootTypes({ bundledPath, outputDir }) {
  const bundled = readFileSync(bundledPath, 'utf8').split('\n');
  const classFiles = findClassFiles(outputDir);
  const optionTypes = new Set(
    Array.from(
      readFileSync(join(outputDir, OPTIONS_DECLARATION), 'utf8').matchAll(
        /^export (?:interface|type) ([A-Za-z0-9_$]+)\b/gm,
      ),
      ([, name]) => name,
    ),
  );

  const classImports = [];
  const moduleImports = new Map();
  const memberImports = [];
  const optionImports = [];
  const kept = [];
  for (let i = 0; i < bundled.length; i++) {
    const classMatch = /^declare (?:abstract )?class ([A-Za-z0-9_$]+)\b/.exec(
      bundled[i],
    );
    const optionMatch =
      /^(?:declare )?(interface|type) ([A-Za-z0-9_$]+)\b/.exec(bundled[i]);
    const classEntries = classMatch && classFiles.get(classMatch[1]);
    const isClass = classEntries?.length === 1;
    const isOption = !isClass && optionMatch && optionTypes.has(optionMatch[2]);
    if (!isClass && !isOption) {
      kept.push(bundled[i]);
      continue;
    }
    while (kept.length && /^\s*(\/\*\*|\*)/.test(kept.at(-1))) kept.pop();
    if (isClass || optionMatch[1] === 'interface') {
      if (!bundled[i].trimEnd().endsWith('{}')) {
        while (bundled[i] !== '}') i++;
      }
    } else {
      i = findTypeEnd(bundled, i);
    }
    if (isClass) {
      const [{ path, member }] = classEntries;
      if (member) {
        const binding = `__${path.slice('./lib/'.length).replace(/\W/g, '_')}`;
        moduleImports.set(path, `import ${binding} from '${path}';`);
        memberImports.push(`import ${classMatch[1]} = ${binding}.${member};`);
      } else {
        classImports.push(`import ${classMatch[1]} from '${path}';`);
      }
    } else {
      optionImports.push(optionMatch[2]);
    }
  }

  kept.splice(
    kept.findIndex((line) => line.startsWith('declare ')),
    0,
    ...classImports,
    ...moduleImports.values(),
    ...memberImports,
    `import type { ${optionImports.join(', ')} } from './declarations/WebpackOptions';`,
    '',
  );
  writeFileSync(join(outputDir, ROOT_TYPES), kept.join('\n'));
  console.log(
    `Composed ${ROOT_TYPES}: ${classImports.length + memberImports.length} classes and ${optionImports.length} option types imported from per-file declarations.`,
  );
}

const BARE_IMPORT = /(?:from |import\()['"]([^'"./][^'"]*)['"]/g;

// Keep the type package's dependencies in step with the Webpack release, so
// imports such as `webpack-sources` resolve to the versions its types expect.
function syncTypeDependencies({ cloneDir, outputDir }) {
  const packageJsonPath = join(outputDir, 'package.json');
  // An --output directory other than the type package has no manifest.
  if (!existsSync(packageJsonPath)) return;
  const webpackDependencies =
    JSON.parse(readFileSync(join(cloneDir, 'package.json'), 'utf8'))
      .dependencies || {};
  const importedPackages = new Set();
  for (const relPath of collectDtsFiles(outputDir)) {
    const source = readFileSync(join(outputDir, relPath), 'utf8');
    for (const [, request] of source.matchAll(BARE_IMPORT)) {
      importedPackages.add(
        request
          .split('/')
          .slice(0, request.startsWith('@') ? 2 : 1)
          .join('/'),
      );
    }
  }
  const dependencies = Object.fromEntries(
    Object.entries(webpackDependencies)
      .filter(
        ([name]) =>
          !builtinModules.includes(name) &&
          (importedPackages.has(name) ||
            importedPackages.has(name.replace(/^@types\//, ''))),
      )
      .sort(([a], [b]) => a.localeCompare(b)),
  );
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  packageJson.dependencies = dependencies;
  writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
  console.log(
    `Set ${Object.keys(dependencies).length} type dependencies in package.json.`,
  );
}

function copyMappedDtsFiles({ outputDir, sourceByRelPath }) {
  for (const [relPath, sourcePath] of sourceByRelPath.entries()) {
    const targetPath = join(outputDir, relPath);
    mkdirSync(dirname(targetPath), { recursive: true });
    copyFileSync(sourcePath, targetPath);
  }
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  const repo = args.repo || DEFAULT_REPO;
  const ref = normalizeRef(args.ref, args.version);
  const outputDir = resolve(args.output || DEFAULT_OUTPUT);
  const { cloneDir, cleanupPath } = resolveCloneDir(args['clone-dir']);
  const keepClone = Boolean(args['keep-clone']);
  const skipInstall = Boolean(args['skip-install']);
  const skipGenerate = Boolean(args['skip-generate']);
  const clean = Boolean(args.clean);
  const dryRun = Boolean(args['dry-run']);
  const verbose = Boolean(args.verbose);

  if (existsSync(cloneDir)) {
    if (args['clone-dir']) {
      throw new Error(
        `Clone directory already exists: ${cloneDir}. Remove it or choose a different --clone-dir.`,
      );
    }
  }

  try {
    console.log(`Cloning webpack from ${repo}@${ref}...`);
    cloneWebpackRepo({ repo, ref, cloneDir, verbose });

    console.log('Generating declaration files in cloned webpack repo...');
    runWebpackTypeGeneration({
      cloneDir,
      skipInstall,
      skipGenerate,
      verbose,
    });

    const { emittedDir, emittedFiles } = emitUnbundledDtsFromJavascript({
      cloneDir,
    });
    const repoDtsFiles = collectDtsFiles(cloneDir)
      .filter(shouldIncludeDeclarationPath)
      .sort((a, b) => a.localeCompare(b));
    if (repoDtsFiles.length === 0) {
      throw new Error('No .d.ts files were produced. Aborting sync.');
    }

    const sourceByRelPath = new Map();
    for (const relPath of repoDtsFiles) {
      sourceByRelPath.set(relPath, join(cloneDir, relPath));
    }
    for (const relPath of emittedFiles.filter(shouldIncludeDeclarationPath)) {
      sourceByRelPath.set(relPath, join(emittedDir, relPath));
    }

    console.log(
      `Found ${repoDtsFiles.length} repo declarations + ${emittedFiles.length} emitted declarations (${sourceByRelPath.size} unique paths).`,
    );

    if (dryRun) {
      console.log(`[dry-run] Would sync declaration files into: ${outputDir}`);
      console.log(
        `[dry-run] First files:\n${Array.from(sourceByRelPath.keys())
          .sort((a, b) => a.localeCompare(b))
          .slice(0, 20)
          .join('\n')}`,
      );
    } else {
      if (clean) {
        cleanOutputDirectory(outputDir);
      } else {
        mkdirSync(outputDir, { recursive: true });
      }
      copyMappedDtsFiles({ outputDir, sourceByRelPath });
      composeRootTypes({
        bundledPath: join(cloneDir, ROOT_TYPES),
        outputDir,
      });
      syncTypeDependencies({ cloneDir, outputDir });
      console.log(`Synced ${sourceByRelPath.size} files into ${outputDir}.`);
    }

    if (keepClone) {
      console.log(`Preserving clone at ${cloneDir}`);
    }
  } finally {
    if (!keepClone) {
      rmSync(cleanupPath || cloneDir, { recursive: true, force: true });
    }
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
