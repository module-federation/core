#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, '../..');

const requestedBase = parseBaseArg(process.argv.slice(2));
const baseRef = resolveBaseRef(requestedBase);

if (!baseRef) {
  console.warn(
    '[affected-tests] Unable to resolve base ref. Skipping affected package tests.',
  );
  process.exit(0);
}

const changedFiles = getChangedFiles(baseRef, 'HEAD');
const globalTestImpact = hasGlobalTestImpactChange(changedFiles);
const affectedPackages = globalTestImpact
  ? getAffectedPackageTestTargets(baseRef)
  : getPackageTestTargetsFromChanges(changedFiles);

if (affectedPackages.length === 0) {
  console.log(
    `[affected-tests] No affected package test targets detected (${baseRef}..HEAD) based on test-relevant changes.`,
  );
  process.exit(0);
}

console.log(
  `[affected-tests] Running tests for ${affectedPackages.length} affected package(s): ${affectedPackages.join(', ')}`,
);
const testArgs = ['exec', 'turbo', 'run', 'test'];
for (const packageName of affectedPackages) {
  testArgs.push(`--filter=${packageName}`);
}
const testRun = spawnSync('pnpm', testArgs, {
  cwd: ROOT,
  stdio: 'inherit',
  env: process.env,
});
process.exit(testRun.status ?? 1);

function parseBaseArg(argv) {
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--base' && argv[i + 1]) {
      return argv[i + 1];
    }
    if (token.startsWith('--base=')) {
      return token.slice('--base='.length);
    }
  }
  return null;
}

function resolveBaseRef(preferredRef) {
  if (hasGitRef(preferredRef)) {
    return preferredRef;
  }

  const refs = [];
  if (process.env.CI_BASE_REF) {
    refs.push(process.env.CI_BASE_REF);
  }
  if (process.env.CI_LOCAL_BASE_REF) {
    refs.push(process.env.CI_LOCAL_BASE_REF);
  }
  if (process.env.GITHUB_BASE_REF) {
    refs.push(`origin/${process.env.GITHUB_BASE_REF}`);
    refs.push(process.env.GITHUB_BASE_REF);
  }
  refs.push('origin/main', 'main', 'HEAD~1');

  for (const ref of refs) {
    if (hasGitRef(ref)) {
      return ref;
    }
  }
  return null;
}

function hasGitRef(ref) {
  if (!ref) {
    return false;
  }
  const result = spawnSync(
    'git',
    ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`],
    {
      cwd: ROOT,
      stdio: 'ignore',
    },
  );
  return result.status === 0;
}

function getChangedFiles(baseRef, headRef) {
  const result = spawnSync('git', ['diff', '--name-only', baseRef, headRef], {
    cwd: ROOT,
    stdio: 'pipe',
    encoding: 'utf-8',
  });
  if (result.status !== 0) {
    throw new Error(
      `[affected-tests] Failed to evaluate changed files for ${baseRef}..${headRef}: ${result.stderr || result.stdout}`,
    );
  }
  return result.stdout
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function hasGlobalTestImpactChange(changedFiles) {
  void changedFiles;
  return false;
}

function getPackageTestTargetsFromChanges(changedFiles) {
  const changedPackageNames = getChangedPackagesWithTestImpact(changedFiles);
  if (changedPackageNames.length === 0) {
    return [];
  }

  const filters = changedPackageNames.map(
    (packageName) => `--filter=${packageName}`,
  );
  const dryRunResult = runTurboDryRun(['test', ...filters, '--dry-run=json']);
  return parsePackageTestTargetsFromDryRun(dryRunResult.stdout);
}

function getChangedPackagesWithTestImpact(changedFiles) {
  const packageNames = new Set();
  const packageCache = new Map();
  for (const changedFile of changedFiles) {
    const packageInfo = resolvePackageForFile(changedFile, packageCache);
    if (!packageInfo) {
      continue;
    }
    const relativeFile = normalizePath(
      changedFile.slice(`${packageInfo.relativeRoot}/`.length),
    );
    if (!shouldTriggerPackageTests(relativeFile)) {
      continue;
    }
    packageNames.add(packageInfo.name);
  }
  return Array.from(packageNames).sort();
}

function resolvePackageForFile(changedFile, cache) {
  const normalizedPath = normalizePath(changedFile);
  if (!normalizedPath.startsWith('packages/')) {
    return null;
  }

  const absolutePath = resolve(ROOT, normalizedPath);
  let current = dirname(absolutePath);
  const packagesRoot = resolve(ROOT, 'packages');

  while (current.startsWith(packagesRoot)) {
    if (cache.has(current)) {
      return cache.get(current);
    }

    const packageJsonPath = resolve(current, 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        const relativeRoot = normalizePath(current.slice(ROOT.length + 1));
        const packageInfo =
          typeof packageJson?.name === 'string' && packageJson.name
            ? { name: packageJson.name, relativeRoot }
            : null;
        cache.set(current, packageInfo);
        return packageInfo;
      } catch {
        cache.set(current, null);
        return null;
      }
    }
    const parent = dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  return null;
}

function shouldTriggerPackageTests(relativeFilePath) {
  if (
    relativeFilePath.startsWith('src/') ||
    relativeFilePath.startsWith('test/') ||
    relativeFilePath.startsWith('tests/') ||
    relativeFilePath.startsWith('__tests__/')
  ) {
    return true;
  }

  if (/\.(spec|test)\.[cm]?[jt]sx?$/.test(relativeFilePath)) {
    return true;
  }

  return (
    relativeFilePath.startsWith('jest.config.') ||
    relativeFilePath.startsWith('vitest.config.') ||
    relativeFilePath.startsWith('vite.config.') ||
    relativeFilePath.startsWith('tsconfig.spec')
  );
}

function runTurboDryRun(runArgs) {
  const dryRunResult = spawnSync('pnpm', ['exec', 'turbo', 'run', ...runArgs], {
    cwd: ROOT,
    stdio: 'pipe',
    encoding: 'utf-8',
    env: process.env,
  });
  if (dryRunResult.status !== 0) {
    throw new Error(
      `[affected-tests] Failed to compute affected test graph from Turbo: ${dryRunResult.stderr || dryRunResult.stdout}`,
    );
  }
  return dryRunResult;
}

function getAffectedPackageTestTargets(baseRef) {
  const dryRunResult = runTurboDryRun([
    'test',
    `--filter=...[${baseRef}]`,
    '--dry-run=json',
  ]);
  return parsePackageTestTargetsFromDryRun(dryRunResult.stdout);
}

function parsePackageTestTargetsFromDryRun(outputText) {
  const output = outputText?.trim();
  if (!output) {
    return [];
  }

  const dryRunJson = JSON.parse(output);
  const tasks = Array.isArray(dryRunJson?.tasks) ? dryRunJson.tasks : [];
  const packageNames = new Set();
  for (const task of tasks) {
    if (!task || typeof task !== 'object') {
      continue;
    }
    if (typeof task.taskId !== 'string' || !task.taskId.endsWith('#test')) {
      continue;
    }
    if (typeof task.package !== 'string' || !task.package) {
      continue;
    }
    if (typeof task.directory !== 'string') {
      continue;
    }

    const taskDirectory = normalizePath(task.directory);
    if (!taskDirectory.startsWith('packages/')) {
      continue;
    }
    packageNames.add(task.package);
  }
  return Array.from(packageNames).sort();
}

function normalizePath(filePath) {
  return filePath.replaceAll('\\', '/');
}
