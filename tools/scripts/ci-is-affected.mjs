import { execSync } from 'child_process';
import yargs from 'yargs';

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

if (!base || !head) {
  // Fail open for uncertain git state so CI does not skip required e2e checks.
  console.warn(
    `Unable to resolve a valid base/head commit (base=${base}, head=${head}). Running e2e by default.`,
  );
  process.exit(0);
}

if (base === head) {
  // Same commit cannot produce an affected diff; run e2e to avoid false skips.
  console.warn(
    `Resolved base and head are identical (${base}). Running e2e by default.`,
  );
  process.exit(0);
}

let affectedProjectsOutput = [];
try {
  affectedProjectsOutput = execSync(
    `npx nx show projects --affected --base=${base} --head=${head}`,
  )
    .toString()
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean);
} catch (error) {
  console.warn(
    `Failed to evaluate affected projects for base=${base} head=${head}. Running e2e by default.`,
  );
  if (error instanceof Error) {
    console.warn(error.message);
  }
  process.exit(0);
}

const isAffected = affectedProjectsOutput.some((p) => appNames.includes(p));

if (isAffected) {
  console.log(
    `appNames: ${appNames} , base=${base} head=${head}, conditions met, executing e2e CI.`,
  );
  process.exit(0);
} else {
  console.log(
    `appNames: ${appNames} , base=${base} head=${head}, conditions not met, skipping e2e CI.`,
  );
  process.exit(1);
}
