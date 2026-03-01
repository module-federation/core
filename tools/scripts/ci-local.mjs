#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

process.env.CI = process.env.CI ?? 'true';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, '../..');
process.chdir(ROOT);
const DEFAULT_EXPECTED_NODE_MAJOR = 20;
const ROOT_PACKAGE_JSON = readRootPackageJson();
const EXPECTED_NODE_MAJOR = resolveExpectedNodeMajor(ROOT_PACKAGE_JSON);
const EXPECTED_PNPM_VERSION = resolveExpectedPnpmVersion(ROOT_PACKAGE_JSON);

const args = parseArgs(process.argv);
const onlyJobNames = args.only
  ? Array.from(
      new Set(
        args.only
          .split(',')
          .map((job) => job.trim())
          .filter(Boolean),
      ),
    )
  : [];
const onlyJobs = args.only === null ? null : new Set(onlyJobNames);

function setupE2E() {
  return step('Setup E2E dependencies and package build', async (ctx) => {
    await runCommand('pnpm', ['install', '--frozen-lockfile'], ctx);
    await runCommand('npx', ['cypress', 'install'], ctx);
    await runCommand('pnpm', ['run', 'build:pkg'], ctx);
  });
}

const jobs = [
  {
    name: 'build-and-test',
    steps: [
      step('Optional clean node_modules/.turbo', async (ctx) => {
        if (process.env.CI_LOCAL_CLEAN === 'true') {
          await runShell('rm -rf node_modules .turbo', ctx);
          return;
        }
        console.log(
          '[ci:local] Skipping cache clean (set CI_LOCAL_CLEAN=true to enable).',
        );
      }),
      step('Install dependencies', (ctx) =>
        runCommand('pnpm', ['install', '--frozen-lockfile'], ctx),
      ),
      step('Install Cypress', (ctx) =>
        runCommand('npx', ['cypress', 'install'], ctx),
      ),
      step('Check code format', (ctx) =>
        runCommand('pnpm', ['exec', 'prettier', '--check', '.'], ctx),
      ),
      step('Verify Rslib Template Publint Wiring', (ctx) =>
        runCommand(
          'node',
          [
            'packages/create-module-federation/scripts/verify-rslib-templates.mjs',
          ],
          ctx,
        ),
      ),
      step('Verify Package Rslib Publint Wiring', (ctx) =>
        runCommand(
          'node',
          ['tools/scripts/verify-rslib-publint-coverage.mjs'],
          ctx,
        ),
      ),
      step('Verify Publint Workflow Coverage', (ctx) =>
        runCommand(
          'node',
          ['tools/scripts/verify-publint-workflow-coverage.mjs'],
          ctx,
        ),
      ),
      step('Build packages (cold cache)', (ctx) =>
        runCommand('pnpm', ['run', 'build:pkg'], ctx),
      ),
      step('Build packages (warm cache)', (ctx) =>
        runCommand('pnpm', ['run', 'build:pkg'], ctx),
      ),
      step('Check package publishing compatibility (publint)', (ctx) =>
        runShell(
          `
            for pkg in packages/*; do
              if [ -f "$pkg/package.json" ] && \
                [ "$pkg" != "packages/assemble-release-plan" ] && \
                [ "$pkg" != "packages/chrome-devtools" ] && \
                [ "$pkg" != "packages/core" ] && \
                [ "$pkg" != "packages/modernjs" ] && \
                [ "$pkg" != "packages/utilities" ]; then
                echo "Checking $pkg..."
                npx publint "$pkg"
              fi
            done
          `,
          ctx,
        ),
      ),
      step('Run package tests', (ctx) =>
        runCommand('pnpm', ['run', 'test:pkg'], ctx),
      ),
    ],
  },
  {
    name: 'build-metro',
    steps: [
      step('Install dependencies', (ctx) =>
        runCommand('pnpm', ['install', '--frozen-lockfile'], ctx),
      ),
      step('Verify Rslib Template Publint Wiring', (ctx) =>
        runCommand(
          'node',
          [
            'packages/create-module-federation/scripts/verify-rslib-templates.mjs',
          ],
          ctx,
        ),
      ),
      step('Verify Package Rslib Publint Wiring', (ctx) =>
        runCommand(
          'node',
          ['tools/scripts/verify-rslib-publint-coverage.mjs'],
          ctx,
        ),
      ),
      step('Verify Publint Workflow Coverage', (ctx) =>
        runCommand(
          'node',
          ['tools/scripts/verify-publint-workflow-coverage.mjs'],
          ctx,
        ),
      ),
      step('Build shared packages', (ctx) =>
        runCommand('pnpm', ['run', 'build:pkg'], ctx),
      ),
      step('Test metro packages', (ctx) =>
        runCommand(
          'pnpm',
          [
            'exec',
            'turbo',
            'run',
            'test',
            '--filter=@module-federation/metro*',
          ],
          ctx,
        ),
      ),
      step('Lint metro packages', (ctx) =>
        runCommand(
          'pnpm',
          [
            'exec',
            'turbo',
            'run',
            'lint',
            '--filter=@module-federation/metro*',
          ],
          ctx,
        ),
      ),
    ],
  },
  {
    name: 'e2e-modern',
    env: { SKIP_DEVTOOLS_POSTINSTALL: 'true' },
    steps: [
      setupE2E(),
      step('Check CI conditions', async (ctx) => {
        ctx.state.shouldRun = await ciIsAffected('modernjs', ctx);
      }),
      step('E2E Test for ModernJS', async (ctx) => {
        if (!ctx.state.shouldRun) {
          logStepSkip(ctx, 'Not affected by current changes.');
          return;
        }
        await runShell(
          'npx kill-port --port 4001 && pnpm --filter modernjs-ssr-host run test:e2e && npx kill-port --port 4001',
          ctx,
        );
      }),
    ],
  },
  {
    name: 'e2e-runtime',
    env: { SKIP_DEVTOOLS_POSTINSTALL: 'true' },
    steps: [
      setupE2E(),
      step('E2E Test for Runtime Demo', (ctx) =>
        runTurboTaskIfAffected(ctx, {
          affectedAppName: '3005-runtime-host',
          taskName: 'test:e2e',
          filters: ['runtime-host'],
        }),
      ),
    ],
  },
  {
    name: 'e2e-manifest',
    env: { SKIP_DEVTOOLS_POSTINSTALL: 'true' },
    steps: [
      setupE2E(),
      step('E2E Test for Manifest Demo (dev)', (ctx) =>
        runTurboTaskIfAffected(ctx, {
          affectedAppName: 'manifest-webpack-host',
          taskName: 'test:e2e',
          filters: ['3008-webpack-host'],
        }),
      ),
      step('E2E Test for Manifest Demo (prod)', (ctx) =>
        runTurboTaskIfAffected(ctx, {
          affectedAppName: 'manifest-webpack-host',
          taskName: 'test:e2e:production',
          filters: ['3008-webpack-host'],
        }),
      ),
    ],
  },
  {
    name: 'e2e-node',
    env: { SKIP_DEVTOOLS_POSTINSTALL: 'true' },
    steps: [
      setupE2E(),
      step('Check CI conditions', async (ctx) => {
        ctx.state.shouldRun = await ciIsAffected(
          'node-local-remote,node-remote,node-dynamic-remote-new-version,node-dynamic-remote',
          ctx,
        );
      }),
      step('E2E Node Federation', async (ctx) => {
        if (!ctx.state.shouldRun) {
          logStepSkip(ctx, 'Not affected by current changes.');
          return;
        }
        await runShell(
          'pnpm run app:node:dev & sleep 25 && npx wait-on tcp:3333 && pnpm --filter node-host-e2e run test:e2e',
          ctx,
        );
      }),
    ],
  },
  {
    name: 'e2e-next-dev',
    env: {
      SKIP_DEVTOOLS_POSTINSTALL: 'true',
      NEXT_PRIVATE_LOCAL_WEBPACK: 'true',
    },
    steps: [
      setupE2E(),
      step('E2E Test for Next.js Dev', (ctx) =>
        runIfAffected(ctx, '3000-home', () =>
          runCommand(
            'node',
            ['tools/scripts/run-next-e2e.mjs', '--mode=dev'],
            ctx,
          ),
        ),
      ),
    ],
  },
  {
    name: 'e2e-next-prod',
    env: { SKIP_DEVTOOLS_POSTINSTALL: 'true' },
    steps: [
      setupE2E(),
      step('E2E Test for Next.js Prod', (ctx) =>
        runIfAffected(ctx, '3000-home', () =>
          runCommand(
            'node',
            ['tools/scripts/run-next-e2e.mjs', '--mode=prod'],
            ctx,
          ),
        ),
      ),
    ],
  },
  {
    name: 'e2e-treeshake',
    env: { SKIP_DEVTOOLS_POSTINSTALL: 'true' },
    steps: [
      step('Install dependencies', (ctx) =>
        runCommand('pnpm', ['install', '--frozen-lockfile'], ctx),
      ),
      step('Build packages', (ctx) =>
        runCommand('pnpm', ['run', 'build:pkg'], ctx),
      ),
      step('Check CI conditions', async (ctx) => {
        ctx.state.shouldRun = await ciIsAffected(
          'treeshake-server,treeshake-frontend',
          ctx,
        );
      }),
      step('E2E Treeshake Server', async (ctx) => {
        if (!ctx.state.shouldRun) {
          logStepSkip(ctx, 'Not affected by current changes.');
          return;
        }
        await runCommand(
          'pnpm',
          ['--filter', '@module-federation/treeshake-server', 'run', 'test'],
          ctx,
        );
      }),
      step('E2E Treeshake Frontend', async (ctx) => {
        if (!ctx.state.shouldRun) {
          logStepSkip(ctx, 'Not affected by current changes.');
          return;
        }
        await runCommand(
          'pnpm',
          ['--filter', '@module-federation/treeshake-frontend', 'run', 'e2e'],
          ctx,
        );
      }),
    ],
  },
  {
    name: 'e2e-modern-ssr',
    env: { SKIP_DEVTOOLS_POSTINSTALL: 'true' },
    steps: [
      setupE2E(),
      step('Check CI conditions', async (ctx) => {
        ctx.state.shouldRun = await ciIsAffected('modernjs', ctx);
      }),
      step('E2E Test for ModernJS SSR', async (ctx) => {
        if (!ctx.state.shouldRun) {
          logStepSkip(ctx, 'Not affected by current changes.');
          return;
        }
        await runShell(
          'lsof -ti tcp:3050,3051,3052,3053,3054,3055,3056 | xargs -r kill && pnpm run app:modern:dev & sleep 30 && for port in 3050 3051 3052 3053 3054 3055 3056; do while true; do response=$(curl -s http://127.0.0.1:$port/mf-manifest.json); if echo "$response" | jq empty >/dev/null 2>&1; then break; fi; sleep 1; done; done',
          ctx,
        );
      }),
    ],
  },
  {
    name: 'e2e-router',
    env: { SKIP_DEVTOOLS_POSTINSTALL: 'true' },
    steps: [
      setupE2E(),
      step('Check CI conditions', async (ctx) => {
        ctx.state.shouldRun = await ciIsAffected(
          'router-host-2000,router-host-v5-2200,router-host-vue3-2100,router-remote1-2001,router-remote2-2002,router-remote3-2003,router-remote4-2004',
          ctx,
        );
      }),
      step('E2E Test for Router', async (ctx) => {
        if (!ctx.state.shouldRun) {
          logStepSkip(ctx, 'Not affected by current changes.');
          return;
        }
        await runCommand(
          'node',
          ['tools/scripts/run-router-e2e.mjs', '--mode=dev'],
          ctx,
        );
      }),
    ],
  },
  {
    name: 'metro-affected-check',
    env: {
      SKIP_DEVTOOLS_POSTINSTALL: 'true',
      METRO_APP_NAME: process.env.CI_LOCAL_METRO_APP_NAME ?? 'example-host',
    },
    steps: [
      step('Install dependencies', (ctx) =>
        runCommand('pnpm', ['install', '--frozen-lockfile'], ctx),
      ),
      step('Check CI conditions', async (ctx) => {
        ctx.state.shouldRun = await ciIsAffected(ctx.env.METRO_APP_NAME, ctx);
      }),
      step('Print Metro affected result', (ctx) => {
        if (ctx.state.shouldRun) {
          console.log(
            `[ci:local] ${ctx.jobName} -> Metro app "${ctx.env.METRO_APP_NAME}" is affected.`,
          );
          return;
        }
        logStepSkip(
          ctx,
          `Metro app "${ctx.env.METRO_APP_NAME}" is not affected.`,
        );
      }),
    ],
  },
  {
    name: 'metro-android-e2e',
    env: {
      SKIP_DEVTOOLS_POSTINSTALL: 'true',
      METRO_APP_NAME: process.env.CI_LOCAL_METRO_APP_NAME ?? 'example-host',
    },
    steps: [
      step('Install dependencies', (ctx) =>
        runCommand('pnpm', ['install', '--frozen-lockfile'], ctx),
      ),
      step('Build shared packages', (ctx) =>
        runCommand('pnpm', ['run', 'build:pkg'], ctx),
      ),
      step('Check CI conditions', async (ctx) => {
        ctx.state.shouldRun = await ciIsAffected(ctx.env.METRO_APP_NAME, ctx);
      }),
      step('Run Metro Android E2E tests', async (ctx) => {
        if (!ctx.state.shouldRun) {
          logStepSkip(ctx, 'Not affected by current changes.');
          return;
        }
        await runCommand(
          'node',
          [
            'tools/scripts/run-metro-e2e.mjs',
            '--platform=android',
            `--appName=${ctx.env.METRO_APP_NAME}`,
            '--skip-on-missing-prereqs',
          ],
          ctx,
        );
      }),
    ],
    cleanup: async (ctx) => {
      if (!ctx.state.shouldRun) {
        return;
      }
      await shutdownLocalAndroidEmulators(ctx);
    },
  },
  {
    name: 'metro-ios-e2e',
    env: {
      SKIP_DEVTOOLS_POSTINSTALL: 'true',
      METRO_APP_NAME: process.env.CI_LOCAL_METRO_APP_NAME ?? 'example-host',
    },
    steps: [
      step('Install dependencies', (ctx) =>
        runCommand('pnpm', ['install', '--frozen-lockfile'], ctx),
      ),
      step('Build shared packages', (ctx) =>
        runCommand('pnpm', ['run', 'build:pkg'], ctx),
      ),
      step('Check CI conditions', async (ctx) => {
        ctx.state.shouldRun = await ciIsAffected(ctx.env.METRO_APP_NAME, ctx);
      }),
      step('Check Metro iOS compatibility', (ctx) => {
        if (!ctx.state.shouldRun) {
          logStepSkip(ctx, 'Not affected by current changes.');
          return;
        }
        if (process.platform !== 'darwin') {
          ctx.state.shouldRun = false;
          logStepSkip(ctx, 'Requires macOS to run iOS simulator tests.');
        }
      }),
      step('Run Metro iOS E2E tests', async (ctx) => {
        if (!ctx.state.shouldRun) {
          logStepSkip(ctx, 'Not affected by current changes.');
          return;
        }
        await runCommand(
          'node',
          [
            'tools/scripts/run-metro-e2e.mjs',
            '--platform=ios',
            `--appName=${ctx.env.METRO_APP_NAME}`,
            '--skip-on-missing-prereqs',
          ],
          ctx,
        );
      }),
    ],
    cleanup: async (ctx) => {
      if (!ctx.state.shouldRun) {
        return;
      }
      await shutdownLocalIosSimulators(ctx);
    },
  },
  {
    name: 'e2e-shared-tree-shaking',
    env: { SKIP_DEVTOOLS_POSTINSTALL: 'true' },
    steps: [
      setupE2E(),
      step('Check CI conditions', async (ctx) => {
        ctx.state.shouldRun = await ciIsAffected(
          'shared-tree-shaking-with-server-host',
          ctx,
        );
      }),
      step('E2E Shared Tree Shaking (runtime-infer)', async (ctx) => {
        if (!ctx.state.shouldRun) {
          logStepSkip(ctx, 'Not affected by current changes.');
          return;
        }
        await runShell(
          'npx kill-port --port 3001,3002 && pnpm --filter shared-tree-shaking-no-server-host run test:e2e && lsof -ti tcp:3001,3002 | xargs kill',
          ctx,
        );
      }),
      step('E2E Shared Tree Shaking (server-calc)', async (ctx) => {
        if (!ctx.state.shouldRun) {
          logStepSkip(ctx, 'Not affected by current changes.');
          return;
        }
        await runShell(
          'npx kill-port --port 3001,3002,3003 && pnpm --filter shared-tree-shaking-with-server-host run test:e2e && lsof -ti tcp:3001,3002,3003 | xargs kill',
          ctx,
        );
      }),
    ],
  },
  {
    name: 'devtools',
    env: { PLAYWRIGHT_BROWSERS_PATH: '0' },
    steps: [
      step('Install dependencies', (ctx) =>
        runShell(
          'pnpm install --frozen-lockfile && rm -rf .turbo && find . -maxdepth 6 -type d \\( -name ".cache" -o -name ".modern-js" \\) -exec rm -rf {} +',
          ctx,
        ),
      ),
      step('Install Cypress', (ctx) =>
        runCommand('npx', ['cypress', 'install'], ctx),
      ),
      step('Build packages', (ctx) =>
        runCommand('pnpm', ['run', 'build:pkg'], ctx),
      ),
      step('Install xvfb', (ctx) =>
        runShell('sudo apt-get update && sudo apt-get install xvfb', ctx),
      ),
      step('E2E Chrome Devtools Dev', (ctx) =>
        runShell(
          'npx kill-port 3009 3010 3011 3012 3013 4001 && pnpm run app:manifest:dev & echo "done" && npx wait-on tcp:3009 tcp:3010 tcp:3011 tcp:3012 tcp:3013 && sleep 10 && pnpm --filter @module-federation/devtools run e2e:devtools',
          ctx,
        ),
      ),
      step('E2E Chrome Devtools Prod', (ctx) =>
        runShell(
          'npx kill-port 3009 3010 3011 3012 3013 4001 && npx kill-port 3009 3010 3011 3012 3013 4001 && pnpm run app:manifest:prod & echo "done" && npx wait-on tcp:3009 tcp:3010 tcp:3011 tcp:3012 tcp:3013 && sleep 30 && pnpm --filter @module-federation/devtools run e2e:devtools',
          ctx,
        ),
      ),
      step('Kill devtools ports', (ctx) =>
        runShell('npx kill-port 3013 3009 3010 3011 3012 4001 || true', ctx),
      ),
      step('Skip pkill -f node', () => {
        console.log(
          '[ci:local] Skipping pkill -f node (use port-based cleanup instead).',
        );
      }),
    ],
  },
  {
    name: 'bundle-size',
    steps: [
      step('Install dependencies', (ctx) =>
        runCommand('pnpm', ['install', '--frozen-lockfile'], ctx),
      ),
      step('Build packages (current)', (ctx) =>
        runCommand('pnpm', ['run', 'build:pkg'], ctx),
      ),
      step('Measure bundle sizes (current)', (ctx) =>
        runCommand(
          'node',
          ['scripts/bundle-size-report.mjs', '--output', 'current.json'],
          ctx,
        ),
      ),
      step('Prepare base worktree', async (ctx) => {
        const baseRef = process.env.CI_LOCAL_BASE_REF ?? 'origin/main';
        const basePath = join(ROOT, `.ci-local-base-${Date.now()}`);
        if (existsSync(basePath)) {
          throw new Error(`Base worktree path already exists: ${basePath}`);
        }
        ctx.state.baseRef = baseRef;
        ctx.state.basePath = basePath;
        console.log(`[ci:local] Using base ref ${baseRef}`);
        await runCommand('git', ['worktree', 'add', basePath, baseRef], ctx);
      }),
      step('Install dependencies (base)', (ctx) =>
        runCommand('pnpm', ['install', '--frozen-lockfile'], {
          ...ctx,
          cwd: ctx.state.basePath,
        }),
      ),
      step('Build packages (base)', (ctx) =>
        runCommand('pnpm', ['run', 'build:pkg'], {
          ...ctx,
          cwd: ctx.state.basePath,
        }),
      ),
      step('Measure bundle sizes (base)', (ctx) =>
        runCommand(
          'node',
          [
            'scripts/bundle-size-report.mjs',
            '--output',
            'base.json',
            '--packages-dir',
            join(ctx.state.basePath, 'packages'),
          ],
          ctx,
        ),
      ),
      step('Compare bundle sizes', (ctx) =>
        runCommand(
          'node',
          [
            'scripts/bundle-size-report.mjs',
            '--compare',
            'base.json',
            '--current',
            'current.json',
            '--output',
            'stats.txt',
          ],
          ctx,
        ),
      ),
    ],
    cleanup: async (ctx) => {
      if (!ctx.state.basePath) {
        return;
      }
      await runCommand(
        'git',
        ['worktree', 'remove', '--force', ctx.state.basePath],
        ctx,
      );
    },
  },
  {
    name: 'actionlint',
    skipReason: 'GitHub-only action; run via CI.',
  },
  {
    name: 'bundle-size-comment',
    skipReason: 'GitHub-only action; run via CI.',
  },
];
const selectableJobNames = getSelectableJobNames(jobs);

main().catch((error) => {
  console.error('[ci:local] Failed:', error);
  process.exitCode = 1;
});

async function main() {
  if (args.help) {
    printHelp();
    return;
  }
  validateArgs();
  if (args.list) {
    listJobs(jobs);
    return;
  }
  preflight();
  if (args.printParity) {
    printParity();
    return;
  }
  for (const job of jobs) {
    await runJob(job);
  }
}

function preflight() {
  const nodeMajor = Number(process.versions.node.split('.')[0]);
  const parityIssues = [];
  if (nodeMajor !== EXPECTED_NODE_MAJOR) {
    parityIssues.push(
      `node ${process.versions.node} (expected major ${EXPECTED_NODE_MAJOR})`,
    );
    const pnpmVersionForHint = EXPECTED_PNPM_VERSION ?? '10.28.0';
    console.warn(
      `[ci:local] Warning: running with Node ${process.versions.node}. CI runs with Node ${EXPECTED_NODE_MAJOR}.`,
    );
    console.warn(
      `[ci:local] For closest parity run: source "$HOME/.nvm/nvm.sh" && nvm use ${EXPECTED_NODE_MAJOR} && corepack enable && corepack prepare pnpm@${pnpmVersionForHint} --activate`,
    );
  }

  const pnpmCheck = detectPnpmVersion();
  if (pnpmCheck.status !== 0) {
    throw new Error(
      '[ci:local] pnpm not found in PATH. Install/activate pnpm before running ci-local.',
    );
  }

  const pnpmVersion = (pnpmCheck.stdout ?? '').trim();
  if (EXPECTED_PNPM_VERSION && pnpmVersion !== EXPECTED_PNPM_VERSION) {
    parityIssues.push(
      `pnpm ${pnpmVersion} (expected ${EXPECTED_PNPM_VERSION})`,
    );
    console.warn(
      `[ci:local] Warning: running with pnpm ${pnpmVersion}. CI parity target is pnpm ${EXPECTED_PNPM_VERSION}.`,
    );
    console.warn(
      `[ci:local] For closest parity run: corepack enable && corepack prepare pnpm@${EXPECTED_PNPM_VERSION} --activate`,
    );
  }

  if (args.strictParity && parityIssues.length > 0) {
    throw new Error(
      `[ci:local] Strict parity check failed: ${parityIssues.join('; ')}`,
    );
  }
}

async function runJob(job, parentCtx = {}) {
  const skipFilter = parentCtx.skipFilter === true;
  const inheritedCtx = { ...parentCtx };
  delete inheritedCtx.skipFilter;

  if (job.skipReason) {
    console.log(`[ci:local] Skipping job "${job.name}": ${job.skipReason}`);
    return;
  }
  if (!skipFilter && !shouldRunJob(job)) {
    console.log(`[ci:local] Skipping job "${job.name}" (filtered).`);
    return;
  }

  if (job.matrix?.length) {
    const runAllEntries = !onlyJobs || onlyJobs.has(job.name);
    for (const entry of job.matrix) {
      const entryName = formatMatrixJobName(job.name, entry);
      if (!runAllEntries && onlyJobs && !onlyJobs.has(entryName)) {
        console.log(`[ci:local] Skipping job "${entryName}" (filtered).`);
        continue;
      }
      await runJob(
        {
          ...job,
          matrix: null,
          name: entryName,
          env: { ...job.env, ...entry.env },
        },
        { ...inheritedCtx, skipFilter: true },
      );
    }
    return;
  }

  const ctx = {
    ...inheritedCtx,
    env: { ...process.env, ...job.env },
    jobName: job.name,
    state: {},
  };

  console.log(`\n[ci:local] Starting job: ${job.name}`);
  try {
    for (const jobStep of job.steps ?? []) {
      console.log(`[ci:local] ${job.name} -> ${jobStep.label}`);
      await jobStep.run(ctx);
    }
  } finally {
    if (job.cleanup) {
      try {
        await job.cleanup(ctx);
      } catch (error) {
        console.warn(
          `[ci:local] Cleanup error for ${job.name}: ${error.message}`,
        );
      }
    }
  }
}

function step(label, run) {
  return { label, run };
}

function shouldRunJob(job) {
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

function listJobs(jobList) {
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

function printParity() {
  const pnpmCheck = detectPnpmVersion();
  const currentPnpmVersion =
    pnpmCheck.status === 0 ? (pnpmCheck.stdout ?? '').trim() : 'unavailable';

  console.log('ci:local parity config:');
  console.log(`- repo root: ${ROOT}`);
  console.log(`- expected node major: ${EXPECTED_NODE_MAJOR}`);
  console.log(
    `- expected pnpm version: ${EXPECTED_PNPM_VERSION ?? 'unconfigured'}`,
  );
  console.log(`- current node: ${process.versions.node}`);
  console.log(`- current pnpm: ${currentPnpmVersion}`);
}

function printHelp() {
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
}

function parseArgs(argv) {
  const result = {
    help: false,
    list: false,
    only: null,
    onlyTokens: [],
    printParity: false,
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

function validateArgs() {
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

function formatMatrixJobName(jobName, entry) {
  const entryName = entry.name ?? entry.id ?? 'matrix';
  return `${jobName} (${entryName})`;
}

function formatJobListEntry(job) {
  if (!job.skipReason) {
    return job.name;
  }
  return `${job.name} [skip: ${job.skipReason}]`;
}

function getSelectableJobNames(jobList) {
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

async function runIfAffected(ctx, affectedAppName, run) {
  const shouldRun = await ciIsAffected(affectedAppName, ctx);
  if (!shouldRun) {
    logStepSkip(ctx, 'Not affected by current changes.');
    return;
  }
  await run();
}

async function runTurboTaskIfAffected(
  ctx,
  { affectedAppName, taskName, filters = [] },
) {
  await runIfAffected(ctx, affectedAppName, async () => {
    const args = ['exec', 'turbo', 'run', taskName];
    for (const filter of filters) {
      args.push(`--filter=${filter}`);
    }
    await runCommand('pnpm', args, ctx);
  });
}

function runCommand(command, args = [], options = {}) {
  const { env = {}, cwd, allowFailure = false } = options;

  const child = spawn(command, args, {
    stdio: 'inherit',
    env,
    cwd,
  });

  return new Promise((resolve, reject) => {
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve({ code, signal });
        return;
      }
      if (allowFailure) {
        resolve({ code, signal });
        return;
      }
      reject(
        new Error(
          `${command} ${args.join(' ')} exited with ${formatExit({
            code,
            signal,
          })}`,
        ),
      );
    });
    child.on('error', reject);
  });
}

function runShell(command, options = {}) {
  return runCommand('bash', ['-lc', command], options);
}

async function shutdownLocalAndroidEmulators(ctx) {
  await runShell(
    `
      if ! command -v adb >/dev/null 2>&1; then
        exit 0
      fi

      mapfile -t emulators < <(adb devices | awk '/^emulator-[0-9]+[[:space:]]+device$/ {print $1}')
      if [ "\${#emulators[@]}" -eq 0 ]; then
        exit 0
      fi

      for emulator_id in "\${emulators[@]}"; do
        adb -s "$emulator_id" emu kill || true
      done
    `,
    { ...ctx, allowFailure: true },
  );
}

async function shutdownLocalIosSimulators(ctx) {
  if (process.platform !== 'darwin') {
    return;
  }

  await runShell(
    `
      if ! command -v xcrun >/dev/null 2>&1; then
        exit 0
      fi

      xcrun simctl shutdown all || true
      killall Simulator >/dev/null 2>&1 || true
    `,
    { ...ctx, allowFailure: true },
  );
}

function detectPnpmVersion() {
  return spawnSync('pnpm', ['--version'], {
    cwd: ROOT,
    env: process.env,
    stdio: 'pipe',
    encoding: 'utf-8',
  });
}

function readRootPackageJson() {
  try {
    return JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8'));
  } catch (error) {
    console.warn(
      `[ci:local] Unable to read package.json for parity hints: ${error.message}`,
    );
    return null;
  }
}

function resolveExpectedNodeMajor(packageJson) {
  const overrideMajor = process.env.CI_LOCAL_EXPECTED_NODE_MAJOR;
  if (overrideMajor) {
    const parsedOverride = Number.parseInt(overrideMajor, 10);
    if (Number.isInteger(parsedOverride) && parsedOverride > 0) {
      return parsedOverride;
    }
    console.warn(
      `[ci:local] Invalid CI_LOCAL_EXPECTED_NODE_MAJOR "${overrideMajor}", falling back to package metadata.`,
    );
  }

  const engineRange = packageJson?.engines?.node;
  if (typeof engineRange === 'string') {
    const versionMatch = engineRange.match(/\d+/);
    if (versionMatch) {
      return Number.parseInt(versionMatch[0], 10);
    }
    console.warn(
      `[ci:local] Unable to parse node engine range "${engineRange}", defaulting to Node ${DEFAULT_EXPECTED_NODE_MAJOR}.`,
    );
  }

  return DEFAULT_EXPECTED_NODE_MAJOR;
}

function resolveExpectedPnpmVersion(packageJson) {
  const overrideVersion = process.env.CI_LOCAL_EXPECTED_PNPM_VERSION;
  if (overrideVersion) {
    return overrideVersion;
  }

  const packageManager = packageJson?.packageManager;
  if (
    typeof packageManager === 'string' &&
    packageManager.startsWith('pnpm@')
  ) {
    return packageManager.slice('pnpm@'.length);
  }

  return null;
}

async function ciIsAffected(appName, ctx) {
  const result = await runCommand(
    'node',
    ['tools/scripts/ci-is-affected.mjs', `--appName=${appName}`],
    { ...ctx, allowFailure: true },
  );
  return result.code === 0;
}

function logStepSkip(ctx, reason) {
  console.log(`[ci:local] ${ctx.jobName} -> Skipped: ${reason}`);
}

function formatExit({ code, signal }) {
  const parts = [];
  if (code !== null && code !== undefined) {
    parts.push(`code ${code}`);
  }
  if (signal) {
    parts.push(`signal ${signal}`);
  }
  return parts.length > 0 ? parts.join(', ') : 'unknown status';
}
