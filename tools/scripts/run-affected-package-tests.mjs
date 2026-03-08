#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  hasGitRef as hasGitRefInRepo,
  listChangedFiles,
  parseJsonFromTurboOutput,
  resolveGitCommit as resolveGitCommitInRepo,
} from './turbo-script-utils.mjs';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, '../..');
const EXCLUDED_AFFECTED_TEST_PACKAGES = new Set([
  '@module-federation/treeshake-frontend',
  '@module-federation/treeshake-server',
]);

main();

function main() {
  const requestedBase = parseBaseArg(process.argv.slice(2));
  const baseRef = resolveBaseRef(requestedBase);
  const headRef = 'HEAD';

  if (!baseRef) {
    console.warn(
      '[affected-tests] Unable to resolve base ref. Skipping affected package tests.',
    );
    process.exit(0);
  }

  if (!hasGitRef(headRef)) {
    console.warn(
      '[affected-tests] Unable to resolve head ref. Skipping affected package tests.',
    );
    process.exit(0);
  }

  const changedFiles = listChangedFiles(ROOT, baseRef, headRef, {
    errorPrefix: '[affected-tests] Failed to evaluate changed files',
  });
  const testImpactRoots = getChangedPackagesWithTestImpact(changedFiles);
  const affectedPackageTargets = getAffectedPackageTestTargets(
    baseRef,
    headRef,
  );
  const combinedTargets = mergeAffectedTargets(
    testImpactRoots,
    affectedPackageTargets,
  );
  const filteredTargets = combinedTargets.filter(
    (packageName) => !EXCLUDED_AFFECTED_TEST_PACKAGES.has(packageName),
  );
  const excludedTargets = combinedTargets.filter((packageName) =>
    EXCLUDED_AFFECTED_TEST_PACKAGES.has(packageName),
  );
  if (filteredTargets.length === 0) {
    console.log(
      `[affected-tests] No affected package test tasks detected (${baseRef}..${headRef}). Skipping affected package tests.`,
    );
    process.exit(0);
  }

  if (excludedTargets.length > 0) {
    console.log(
      `[affected-tests] Skipping packages covered by dedicated CI workflows: ${excludedTargets.join(', ')}`,
    );
  }

  console.log(
    `[affected-tests] Running turbo test for ${filteredTargets.length} affected package(s) from ${testImpactRoots.length} impact root(s): ${filteredTargets.join(', ')}`,
  );

  const args = ['exec', 'turbo', 'run', 'test'];
  for (const packageName of filteredTargets) {
    args.push(`--filter=${packageName}`);
  }
  args.push('--concurrency=20');

  const testRun = spawnSync('pnpm', args, {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  });

  process.exit(testRun.status ?? 1);
}

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
  const headCommit = resolveGitCommit('HEAD');
  if (hasGitRef(preferredRef)) {
    const preferredCommit = resolveGitCommit(preferredRef);
    if (!headCommit || preferredCommit !== headCommit) {
      return preferredRef;
    }
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
      const candidateCommit = resolveGitCommit(ref);
      if (!headCommit || candidateCommit !== headCommit) {
        return ref;
      }
    }
  }

  for (const ref of getPreviousCommitCandidates()) {
    if (hasGitRef(ref)) {
      const candidateCommit = resolveGitCommit(ref);
      if (!headCommit || candidateCommit !== headCommit) {
        return ref;
      }
    }
  }

  return null;
}

function hasGitRef(ref) {
  return hasGitRefInRepo(ROOT, ref);
}

function resolveGitCommit(ref) {
  return resolveGitCommitInRepo(ROOT, ref);
}

function getChangedPackagesWithTestImpact(changedFiles) {
  if (!Array.isArray(changedFiles) || changedFiles.length === 0) {
    return [];
  }

  const workspacePackages = getWorkspacePackages();
  if (workspacePackages.length === 0) {
    return [];
  }

  if (hasGlobalPackageTestImpact(changedFiles)) {
    return workspacePackages.map((packageInfo) => packageInfo.name).sort();
  }

  const changedPackageNames = new Set();

  for (const changedFile of changedFiles) {
    const normalizedPath = normalizePath(changedFile);
    const packageInfo = resolvePackageForPath(
      normalizedPath,
      workspacePackages,
    );
    if (!packageInfo) {
      continue;
    }

    const relativeFilePath = getRelativePathWithinPackage(
      normalizedPath,
      packageInfo.path,
    );
    if (!relativeFilePath || !shouldTriggerPackageTests(relativeFilePath)) {
      continue;
    }

    changedPackageNames.add(packageInfo.name);
  }

  return Array.from(changedPackageNames).sort();
}

function hasGlobalPackageTestImpact(changedFiles) {
  return changedFiles.some((changedFile) =>
    isGlobalPackageTestImpactPath(normalizePath(changedFile)),
  );
}

function isGlobalPackageTestImpactPath(changedFilePath) {
  return (
    changedFilePath === 'package.json' ||
    changedFilePath === 'pnpm-lock.yaml' ||
    changedFilePath === 'pnpm-workspace.yaml' ||
    changedFilePath === 'turbo.json' ||
    changedFilePath === 'tsconfig.base.json' ||
    changedFilePath.startsWith('scripts/') ||
    changedFilePath.startsWith('tools/scripts/') ||
    /^jest\.(?:preset|config)\.[cm]?[jt]s$/.test(changedFilePath) ||
    /^babel\.config\.(?:json|[cm]?[jt]s)$/.test(changedFilePath)
  );
}

function getPreviousCommitCandidates() {
  const refs = new Set();

  if (process.env.GITHUB_EVENT_BEFORE) {
    refs.add(process.env.GITHUB_EVENT_BEFORE);
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (eventPath) {
    try {
      const payload = JSON.parse(readFileSync(eventPath, 'utf-8'));
      if (typeof payload?.before === 'string' && payload.before) {
        refs.add(payload.before);
      }
    } catch {
      // Ignore invalid GitHub event payloads.
    }
  }

  refs.add('HEAD~1');

  return Array.from(refs);
}

function getWorkspacePackages() {
  const result = spawnSync(
    'pnpm',
    ['exec', 'turbo', 'ls', '--filter=./packages/**', '--output=json'],
    {
      cwd: ROOT,
      stdio: 'pipe',
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 * 64,
      env: process.env,
    },
  );

  if (result.status !== 0) {
    throw new Error(
      `[affected-tests] Failed to list workspace packages from Turbo: ${result.stderr || result.stdout}`,
    );
  }

  const payload = parseJsonFromTurboOutput(result.stdout ?? '');
  const items = Array.isArray(payload?.packages?.items)
    ? payload.packages.items
    : [];

  return items
    .filter(
      (entry) =>
        entry &&
        typeof entry.name === 'string' &&
        entry.name &&
        typeof entry.path === 'string' &&
        entry.path,
    )
    .map((entry) => ({
      name: entry.name,
      path: normalizePath(entry.path).replace(/\/+$/, ''),
    }))
    .sort((a, b) => b.path.length - a.path.length);
}

function resolvePackageForPath(changedFilePath, workspacePackages) {
  for (const packageInfo of workspacePackages) {
    if (
      changedFilePath === packageInfo.path ||
      changedFilePath.startsWith(`${packageInfo.path}/`)
    ) {
      return packageInfo;
    }
  }
  return null;
}

function getRelativePathWithinPackage(changedFilePath, packagePath) {
  if (changedFilePath === packagePath) {
    return '';
  }
  if (!changedFilePath.startsWith(`${packagePath}/`)) {
    return null;
  }
  return changedFilePath.slice(packagePath.length + 1);
}

function shouldTriggerPackageTests(relativeFilePath) {
  if (!relativeFilePath) {
    return false;
  }

  // Default to "impacting" for package-local changes to avoid false negatives.
  // Only skip obvious root-level documentation/legal metadata files.
  const segments = relativeFilePath.split('/');
  if (segments.length === 1) {
    const fileName = segments[0];
    if (
      /^(?:README|CHANGELOG|LICENSE|NOTICE|AUTHORS|CONTRIBUTING|CODEOWNERS)(?:\..+)?$/i.test(
        fileName,
      )
    ) {
      return false;
    }
  }

  return true;
}

function getAffectedPackageTestTargets(baseRef, headRef) {
  const result = spawnSync(
    'pnpm',
    ['exec', 'turbo', 'run', 'test', '--affected', '--dry-run=json'],
    {
      cwd: ROOT,
      stdio: 'pipe',
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 * 128,
      env: {
        ...process.env,
        TURBO_SCM_BASE: baseRef,
        TURBO_SCM_HEAD: headRef,
      },
    },
  );

  if (result.status !== 0) {
    throw new Error(
      `[affected-tests] Failed to compute affected test graph from Turbo: ${result.stderr || result.stdout}`,
    );
  }

  let dryRunJson;
  try {
    dryRunJson = parseJsonFromTurboOutput(result.stdout ?? '');
  } catch {
    dryRunJson = parseJsonFromTurboOutput(
      `${result.stdout ?? ''}\n${result.stderr ?? ''}`,
    );
  }
  const tasks = Array.isArray(dryRunJson?.tasks) ? dryRunJson.tasks : [];
  const packageNames = new Set();

  for (const task of tasks) {
    if (!task || typeof task !== 'object') {
      continue;
    }

    const taskId = typeof task.taskId === 'string' ? task.taskId : '';
    const taskName = typeof task.task === 'string' ? task.task : '';
    if (taskName !== 'test' && !taskId.endsWith('#test')) {
      continue;
    }

    if (typeof task.directory !== 'string') {
      continue;
    }
    const taskDirectory = normalizePath(task.directory);
    if (!taskDirectory.startsWith('packages/')) {
      continue;
    }

    if (typeof task.package === 'string' && task.package) {
      packageNames.add(task.package);
      continue;
    }

    const [taskPackageName] = taskId.split('#');
    if (taskPackageName) {
      packageNames.add(taskPackageName);
    }
  }

  return Array.from(packageNames).sort();
}

function normalizePath(filePath) {
  return filePath.replaceAll('\\', '/');
}

function mergeAffectedTargets(testImpactRoots, affectedTargets) {
  const combined = new Set();
  for (const value of testImpactRoots ?? []) {
    if (value) {
      combined.add(value);
    }
  }
  for (const value of affectedTargets ?? []) {
    if (value) {
      combined.add(value);
    }
  }
  return Array.from(combined).sort();
}
