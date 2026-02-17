#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DEFAULT_REPO = 'https://github.com/webpack/webpack.git';
const DEFAULT_OUTPUT = resolve(ROOT, 'webpack');
const UNBUNDLED_EMIT_DIR = '.mf-unbundled-dts';
const PRESERVE_OUTPUT_ENTRIES = new Set(['package.json']);
const SKIP_SCAN_DIRS = new Set(['.git', 'node_modules', UNBUNDLED_EMIT_DIR]);

function shouldIncludeDeclarationPath(relPath) {
  return !relPath.startsWith('test/');
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
  if (ref) {
    cloneArgs.push('--branch', ref);
  }
  cloneArgs.push(repo, cloneDir);
  runCommand('git', cloneArgs, { verbose });
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

  if (!skipGenerate) {
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

function emitUnbundledDtsFromJavascript({ cloneDir, verbose }) {
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
  const emitExitCode = runCommand(
    'node',
    ['node_modules/typescript/bin/tsc', '-p', tsconfigPath],
    {
      cwd: cloneDir,
      verbose,
      allowNonZeroExit: true,
    },
  );

  const emittedFiles = existsSync(emittedDir)
    ? collectDtsFiles(emittedDir).sort((a, b) => a.localeCompare(b))
    : [];
  if (emittedFiles.length === 0) {
    throw new Error('JS declaration emit produced no files.');
  }

  if (emitExitCode !== 0) {
    console.warn(
      `tsc finished with exit code ${emitExitCode}; continuing with emitted declaration files.`,
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
      verbose,
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
