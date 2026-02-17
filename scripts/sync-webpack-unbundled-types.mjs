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
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DEFAULT_REPO = 'https://github.com/webpack/webpack.git';
const DEFAULT_OUTPUT = resolve(ROOT, 'webpack');
const PRESERVE_OUTPUT_ENTRIES = new Set(['package.json']);
const SKIP_SCAN_DIRS = new Set(['.git', 'node_modules']);

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
  const { cwd = ROOT, verbose = false } = options;
  if (verbose) {
    console.log(`$ ${command} ${args.join(' ')}`);
  }

  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error(
      `Command failed (${result.status ?? 'unknown'}): ${command} ${args.join(' ')}`,
    );
  }
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

function runWebpackTypeGeneration({ cloneDir, skipInstall, skipGenerate, verbose }) {
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

function copyDtsFiles({ sourceRoot, outputDir, files }) {
  for (const relPath of files) {
    const sourcePath = join(sourceRoot, relPath);
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
  const dryRun = Boolean(args['dry-run']);
  const verbose = Boolean(args.verbose);

  if (existsSync(cloneDir)) {
    if (args['clone-dir']) {
      throw new Error(
        `Clone directory already exists: ${cloneDir}. Remove it or choose a different --clone-dir.`,
      );
    }
  }

  console.log(`Cloning webpack from ${repo}@${ref}...`);
  cloneWebpackRepo({ repo, ref, cloneDir, verbose });

  console.log('Generating declaration files in cloned webpack repo...');
  runWebpackTypeGeneration({
    cloneDir,
    skipInstall,
    skipGenerate,
    verbose,
  });

  const dtsFiles = collectDtsFiles(cloneDir).sort((a, b) => a.localeCompare(b));
  if (dtsFiles.length === 0) {
    throw new Error('No .d.ts files were produced. Aborting sync.');
  }

  console.log(`Found ${dtsFiles.length} declaration files in cloned repo.`);

  if (dryRun) {
    console.log(`[dry-run] Would sync declaration files into: ${outputDir}`);
    console.log(`[dry-run] First files:\n${dtsFiles.slice(0, 20).join('\n')}`);
  } else {
    cleanOutputDirectory(outputDir);
    copyDtsFiles({ sourceRoot: cloneDir, outputDir, files: dtsFiles });
    console.log(`Synced ${dtsFiles.length} files into ${outputDir}.`);
  }

  if (keepClone) {
    console.log(`Preserving clone at ${cloneDir}`);
  } else {
    rmSync(cleanupPath || cloneDir, { recursive: true, force: true });
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
