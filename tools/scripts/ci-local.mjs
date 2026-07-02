#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { E2E_SUITES } from './ci-e2e-suites.mjs';
import { createLocalE2EHelpers } from './ci-local-e2e.mjs';
import {
  formatMatrixJobName,
  getOnlyJobNames,
  getSelectableJobNames,
  listJobs,
  parseArgs,
  preflight,
  printHelp,
  printParity,
  shouldRunJob,
  validateArgs,
} from './ci-local-cli.mjs';

process.env.CI = process.env.CI ?? 'true';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, '../..');
process.chdir(ROOT);
const DEFAULT_EXPECTED_NODE_MAJOR = 20;
const ROOT_PACKAGE_JSON = readRootPackageJson();
const EXPECTED_NODE_MAJOR = resolveExpectedNodeMajor(ROOT_PACKAGE_JSON);
const EXPECTED_PNPM_VERSION = resolveExpectedPnpmVersion(ROOT_PACKAGE_JSON);

const args = parseArgs(process.argv);
const onlyJobNames = getOnlyJobNames(args);
const onlyJobs = args.only === null ? null : new Set(onlyJobNames);

const {
  checkAffectedStep,
  e2eSetupSteps,
  installDependenciesStep,
  logStepSkip,
  runWhenAffected,
  setupAffectedE2E,
} = createLocalE2EHelpers({
  formatExit,
  runCommand,
  runPackagesBuild,
  step,
});

const jobs = [
  {
    name: 'build-and-test',
    steps: [
      step('Install dependencies', (ctx) =>
        runCommand('pnpm', ['install', '--frozen-lockfile'], ctx),
      ),
      step('Install Cypress', (ctx) =>
        runCommand('npx', ['cypress', 'install'], ctx),
      ),
      step('Check code format', (ctx) =>
        runCommand('node', ['tools/scripts/check-format-changed.mjs'], ctx),
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
      step('Verify Turbo Conventions', (ctx) =>
        runCommand('pnpm', ['run', 'verify:turbo'], ctx),
      ),
      step('Build packages', (ctx) => runPackagesBuild(ctx)),
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
      step('Run affected package tests', (ctx) => runChangedPackageTests(ctx)),
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
      step('Verify Turbo Conventions', (ctx) =>
        runCommand('pnpm', ['run', 'verify:turbo'], ctx),
      ),
      step('Build shared packages', (ctx) => runPackagesBuild(ctx)),
      step('Check metro package publishing compatibility (publint)', (ctx) =>
        runShell(
          `
            for pkg in packages/metro-*; do
              if [ -f "$pkg/package.json" ]; then
                echo "Checking $pkg..."
                npx publint "$pkg"
              fi
            done
          `,
          ctx,
        ),
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
      ...e2eSetupSteps(E2E_SUITES.modern),
      step('E2E Test for ModernJS', async (ctx) => {
        await runWhenAffected(ctx, () =>
          runCommand('pnpm', ['run', 'e2e:modern'], ctx),
        );
      }),
    ],
  },
  {
    name: 'e2e-runtime',
    env: { SKIP_DEVTOOLS_POSTINSTALL: 'true' },
    steps: [
      ...e2eSetupSteps(E2E_SUITES.runtime),
      step('E2E Test for Runtime Demo', (ctx) =>
        runWhenAffected(ctx, () =>
          runCommand('pnpm', ['run', 'e2e:runtime'], ctx),
        ),
      ),
    ],
  },
  {
    name: 'e2e-manifest',
    env: { SKIP_DEVTOOLS_POSTINSTALL: 'true' },
    steps: [
      ...e2eSetupSteps(E2E_SUITES.manifest),
      step('E2E Test for Manifest Demo (dev)', (ctx) =>
        runWhenAffected(ctx, () =>
          runCommand('pnpm', ['run', 'e2e:manifest:dev'], ctx),
        ),
      ),
      step('E2E Test for Manifest Demo (prod)', (ctx) =>
        runWhenAffected(ctx, () =>
          runCommand('pnpm', ['run', 'e2e:manifest:prod'], ctx),
        ),
      ),
    ],
  },
  {
    name: 'e2e-node',
    env: { SKIP_DEVTOOLS_POSTINSTALL: 'true' },
    steps: [
      ...e2eSetupSteps(E2E_SUITES.node),
      step('E2E Node Federation', async (ctx) => {
        await runWhenAffected(ctx, () =>
          runCommand('pnpm', ['run', 'e2e:node'], ctx),
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
      ...e2eSetupSteps(E2E_SUITES.next),
      step('E2E Test for Next.js Dev', (ctx) =>
        runWhenAffected(ctx, () =>
          runCommand('pnpm', ['run', 'e2e:next:dev'], ctx),
        ),
      ),
    ],
  },
  {
    name: 'e2e-next-prod',
    env: { SKIP_DEVTOOLS_POSTINSTALL: 'true' },
    steps: [
      ...e2eSetupSteps(E2E_SUITES.next),
      step('E2E Test for Next.js Prod', (ctx) =>
        runWhenAffected(ctx, () =>
          runCommand('pnpm', ['run', 'e2e:next:prod'], ctx),
        ),
      ),
    ],
  },
  {
    name: 'e2e-treeshake',
    env: { SKIP_DEVTOOLS_POSTINSTALL: 'true' },
    steps: [
      ...e2eSetupSteps(E2E_SUITES.treeshake, { cypress: false }),
      step('E2E Treeshake Server', async (ctx) => {
        await runWhenAffected(ctx, () =>
          runCommand('pnpm', ['run', 'e2e:treeshake:server'], ctx),
        );
      }),
      step('E2E Treeshake Frontend', async (ctx) => {
        await runWhenAffected(ctx, () =>
          runCommand('pnpm', ['run', 'e2e:treeshake:frontend'], ctx),
        );
      }),
    ],
  },
  {
    name: 'e2e-modern-ssr',
    env: { SKIP_DEVTOOLS_POSTINSTALL: 'true' },
    steps: [
      ...e2eSetupSteps(E2E_SUITES.modernSsr),
      step('E2E Test for ModernJS SSR', async (ctx) => {
        await runWhenAffected(ctx, () =>
          runCommand('pnpm', ['run', 'e2e:modern:ssr'], ctx),
        );
      }),
    ],
  },
  {
    name: 'e2e-router',
    env: { SKIP_DEVTOOLS_POSTINSTALL: 'true' },
    steps: [
      ...e2eSetupSteps(E2E_SUITES.router),
      step('E2E Test for Router', async (ctx) => {
        await runWhenAffected(ctx, () =>
          runCommand('pnpm', ['run', 'e2e:router'], ctx),
        );
      }),
    ],
  },
  {
    name: 'metro-affected-check',
    env: {
      SKIP_DEVTOOLS_POSTINSTALL: 'true',
      METRO_APP_NAME:
        process.env.CI_LOCAL_METRO_APP_NAME ?? E2E_SUITES.metro[0],
    },
    steps: [
      installDependenciesStep(),
      checkAffectedStep((ctx) => ctx.env.METRO_APP_NAME),
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
      METRO_APP_NAME:
        process.env.CI_LOCAL_METRO_APP_NAME ?? E2E_SUITES.metro[0],
    },
    steps: [
      installDependenciesStep(),
      checkAffectedStep((ctx) => ctx.env.METRO_APP_NAME),
      setupAffectedE2E({ cypress: false }),
      step('Run Metro Android E2E tests', async (ctx) => {
        await runWhenAffected(ctx, () =>
          runCommand(
            'node',
            [
              'tools/scripts/run-metro-e2e.mjs',
              '--platform=android',
              `--appName=${ctx.env.METRO_APP_NAME}`,
              '--skip-on-missing-prereqs',
            ],
            ctx,
          ),
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
      METRO_APP_NAME:
        process.env.CI_LOCAL_METRO_APP_NAME ?? E2E_SUITES.metro[0],
    },
    steps: [
      installDependenciesStep(),
      checkAffectedStep((ctx) => ctx.env.METRO_APP_NAME),
      step('Check Metro iOS compatibility', (ctx) => {
        if (!ctx.state.shouldRun) {
          logStepSkip(ctx, 'Not affected by current changes.');
          return;
        }
        if (process.platform !== 'darwin') {
          ctx.state.shouldRun = false;
          ctx.state.skipReason = 'Requires macOS to run iOS simulator tests.';
          logStepSkip(ctx, ctx.state.skipReason);
        }
      }),
      setupAffectedE2E({ cypress: false }),
      step('Run Metro iOS E2E tests', async (ctx) => {
        await runWhenAffected(ctx, () =>
          runCommand(
            'node',
            [
              'tools/scripts/run-metro-e2e.mjs',
              '--platform=ios',
              `--appName=${ctx.env.METRO_APP_NAME}`,
              '--skip-on-missing-prereqs',
            ],
            ctx,
          ),
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
      ...e2eSetupSteps(E2E_SUITES.sharedTreeShaking),
      step('E2E Shared Tree Shaking (runtime-infer)', async (ctx) => {
        await runWhenAffected(ctx, () =>
          runCommand(
            'pnpm',
            ['run', 'e2e:shared-tree-shaking:runtime-infer'],
            ctx,
          ),
        );
      }),
      step('E2E Shared Tree Shaking (server-calc)', async (ctx) => {
        await runWhenAffected(ctx, () =>
          runCommand(
            'pnpm',
            ['run', 'e2e:shared-tree-shaking:server-calc'],
            ctx,
          ),
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
          'pnpm install --frozen-lockfile && find . -maxdepth 6 -type d \\( -name ".cache" -o -name ".modern-js" \\) -exec rm -rf {} +',
          ctx,
        ),
      ),
      step('Install Cypress', (ctx) =>
        runCommand('npx', ['cypress', 'install'], ctx),
      ),
      step('Build packages', (ctx) => runPackagesBuild(ctx)),
      step('Install xvfb', (ctx) =>
        runShell('sudo apt-get update && sudo apt-get install xvfb', ctx),
      ),
      step('E2E Chrome Devtools Dev', (ctx) =>
        runCommand('pnpm', ['run', 'e2e:devtools:dev'], ctx),
      ),
      step('E2E Chrome Devtools Prod', (ctx) =>
        runCommand('pnpm', ['run', 'e2e:devtools:prod'], ctx),
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
      step('Build packages (current)', (ctx) => runPackagesBuild(ctx)),
      step('Measure bundle sizes (current)', (ctx) =>
        runCommand(
          'node',
          ['scripts/bundle-size-report.mjs', '--output', 'current.json'],
          ctx,
        ),
      ),
      step('Prepare base worktree', async (ctx) => {
        const baseRef = process.env.CI_LOCAL_BASE_REF ?? 'origin/main';
        const localBaseRef = baseRef.startsWith('origin/')
          ? baseRef.slice('origin/'.length)
          : baseRef;
        const basePath = join(ROOT, `.ci-local-base-${Date.now()}`);
        if (existsSync(basePath)) {
          throw new Error(`Base worktree path already exists: ${basePath}`);
        }
        ctx.state.baseRef = baseRef;
        ctx.state.localBaseRef = localBaseRef;
        ctx.state.basePath = basePath;
        console.log(`[ci:local] Using base ref ${baseRef}`);
        await runCommand('git', ['worktree', 'add', basePath, baseRef], ctx);
        await runCommand(
          'git',
          ['-C', basePath, 'branch', '-f', localBaseRef, baseRef],
          ctx,
        );
      }),
      step('Install dependencies (base)', (ctx) =>
        runCommand('pnpm', ['install', '--frozen-lockfile'], {
          ...ctx,
          cwd: ctx.state.basePath,
        }),
      ),
      step('Build packages (base)', (ctx) => runBasePackagesBuild(ctx)),
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
  validateArgs({ args, onlyJobNames, onlyJobs, selectableJobNames });
  if (args.list) {
    listJobs(jobs, { onlyJobs, selectableJobNames });
    return;
  }
  preflight({
    args,
    detectPnpmVersion,
    expectedNodeMajor: EXPECTED_NODE_MAJOR,
    expectedPnpmVersion: EXPECTED_PNPM_VERSION,
  });
  if (args.skipCache) {
    console.log('[ci:local] Task cache bypass enabled (--skip-cache).');
  }
  if (args.printParity) {
    printParity({
      detectPnpmVersion,
      expectedNodeMajor: EXPECTED_NODE_MAJOR,
      expectedPnpmVersion: EXPECTED_PNPM_VERSION,
      root: ROOT,
    });
    return;
  }
  for (const job of jobs) {
    await runJob(job);
  }
}

async function runBasePackagesBuild(ctx) {
  await runPackagesBuildAtPath(ctx.state.basePath, {
    ...ctx,
    cwd: ctx.state.basePath,
  });
}

async function runPackagesBuild(ctx) {
  await runPackagesBuildAtPath(ctx.cwd ?? ROOT, ctx);
}

async function runPackagesBuildAtPath(targetPath, ctx) {
  const targetCtx = { ...ctx, cwd: targetPath };
  const rootPackageJsonPath = join(targetPath, 'package.json');
  let basePackageJson = null;
  try {
    basePackageJson = JSON.parse(readFileSync(rootPackageJsonPath, 'utf-8'));
  } catch {
    basePackageJson = null;
  }

  const buildPackagesScript = basePackageJson?.scripts?.['build:packages'];
  if (
    typeof buildPackagesScript === 'string' &&
    buildPackagesScript.trim() &&
    !args.skipCache
  ) {
    await runCommand('pnpm', ['run', 'build:packages'], targetCtx);
    return;
  }

  if (existsSync(join(targetPath, 'turbo.json'))) {
    const turboArgs = [
      'exec',
      'turbo',
      'run',
      'build',
      '--filter=./packages/**',
      '--concurrency=20',
    ];
    if (args.skipCache) {
      turboArgs.push('--force');
    }
    await runCommand('pnpm', turboArgs, targetCtx);
    return;
  }

  throw new Error(
    '[ci:local] No turbo.json found for package builds. ci-local expects Turbo-managed package builds.',
  );
}

async function runJob(job, parentCtx = {}) {
  const skipFilter = parentCtx.skipFilter === true;
  const inheritedCtx = { ...parentCtx };
  delete inheritedCtx.skipFilter;

  if (job.skipReason) {
    console.log(`[ci:local] Skipping job "${job.name}": ${job.skipReason}`);
    return;
  }
  if (!skipFilter && !shouldRunJob(job, onlyJobs)) {
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

async function runChangedPackageTests(ctx) {
  const commandArgs = ['tools/scripts/run-affected-package-tests.mjs'];
  if (args.skipCache) {
    commandArgs.push('--skip-cache');
  }
  await runCommand('node', commandArgs, {
    ...ctx,
    env: {
      ...ctx.env,
      CI_BASE_REF: process.env.CI_LOCAL_BASE_REF ?? '',
    },
  });
}

function runCommand(command, args = [], options = {}) {
  const { env = {}, cwd, allowFailure = false } = options;
  const resolvedArgs = applyCacheBypassArgs(command, args);

  const child = spawn(command, resolvedArgs, {
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
          `${command} ${resolvedArgs.join(' ')} exited with ${formatExit({
            code,
            signal,
          })}`,
        ),
      );
    });
    child.on('error', reject);
  });
}

function applyCacheBypassArgs(command, commandArgs) {
  if (!args.skipCache) {
    return commandArgs;
  }
  if (
    command === 'pnpm' &&
    commandArgs[0] === 'exec' &&
    commandArgs[1] === 'turbo' &&
    !commandArgs.includes('--force')
  ) {
    return [...commandArgs, '--force'];
  }
  return commandArgs;
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
