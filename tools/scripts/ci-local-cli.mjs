export function parseArgs(argv) {
  const result = {
    help: false,
    list: false,
    only: null,
    onlyTokens: [],
    printParity: false,
    skipCache: false,
    strictParity: false,
    errors: [],
    unknownArgs: [],
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--list') {
      result.list = true;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      result.help = true;
      continue;
    }
    if (arg === '--only') {
      const onlyValue = argv[i + 1];
      if (!onlyValue || onlyValue.startsWith('--')) {
        result.errors.push('Missing value for --only.');
        continue;
      }
      result.onlyTokens.push(onlyValue);
      i += 1;
      continue;
    }
    if (arg.startsWith('--only=')) {
      result.onlyTokens.push(arg.slice('--only='.length));
      continue;
    }
    if (arg === '--print-parity') {
      result.printParity = true;
      continue;
    }
    if (arg === '--skip-cache') {
      result.skipCache = true;
      continue;
    }
    if (arg === '--strict-parity') {
      result.strictParity = true;
      continue;
    }
    result.unknownArgs.push(arg);
  }
  if (result.onlyTokens.length > 0) {
    result.only = result.onlyTokens.join(',');
  }
  delete result.onlyTokens;
  return result;
}

export function getOnlyJobNames(args) {
  if (!args.only) {
    return [];
  }
  return Array.from(
    new Set(
      args.only
        .split(',')
        .map((job) => job.trim())
        .filter(Boolean),
    ),
  );
}

export function getSelectableJobNames(jobList) {
  const names = new Set();
  for (const job of jobList) {
    names.add(job.name);
    if (job.matrix?.length) {
      for (const entry of job.matrix) {
        names.add(formatMatrixJobName(job.name, entry));
      }
    }
  }
  return names;
}

export function validateArgs({
  args,
  onlyJobNames,
  onlyJobs,
  selectableJobNames,
}) {
  const issues = [];

  if (args.errors.length > 0) {
    issues.push(...args.errors);
  }

  if (args.unknownArgs.length > 0) {
    issues.push(
      `Unknown option(s): ${args.unknownArgs.join(', ')}. Use --help to see supported flags.`,
    );
  }

  if (args.only !== null && onlyJobNames.length === 0) {
    issues.push(
      'The --only option requires at least one job name (use --list to inspect available jobs).',
    );
  }

  if (onlyJobs) {
    const unknownJobNames = onlyJobNames.filter(
      (jobName) => !selectableJobNames.has(jobName),
    );
    if (unknownJobNames.length > 0) {
      issues.push(
        `Unknown job(s) in --only: ${unknownJobNames.join(', ')}. Use --list to inspect available jobs.`,
      );
    }
  }

  if (issues.length > 0) {
    throw new Error(`[ci:local] ${issues.join(' ')}`);
  }
}

export function shouldRunJob(job, onlyJobs) {
  if (!onlyJobs) {
    return true;
  }
  if (onlyJobs.has(job.name)) {
    return true;
  }
  if (job.matrix?.length) {
    return job.matrix.some((entry) =>
      onlyJobs.has(formatMatrixJobName(job.name, entry)),
    );
  }
  return false;
}

export function listJobs(jobList, { onlyJobs, selectableJobNames }) {
  console.log('ci:local job list:');
  if (onlyJobs) {
    console.log(
      `[ci:local] Listing filtered jobs: ${Array.from(onlyJobs).join(', ')}`,
    );
  }
  let listedCount = 0;
  for (const job of jobList) {
    if (job.matrix?.length) {
      const includeAllEntries = !onlyJobs || onlyJobs.has(job.name);
      if (!includeAllEntries) {
        const hasMatchingEntry = job.matrix.some((entry) =>
          onlyJobs.has(formatMatrixJobName(job.name, entry)),
        );
        if (!hasMatchingEntry) {
          continue;
        }
      }
      for (const entry of job.matrix) {
        const entryName = formatMatrixJobName(job.name, entry);
        if (!includeAllEntries && onlyJobs && !onlyJobs.has(entryName)) {
          continue;
        }
        console.log(`- ${formatJobListEntry({ name: entryName })}`);
        listedCount += 1;
      }
    } else {
      if (onlyJobs && !onlyJobs.has(job.name)) {
        continue;
      }
      console.log(`- ${formatJobListEntry(job)}`);
      listedCount += 1;
    }
  }
  if (listedCount === 0) {
    console.log('(no matching jobs)');
  }
  if (onlyJobs) {
    console.log(
      `[ci:local] Matched ${listedCount} of ${selectableJobNames.size} selectable jobs.`,
    );
  } else {
    console.log(`[ci:local] Listed ${listedCount} selectable jobs.`);
  }
  console.log('\nUse --only=job1,job2 to run a subset.');
}

export function preflight({
  args,
  detectPnpmVersion,
  expectedNodeMajor,
  expectedPnpmVersion,
}) {
  const nodeMajor = Number(process.versions.node.split('.')[0]);
  const parityIssues = [];
  if (nodeMajor !== expectedNodeMajor) {
    parityIssues.push(
      `node ${process.versions.node} (expected major ${expectedNodeMajor})`,
    );
    const pnpmVersionForHint = expectedPnpmVersion ?? '10.28.0';
    console.warn(
      `[ci:local] Warning: running with Node ${process.versions.node}. CI runs with Node ${expectedNodeMajor}.`,
    );
    console.warn(
      `[ci:local] For closest parity run: source "$HOME/.nvm/nvm.sh" && nvm use ${expectedNodeMajor} && corepack enable && corepack prepare pnpm@${pnpmVersionForHint} --activate`,
    );
  }

  const pnpmCheck = detectPnpmVersion();
  if (pnpmCheck.status !== 0) {
    throw new Error(
      '[ci:local] pnpm not found in PATH. Install/activate pnpm before running ci-local.',
    );
  }

  const pnpmVersion = (pnpmCheck.stdout ?? '').trim();
  if (expectedPnpmVersion && pnpmVersion !== expectedPnpmVersion) {
    parityIssues.push(`pnpm ${pnpmVersion} (expected ${expectedPnpmVersion})`);
    console.warn(
      `[ci:local] Warning: running with pnpm ${pnpmVersion}. CI parity target is pnpm ${expectedPnpmVersion}.`,
    );
    console.warn(
      `[ci:local] For closest parity run: corepack enable && corepack prepare pnpm@${expectedPnpmVersion} --activate`,
    );
  }

  if (args.strictParity && parityIssues.length > 0) {
    throw new Error(
      `[ci:local] Strict parity check failed: ${parityIssues.join('; ')}`,
    );
  }
}

export function printParity({
  detectPnpmVersion,
  expectedNodeMajor,
  expectedPnpmVersion,
  root,
}) {
  const pnpmCheck = detectPnpmVersion();
  const currentPnpmVersion =
    pnpmCheck.status === 0 ? (pnpmCheck.stdout ?? '').trim() : 'unavailable';

  console.log('ci:local parity config:');
  console.log(`- repo root: ${root}`);
  console.log(`- expected node major: ${expectedNodeMajor}`);
  console.log(
    `- expected pnpm version: ${expectedPnpmVersion ?? 'unconfigured'}`,
  );
  console.log(`- current node: ${process.versions.node}`);
  console.log(`- current pnpm: ${currentPnpmVersion}`);
}

export function printHelp() {
  console.log('Usage: node tools/scripts/ci-local.mjs [options]');
  console.log('');
  console.log('Options:');
  console.log('  --list                  List available jobs');
  console.log(
    '  --only=<jobs>           Run only specific comma-separated jobs (repeatable)',
  );
  console.log(
    '  --print-parity          Print derived node/pnpm parity settings',
  );
  console.log(
    '  --strict-parity         Fail when node/pnpm parity is mismatched',
  );
  console.log(
    '  --skip-cache           Bypass Turbo task caches for supported ci-local steps',
  );
  console.log('  --help                  Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  node tools/scripts/ci-local.mjs --only=build-metro');
  console.log(
    '  node tools/scripts/ci-local.mjs --only=build-metro --only=actionlint',
  );
  console.log('  node tools/scripts/ci-local.mjs --list --only=build-metro');
  console.log('  node tools/scripts/ci-local.mjs --print-parity');
  console.log(
    '  node tools/scripts/ci-local.mjs --strict-parity --only=build-and-test',
  );
  console.log(
    '  node tools/scripts/ci-local.mjs --skip-cache --only=build-and-test',
  );
}

export function formatMatrixJobName(jobName, entry) {
  const entryName = entry.name ?? entry.id ?? 'matrix';
  return `${jobName} (${entryName})`;
}

function formatJobListEntry(job) {
  if (!job.skipReason) {
    return job.name;
  }
  return `${job.name} [skip: ${job.skipReason}]`;
}
