#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, '../..');

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

  const changedFiles = getChangedFiles(baseRef, headRef);
  const changedPackagesWithTestImpact =
    getChangedPackagesWithTestImpact(changedFiles);
  if (changedPackagesWithTestImpact.length === 0) {
    console.log(
      `[affected-tests] No package test-impact changes detected (${baseRef}..${headRef}). Skipping affected package tests.`,
    );
    process.exit(0);
  }

  const affectedPackageTargets = getAffectedPackageTestTargets(
    baseRef,
    headRef,
  );
  const runnablePackageTargets = intersectSortedUnique(
    affectedPackageTargets,
    changedPackagesWithTestImpact,
  );
  if (runnablePackageTargets.length === 0) {
    console.log(
      `[affected-tests] No affected package turbo:test tasks detected (${baseRef}..${headRef}) after test-impact filtering.`,
    );
    process.exit(0);
  }

  console.log(
    `[affected-tests] Running turbo:test for ${runnablePackageTargets.length} affected package(s): ${runnablePackageTargets.join(', ')}`,
  );

  const args = ['exec', 'turbo', 'run', 'turbo:test'];
  for (const packageName of runnablePackageTargets) {
    args.push(`--filter=${packageName}`);
  }
  args.push('--concurrency=50%');

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

function getChangedPackagesWithTestImpact(changedFiles) {
  if (!Array.isArray(changedFiles) || changedFiles.length === 0) {
    return [];
  }

  const workspacePackages = getWorkspacePackages();
  if (workspacePackages.length === 0) {
    return [];
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
    relativeFilePath.startsWith('rstest.config.') ||
    relativeFilePath.startsWith('vite.config.') ||
    relativeFilePath.startsWith('tsconfig.spec')
  );
}

function getAffectedPackageTestTargets(baseRef, headRef) {
  const result = spawnSync(
    'pnpm',
    ['exec', 'turbo', 'run', 'turbo:test', '--affected', '--dry-run=json'],
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
      `[affected-tests] Failed to compute affected turbo:test graph from Turbo: ${result.stderr || result.stdout}`,
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
    if (taskName !== 'turbo:test' && !taskId.endsWith('#turbo:test')) {
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

function intersectSortedUnique(left, right) {
  const rightSet = new Set(Array.isArray(right) ? right : []);
  const intersection = [];

  for (const value of Array.isArray(left) ? left : []) {
    if (rightSet.has(value)) {
      intersection.push(value);
    }
  }

  return intersection;
}

function parseJsonFromTurboOutput(outputText) {
  const raw = outputText?.trim();
  if (!raw) {
    throw new Error('[affected-tests] Turbo dry-run output is empty.');
  }

  const directParse = tryParseJson(raw);
  if (directParse.ok) {
    return directParse.value;
  }

  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (char !== '{' && char !== '[') {
      continue;
    }

    const toEndParse = tryParseJson(raw.slice(index));
    if (toEndParse.ok) {
      return toEndParse.value;
    }

    const balancedCandidate = extractBalancedJson(raw, index);
    if (!balancedCandidate) {
      continue;
    }

    const balancedParse = tryParseJson(balancedCandidate);
    if (balancedParse.ok) {
      return balancedParse.value;
    }
  }

  throw new Error(
    '[affected-tests] Unable to locate JSON payload in Turbo output.',
  );
}

function tryParseJson(value) {
  try {
    return { ok: true, value: JSON.parse(value) };
  } catch {
    return { ok: false, value: null };
  }
}

function extractBalancedJson(text, startIndex) {
  const stack = [];
  let inString = false;
  let escaping = false;

  for (let index = startIndex; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaping) {
        escaping = false;
        continue;
      }
      if (char === '\\') {
        escaping = true;
        continue;
      }
      if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{') {
      stack.push('}');
      continue;
    }
    if (char === '[') {
      stack.push(']');
      continue;
    }
    if (char === '}' || char === ']') {
      const expected = stack.pop();
      if (expected !== char) {
        return null;
      }
      if (stack.length === 0) {
        return text.slice(startIndex, index + 1);
      }
    }
  }

  return null;
}

function normalizePath(filePath) {
  return filePath.replaceAll('\\', '/');
}
