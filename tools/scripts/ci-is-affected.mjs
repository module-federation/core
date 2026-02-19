import { execFileSync } from 'node:child_process';
import fs from 'fs';
import yargs from 'yargs';

let { appName, base, head } = yargs(process.argv).argv;

const readEventShas = () => {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) return {};
  try {
    const raw = fs.readFileSync(eventPath, 'utf8');
    const event = JSON.parse(raw);
    const pr = event.pull_request || event.pullRequest;
    if (pr?.base?.sha && pr?.head?.sha) {
      return { base: pr.base.sha, head: pr.head.sha };
    }
    if (event?.merge_group?.base_sha && event?.merge_group?.head_sha) {
      return {
        base: event.merge_group.base_sha,
        head: event.merge_group.head_sha,
      };
    }
  } catch {
    // ignore parsing errors; fallback handled later
  }
  return {};
};

const isValidRef = (ref) => {
  if (!ref) return false;
  try {
    execFileSync(
      'git',
      ['rev-parse', '--verify', '--quiet', '--', `${ref}^{commit}`],
      { stdio: 'ignore' },
    );
    return true;
  } catch {
    return false;
  }
};

const pickFirstValidRef = (refs) => refs.find((ref) => isValidRef(ref));

const eventShas = readEventShas();
const envBase = process.env.NX_BASE;
const envHead = process.env.NX_HEAD;
const ghSha = process.env.GITHUB_SHA;

const baseCandidates = [
  base,
  envBase,
  eventShas.base,
  'origin/main',
  'main',
  'HEAD~1',
].filter(Boolean);
const headCandidates = [head, envHead, eventShas.head, ghSha, 'HEAD'].filter(
  Boolean,
);

base = pickFirstValidRef(baseCandidates) || 'HEAD';
head = pickFirstValidRef(headCandidates) || 'HEAD';

let { appName, base, head } = argv;

const hasGitRef = (ref) => {
  if (!ref) {
    return false;
  }
  try {
    execSync(`git rev-parse --verify --quiet "${ref}^{commit}"`, {
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
};

const resolveBase = (requestedBase) => {
  if (hasGitRef(requestedBase)) {
    return requestedBase;
  }
  if (hasGitRef(process.env.NX_BASE)) {
    return process.env.NX_BASE;
  }
  if (hasGitRef('origin/main')) {
    return 'origin/main';
  }
  if (hasGitRef('main')) {
    return 'main';
  }
  if (hasGitRef('HEAD~1')) {
    return 'HEAD~1';
  }
  return null;
};

const resolveHead = (requestedHead) => {
  if (hasGitRef(requestedHead)) {
    return requestedHead;
  }
  if (hasGitRef(process.env.NX_HEAD)) {
    return process.env.NX_HEAD;
  }
  if (hasGitRef('HEAD')) {
    return 'HEAD';
  }
  return null;
};

base = resolveBase(base);
head = resolveHead(head);

const appNames = appName
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean);

if (appNames.length === 0) {
  console.log('No valid app names were provided.');
  process.exit(1);
}

let isAffected = true;
try {
  isAffected = execFileSync(
    'npx',
    [
      'nx',
      'show',
      'projects',
      '--affected',
      `--base=${base}`,
      `--head=${head}`,
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  )
    .toString()
    .split('\n')
    .map((p) => p.trim())
    .map((p) => appNames.includes(p))
    .some((included) => !!included);
} catch (error) {
  console.warn(
    `[ci-is-affected] Failed to determine affected projects (base=${base}, head=${head}).`,
  );
  console.warn(error?.message || error);
  // Be conservative: run e2e if we can't determine impact.
  isAffected = true;
}

const affected = isAffected === true;
const outputFile = process.env.GITHUB_OUTPUT;
if (outputFile) {
  try {
    fs.appendFileSync(outputFile, `affected=${affected}\n`);
  } catch (error) {
    console.warn('[ci-is-affected] Failed to write GitHub output.');
    console.warn(error?.message || error);
  }
}

if (affected) {
  console.log(`appNames: ${appNames} , conditions met, executing e2e CI.`);
  process.exit(0);
}

console.log(`appNames: ${appNames} , conditions not met, skipping e2e CI.`);
// Avoid failing CI when a check is intentionally skipped.
if (process.env.GITHUB_ACTIONS) {
  process.exit(0);
}
process.exit(1);
