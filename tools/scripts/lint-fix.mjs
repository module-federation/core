#!/usr/bin/env node
import { execSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, '../..');
const LINTABLE_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.mjs',
  '.cjs',
  '.mts',
  '.cts',
]);

main();

function main() {
  const changedFiles = getChangedFiles();
  if (changedFiles.length === 0) {
    console.log('[lint-fix] No uncommitted files to process.');
    return;
  }

  runPrettier(changedFiles);

  const changedPackages = getChangedPackages(changedFiles);
  if (changedPackages.length === 0) {
    console.log('[lint-fix] No workspace package changes detected.');
    return;
  }

  runTurboLint(changedPackages);
}

function getChangedFiles() {
  try {
    const trackedChanges = execSync(
      'git diff --name-only --diff-filter=ACMR HEAD',
      {
        cwd: ROOT,
        encoding: 'utf-8',
      },
    )
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean);
    const untrackedChanges = execSync(
      'git ls-files --others --exclude-standard',
      {
        cwd: ROOT,
        encoding: 'utf-8',
      },
    )
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean);
    return Array.from(new Set([...trackedChanges, ...untrackedChanges])).sort();
  } catch (error) {
    throw new Error(
      `[lint-fix] Unable to determine changed files: ${String(error)}`,
    );
  }
}

function runPrettier(changedFiles) {
  console.log(
    `[lint-fix] Formatting ${changedFiles.length} changed file(s) with Prettier...`,
  );
  runCommand('pnpm', [
    'exec',
    'prettier',
    '--write',
    '--ignore-unknown',
    ...changedFiles,
  ]);
}

function getChangedPackages(changedFiles) {
  const packages = new Set();

  for (const changedFile of changedFiles) {
    if (!shouldTriggerPackageLint(changedFile)) {
      continue;
    }

    const packageJsonPath = findNearestPackageJson(changedFile);
    if (!packageJsonPath) {
      continue;
    }

    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      if (
        typeof packageJson?.name === 'string' &&
        packageJson.name &&
        packageJson.name !== 'module-federation'
      ) {
        packages.add(packageJson.name);
      }
    } catch {
      // Ignore invalid package metadata.
    }
  }

  return Array.from(packages).sort();
}

function shouldTriggerPackageLint(relativeFilePath) {
  const fileName = basename(relativeFilePath);
  if (fileName === 'package.json') {
    return false;
  }

  if (
    fileName.startsWith('.eslintrc') ||
    fileName === 'eslint.config.js' ||
    fileName === 'eslint.config.cjs' ||
    fileName === 'eslint.config.mjs'
  ) {
    return true;
  }

  return LINTABLE_EXTENSIONS.has(extname(relativeFilePath));
}

function findNearestPackageJson(relativeFilePath) {
  let current = dirname(resolve(ROOT, relativeFilePath));

  while (current.startsWith(ROOT)) {
    const candidate = resolve(current, 'package.json');
    if (existsSync(candidate) && candidate !== resolve(ROOT, 'package.json')) {
      return candidate;
    }

    const parent = dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  return null;
}

function runTurboLint(packageNames) {
  console.log(
    `[lint-fix] Running turbo lint for ${packageNames.length} changed package(s)...`,
  );
  const args = ['exec', 'turbo', 'run', 'lint'];
  for (const packageName of packageNames) {
    args.push(`--filter=${packageName}`);
  }
  runCommand('pnpm', args);
}

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
