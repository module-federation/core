import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import yargs from 'yargs';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, '../..');

const argv = yargs(process.argv.slice(2))
  .option('appName', {
    type: 'string',
    demandOption: true,
  })
  .option('base', {
    type: 'string',
  })
  .option('head', {
    type: 'string',
  })
  .strict(false)
  .parseSync();

const appNames = argv.appName
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean);

if (appNames.length === 0) {
  console.log('No valid app names were provided.');
  process.exit(1);
}

const base = resolveBase(argv.base);
const head = resolveHead(argv.head);

if (!base || !head) {
  console.warn(
    `Unable to resolve a valid base/head commit (base=${base}, head=${head}). Running e2e by default.`,
  );
  process.exit(0);
}

if (base === head) {
  console.warn(
    `Resolved base and head are identical (${base}). Running e2e by default.`,
  );
  process.exit(0);
}

const turboResult = spawnSync(
  'pnpm',
  ['exec', 'turbo', 'ls', '--affected', '--output=json'],
  {
    cwd: ROOT,
    stdio: 'pipe',
    encoding: 'utf-8',
    maxBuffer: 1024 * 1024 * 64,
    env: {
      ...process.env,
      TURBO_SCM_BASE: base,
      TURBO_SCM_HEAD: head,
    },
  },
);

if (turboResult.status !== 0) {
  console.warn(
    `Failed to evaluate Turbo affected packages for base=${base} head=${head}. Running e2e by default.`,
  );
  if (turboResult.stderr?.trim()) {
    console.warn(turboResult.stderr.trim());
  } else if (turboResult.stdout?.trim()) {
    console.warn(turboResult.stdout.trim());
  }
  process.exit(0);
}

let affectedPackageNames;
try {
  affectedPackageNames = parseAffectedPackages(turboResult.stdout ?? '');
} catch {
  try {
    affectedPackageNames = parseAffectedPackages(
      `${turboResult.stdout ?? ''}\n${turboResult.stderr ?? ''}`,
    );
  } catch {
    console.warn(
      `Unable to parse Turbo affected output for base=${base} head=${head}. Running e2e by default.`,
    );
    process.exit(0);
  }
}

const matchableAffectedNames = new Set();
for (const packageName of affectedPackageNames) {
  matchableAffectedNames.add(packageName);
  const unscoped = toUnscopedName(packageName);
  if (unscoped) {
    matchableAffectedNames.add(unscoped);
  }
}

const isAffected = appNames.some((name) => matchableAffectedNames.has(name));

if (isAffected) {
  console.log(
    `appNames: ${appNames.join(',')} , base=${base} head=${head}, conditions met, executing e2e CI.`,
  );
  process.exit(0);
}

console.log(
  `appNames: ${appNames.join(',')} , base=${base} head=${head}, conditions not met, skipping e2e CI.`,
);
process.exit(1);

function hasGitRef(ref) {
  if (!ref || !ref.trim()) {
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

function resolveBase(requestedBase) {
  const candidates = [
    ...expandRefCandidates(requestedBase),
    ...expandRefCandidates(process.env.CI_LOCAL_BASE_REF),
    ...expandRefCandidates(process.env.CI_BASE_REF),
    ...expandRefCandidates(process.env.GITHUB_BASE_REF),
    'origin/main',
    'main',
    'HEAD~1',
  ];

  for (const candidate of candidates) {
    if (hasGitRef(candidate)) {
      return candidate;
    }
  }
  return null;
}

function resolveHead(requestedHead) {
  const candidates = [
    ...expandRefCandidates(requestedHead),
    ...expandRefCandidates(process.env.CI_LOCAL_HEAD_REF),
    ...expandRefCandidates(process.env.CI_HEAD_REF),
    ...expandRefCandidates(process.env.GITHUB_SHA),
    'HEAD',
  ];

  for (const candidate of candidates) {
    if (hasGitRef(candidate)) {
      return candidate;
    }
  }
  return null;
}

function expandRefCandidates(ref) {
  if (!ref || !ref.trim()) {
    return [];
  }

  const normalized = ref.trim();
  const candidates = new Set([normalized]);

  if (normalized.startsWith('refs/heads/')) {
    const branchName = normalized.slice('refs/heads/'.length);
    if (branchName) {
      candidates.add(branchName);
      candidates.add(`origin/${branchName}`);
    }
  } else if (normalized.startsWith('origin/')) {
    const localBranch = normalized.slice('origin/'.length);
    if (localBranch) {
      candidates.add(localBranch);
    }
  } else {
    candidates.add(`origin/${normalized}`);
  }

  return Array.from(candidates);
}

function parseAffectedPackages(outputText) {
  const payload = parseJsonFromTurboOutput(outputText);
  const packageNames = new Set();

  if (Array.isArray(payload)) {
    collectPackageNamesFromList(payload, packageNames);
    return packageNames;
  }

  if (!payload || typeof payload !== 'object') {
    return packageNames;
  }

  if (Array.isArray(payload.items)) {
    collectPackageNamesFromList(payload.items, packageNames);
  }

  if ('packages' in payload) {
    collectPackageNamesFromContainer(payload.packages, packageNames);
  }

  if (packageNames.size === 0 && typeof payload.name === 'string') {
    addPackageName(payload.name, packageNames);
  }

  return packageNames;
}

function collectPackageNamesFromContainer(container, packageNames) {
  if (!container) {
    return;
  }

  if (Array.isArray(container)) {
    collectPackageNamesFromList(container, packageNames);
    return;
  }

  if (typeof container !== 'object') {
    return;
  }

  if (typeof container.name === 'string') {
    addPackageName(container.name, packageNames);
  }

  if (Array.isArray(container.items)) {
    collectPackageNamesFromList(container.items, packageNames);
  }

  if (Array.isArray(container.packages)) {
    collectPackageNamesFromList(container.packages, packageNames);
  }

  for (const [key, value] of Object.entries(container)) {
    const valueLooksLikePackageEntry =
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      ('path' in value || 'name' in value || 'package' in value);

    if (valueLooksLikePackageEntry && isPackageNameCandidate(key)) {
      packageNames.add(key);
    }
    if (value && typeof value === 'object' && typeof value.name === 'string') {
      addPackageName(value.name, packageNames);
    }
  }
}

function collectPackageNamesFromList(list, packageNames) {
  for (const entry of list) {
    if (typeof entry === 'string') {
      addPackageName(entry, packageNames);
      continue;
    }
    if (!entry || typeof entry !== 'object') {
      continue;
    }

    if (typeof entry.name === 'string') {
      addPackageName(entry.name, packageNames);
      continue;
    }

    if (typeof entry.package === 'string') {
      addPackageName(entry.package, packageNames);
      continue;
    }

    if (Array.isArray(entry.items)) {
      collectPackageNamesFromList(entry.items, packageNames);
    }
  }
}

function addPackageName(name, packageNames) {
  if (isPackageNameCandidate(name)) {
    packageNames.add(name);
  }
}

function isPackageNameCandidate(value) {
  if (typeof value !== 'string') {
    return false;
  }
  if (!value || value === '//') {
    return false;
  }
  if (value.includes('#') || value.includes('\\') || value.includes(' ')) {
    return false;
  }
  if (value.startsWith('@')) {
    return /^@[^/]+\/[^/]+$/.test(value);
  }
  return !value.includes('/');
}

function toUnscopedName(value) {
  if (typeof value !== 'string' || !value.startsWith('@')) {
    return null;
  }
  const [, unscoped] = value.split('/');
  return unscoped || null;
}

function parseJsonFromTurboOutput(outputText) {
  const raw = outputText?.trim();
  if (!raw) {
    throw new Error('Turbo output is empty.');
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

  throw new Error('Unable to locate JSON payload in Turbo output.');
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
