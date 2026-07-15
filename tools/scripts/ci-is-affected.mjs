import { spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import yargs from 'yargs';
import { hasGitRef as hasGitRefInRepo } from './turbo-script-utils.mjs';
import {
  computeE2ESuiteDecisions,
  isAppNameAffected,
  isE2ESuiteInput,
  isGlobalE2EInput,
  parseAffectedPackages,
} from './ci-e2e-affected.mjs';
import {
  E2E_SUITES,
  normalizeAppNames,
  serializeAppNames,
} from './ci-e2e-suites.mjs';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, '../..');
const argv = yargs(process.argv.slice(2))
  .option('appName', {
    type: 'string',
    describe:
      'Comma-separated package/app names. Prefer --e2eSuite for built-in e2e suites.',
  })
  .option('e2eSuite', {
    type: 'string',
    describe:
      'Named e2e suite from tools/scripts/ci-e2e-suites.mjs. Used to keep workflows and ci-local aligned.',
  })
  .option('base', {
    type: 'string',
  })
  .option('head', {
    type: 'string',
  })
  .option('githubOutput', {
    type: 'string',
    describe:
      'Write the decision to $GITHUB_OUTPUT under this key (as true/false) and exit 0, instead of signaling via exit code.',
  })
  .option('githubOutputAll', {
    type: 'string',
    describe:
      'Write all named suite decisions as one JSON object to $GITHUB_OUTPUT under this key.',
  })
  .strict(false)
  .parseSync();

// Decision exits: without --githubOutput, exit 0 means "run e2e" and exit 1
// means "skip" (consumed by ci-local.mjs and shell-translated workflow
// steps). With --githubOutput, the decision is written to $GITHUB_OUTPUT and
// the process exits 0 either way, so genuine crashes (nonzero without
// output) fail the workflow step instead of silently skipping e2e.
function decide(runE2E) {
  if (argv.githubOutput) {
    if (!process.env.GITHUB_OUTPUT) {
      console.error('--githubOutput was passed but GITHUB_OUTPUT is not set.');
      process.exit(2);
    }
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `${argv.githubOutput}=${runE2E ? 'true' : 'false'}\n`,
    );
    process.exit(0);
  }
  process.exit(runE2E ? 0 : 1);
}

function decideAll(decisions) {
  if (!argv.githubOutputAll) {
    console.error('--githubOutputAll requires an output key.');
    process.exit(2);
  }
  if (!process.env.GITHUB_OUTPUT) {
    console.error('--githubOutputAll was passed but GITHUB_OUTPUT is not set.');
    process.exit(2);
  }
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    `${argv.githubOutputAll}=${JSON.stringify(decisions)}\n`,
  );
  process.exit(0);
}

const allSuitesMode = Boolean(argv.githubOutputAll);
if (allSuitesMode && (argv.appName || argv.e2eSuite || argv.githubOutput)) {
  console.error(
    '--githubOutputAll cannot be combined with --appName, --e2eSuite, or --githubOutput.',
  );
  process.exit(2);
}

const rawAppNames = allSuitesMode
  ? []
  : argv.appName
    ? normalizeAppNames(argv.appName)
    : (E2E_SUITES[argv.e2eSuite] ?? null);
if (argv.e2eSuite && !rawAppNames) {
  console.error(`Unknown e2e suite: ${argv.e2eSuite}`);
  process.exit(2);
}

const appNames = normalizeAppNames(rawAppNames);

if (!allSuitesMode && appNames.length === 0) {
  console.error('No valid app names were provided.');
  process.exit(2);
}

const base = resolveBase(argv.base);
const head = resolveHead(argv.head);

if (!base || !head) {
  console.warn(
    `Unable to resolve a valid base/head commit (base=${base}, head=${head}). Running e2e by default.`,
  );
  decideFailOpen();
}

if (base === head) {
  console.warn(
    `Resolved base and head are identical (${base}). Running e2e by default.`,
  );
  decideFailOpen();
}

const changedFiles = listChangedFiles(base, head);

if (!changedFiles) {
  console.warn(
    `Unable to resolve changed files for base=${base} head=${head}. Running e2e by default.`,
  );
  decideFailOpen();
}

const changedGlobalE2EInputs = changedFiles.filter(isGlobalE2EInput);

if (changedGlobalE2EInputs.length > 0) {
  console.log(
    `Detected shared e2e harness changes (${changedGlobalE2EInputs.join(', ')}). Running e2e CI.`,
  );
  decideFailOpen();
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
  decideFailOpen();
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
    decideFailOpen();
  }
}

if (allSuitesMode) {
  const decisions = computeE2ESuiteDecisions({
    affectedPackageNames,
    changedFiles,
  });
  console.log(`E2E suite decisions: ${JSON.stringify(decisions)}`);
  decideAll(decisions);
}

const isAffected =
  (argv.e2eSuite &&
    changedFiles.some((file) => isE2ESuiteInput(argv.e2eSuite, file))) ||
  isAppNameAffected(appNames, affectedPackageNames);

if (isAffected) {
  console.log(
    `appNames: ${serializeAppNames(appNames)} , base=${base} head=${head}, conditions met, executing e2e CI.`,
  );
  decide(true);
}

console.log(
  `appNames: ${serializeAppNames(appNames)} , base=${base} head=${head}, conditions not met, skipping e2e CI.`,
);
decide(false);

function decideFailOpen() {
  if (allSuitesMode) {
    decideAll(
      Object.fromEntries(Object.keys(E2E_SUITES).map((suite) => [suite, true])),
    );
  }
  decide(true);
}

function hasGitRef(ref) {
  return hasGitRefInRepo(ROOT, ref);
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

function listChangedFiles(baseRef, headRef) {
  const result = spawnSync(
    'git',
    // Compare PR-introduced changes only: merge-base(baseRef, headRef)..headRef.
    ['diff', '--name-only', '--diff-filter=ACMRD', `${baseRef}...${headRef}`],
    {
      cwd: ROOT,
      stdio: 'pipe',
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 * 8,
    },
  );

  if (result.status !== 0) {
    return null;
  }

  return result.stdout
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean);
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
