#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

process.env.NX_TUI = 'false';
process.env.CI = process.env.CI ?? 'true';

const ROOT = process.cwd();

const args = parseArgs(process.argv);
const onlyJobs = args.only
  ? new Set(
      args.only
        .split(',')
        .map((job) => job.trim())
        .filter(Boolean),
    )
  : null;

const jobs = [
  {
    name: 'build-and-test',
    steps: [
      step('Optional clean node_modules/.nx', async (ctx) => {
        if (process.env.CI_LOCAL_CLEAN === 'true') {
          await runShell('rm -rf node_modules .nx', ctx);
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
        runCommand('npx', ['nx', 'format:check'], ctx),
      ),
      step('Print number of CPU cores', (ctx) => runCommand('nproc', [], ctx)),
      step('Build packages (cold cache)', (ctx) =>
        runCommand(
          'npx',
          [
            'nx',
            'run-many',
            '--targets=build',
            '--projects=tag:type:pkg',
            '--parallel=4',
            '--skip-nx-cache',
          ],
          ctx,
        ),
      ),
      step('Build packages (warm cache)', (ctx) =>
        runCommand(
          'npx',
          [
            'nx',
            'run-many',
            '--targets=build',
            '--projects=tag:type:pkg',
            '--parallel=4',
          ],
          ctx,
        ),
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
                [ "$pkg" != "packages/utilities" ] && \
                [ "$pkg" != "packages/metro-core" ] && \
                [ "$pkg" != "packages/metro-plugin-rnef" ] && \
                [ "$pkg" != "packages/metro-plugin-rnc-cli" ]; then
                echo "Checking $pkg..."
                npx publint "$pkg"
              fi
            done
          `,
          ctx,
        ),
      ),
      step('Warm Nx cache', (ctx) =>
        runCommand(
          'npx',
          [
            'nx',
            'run-many',
            '--targets=build',
            '--projects=tag:type:pkg',
            '--parallel=4',
          ],
          ctx,
        ),
      ),
      step('Run affected tests', (ctx) =>
        runCommand(
          'npx',
          [
            'nx',
            'affected',
            '-t',
            'test',
            '--parallel=3',
            "--exclude=*,!tag:type:pkg",
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
      step('Install dependencies', (ctx) =>
        runCommand('pnpm', ['install', '--frozen-lockfile'], ctx),
      ),
      step('Install Cypress', (ctx) =>
        runCommand('npx', ['cypress', 'install'], ctx),
      ),
      step('Build packages', (ctx) =>
        runCommand(
          'npx',
          ['nx', 'run-many', '--targets=build', '--projects=tag:type:pkg'],
          ctx,
        ),
      ),
      step('Check CI conditions', async (ctx) => {
        ctx.state.shouldRun = await ciIsAffected('modernjs', ctx);
      }),
      step('E2E Test for ModernJS', async (ctx) => {
        if (!ctx.state.shouldRun) {
          logStepSkip(ctx, 'Not affected by current changes.');
          return;
        }
        await runShell(
          'npx kill-port --port 4001 && npx nx run-many --target=test:e2e --projects=modernjs --parallel=1 && npx kill-port --port 4001',
          ctx,
        );
      }),
    ],
  },
  {
    name: 'e2e-runtime',
    env: { SKIP_DEVTOOLS_POSTINSTALL: 'true' },
    steps: [
      step('Install dependencies', (ctx) =>
        runCommand('pnpm', ['install', '--frozen-lockfile'], ctx),
      ),
      step('Install Cypress', (ctx) =>
        runCommand('npx', ['cypress', 'install'], ctx),
      ),
      step('Build packages', (ctx) =>
        runCommand(
          'npx',
          ['nx', 'run-many', '--targets=build', '--projects=tag:type:pkg'],
          ctx,
        ),
      ),
      step('Check CI conditions', async (ctx) => {
        ctx.state.shouldRun = await ciIsAffected('3005-runtime-host', ctx);
      }),
      step('E2E Test for Runtime Demo', async (ctx) => {
        if (!ctx.state.shouldRun) {
          logStepSkip(ctx, 'Not affected by current changes.');
          return;
        }
        await runShell(
          'npx kill-port --port 3005,3006,3007 && pnpm run app:runtime:dev & echo "done" && sleep 20 && npx nx run-many --target=test:e2e --projects=3005-runtime-host --parallel=1 && lsof -ti tcp:3005,3006,3007 | xargs kill',
          ctx,
        );
      }),
    ],
  },
  {
    name: 'e2e-manifest',
    env: { SKIP_DEVTOOLS_POSTINSTALL: 'true' },
    steps: [
      step('Install dependencies', (ctx) =>
        runCommand('pnpm', ['install', '--frozen-lockfile'], ctx),
      ),
      step('Install Cypress', (ctx) =>
        runCommand('npx', ['cypress', 'install'], ctx),
      ),
      step('Build packages', (ctx) =>
        runCommand(
          'npx',
          ['nx', 'run-many', '--targets=build', '--projects=tag:type:pkg'],
          ctx,
        ),
      ),
      step('Check CI conditions', async (ctx) => {
        ctx.state.shouldRun = await ciIsAffected('manifest-webpack-host', ctx);
      }),
      step('E2E Test for Manifest Demo (dev)', async (ctx) => {
        if (!ctx.state.shouldRun) {
          logStepSkip(ctx, 'Not affected by current changes.');
          return;
        }
        await runCommand(
          'node',
          ['tools/scripts/run-manifest-e2e.mjs', '--mode=dev'],
          ctx,
        );
      }),
      step('E2E Test for Manifest Demo (prod)', async (ctx) => {
        if (!ctx.state.shouldRun) {
          logStepSkip(ctx, 'Not affected by current changes.');
          return;
        }
        await runCommand(
          'node',
          ['tools/scripts/run-manifest-e2e.mjs', '--mode=prod'],
          ctx,
        );
      }),
    ],
  },
  {
    name: 'e2e-node',
    env: { SKIP_DEVTOOLS_POSTINSTALL: 'true' },
    steps: [
      step('Install dependencies', (ctx) =>
        runCommand('pnpm', ['install', '--frozen-lockfile'], ctx),
      ),
      step('Install Cypress', (ctx) =>
        runCommand('npx', ['cypress', 'install'], ctx),
      ),
      step('Build packages', (ctx) =>
        runCommand(
          'npx',
          ['nx', 'run-many', '--targets=build', '--projects=tag:type:pkg'],
          ctx,
        ),
      ),
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
          'npx nx run-many --target=serve --projects=node-local-remote,node-remote,node-dynamic-remote-new-version,node-dynamic-remote --parallel=10 & echo "done" && sleep 25 && npx nx run-many --target=serve --projects=node-host & sleep 5 && npx wait-on tcp:3333 && npx nx run node-host-e2e:test:e2e',
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
      step('Install dependencies', (ctx) =>
        runCommand('pnpm', ['install', '--frozen-lockfile'], ctx),
      ),
      step('Install Cypress', (ctx) =>
        runCommand('npx', ['cypress', 'install'], ctx),
      ),
      step('Build packages', (ctx) =>
        runCommand(
          'npx',
          ['nx', 'run-many', '--targets=build', '--projects=tag:type:pkg'],
          ctx,
        ),
      ),
      step('Check CI conditions', async (ctx) => {
        ctx.state.shouldRun = await ciIsAffected('3000-home', ctx);
      }),
      step('E2E Test for Next.js Dev', async (ctx) => {
        if (!ctx.state.shouldRun) {
          logStepSkip(ctx, 'Not affected by current changes.');
          return;
        }
        await runCommand(
          'node',
          ['tools/scripts/run-next-e2e.mjs', '--mode=dev'],
          ctx,
        );
      }),
    ],
  },
  {
    name: 'e2e-next-prod',
    env: { SKIP_DEVTOOLS_POSTINSTALL: 'true' },
    steps: [
      step('Install dependencies', (ctx) =>
        runCommand('pnpm', ['install', '--frozen-lockfile'], ctx),
      ),
      step('Install Cypress', (ctx) =>
        runCommand('npx', ['cypress', 'install'], ctx),
      ),
      step('Build packages', (ctx) =>
        runCommand(
          'npx',
          ['nx', 'run-many', '--targets=build', '--projects=tag:type:pkg'],
          ctx,
        ),
      ),
      step('Check CI conditions', async (ctx) => {
        ctx.state.shouldRun = await ciIsAffected('3000-home', ctx);
      }),
      step('E2E Test for Next.js Prod', async (ctx) => {
        if (!ctx.state.shouldRun) {
          logStepSkip(ctx, 'Not affected by current changes.');
          return;
        }
        await runCommand(
          'node',
          ['tools/scripts/run-next-e2e.mjs', '--mode=prod'],
          ctx,
        );
      }),
    ],
  },
  {
    name: 'e2e-modern-ssr',
    env: { SKIP_DEVTOOLS_POSTINSTALL: 'true' },
    steps: [
      step('Install dependencies', (ctx) =>
        runCommand('pnpm', ['install', '--frozen-lockfile'], ctx),
      ),
      step('Install Cypress', (ctx) =>
        runCommand('npx', ['cypress', 'install'], ctx),
      ),
      step('Build packages', (ctx) =>
        runCommand(
          'npx',
          ['nx', 'run-many', '--targets=build', '--projects=tag:type:pkg'],
          ctx,
        ),
      ),
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
      step('Install dependencies', (ctx) =>
        runCommand('pnpm', ['install', '--frozen-lockfile'], ctx),
      ),
      step('Install Cypress', (ctx) =>
        runCommand('npx', ['cypress', 'install'], ctx),
      ),
      step('Build packages', (ctx) =>
        runCommand(
          'npx',
          ['nx', 'run-many', '--targets=build', '--projects=tag:type:pkg'],
          ctx,
        ),
      ),
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
    name: 'e2e-shared-tree-shaking',
    env: { SKIP_DEVTOOLS_POSTINSTALL: 'true' },
    steps: [
      step('Install dependencies', (ctx) =>
        runCommand('pnpm', ['install', '--frozen-lockfile'], ctx),
      ),
      step('Install Cypress', (ctx) =>
        runCommand('npx', ['cypress', 'install'], ctx),
      ),
      step('Build packages', (ctx) =>
        runCommand(
          'npx',
          ['nx', 'run-many', '--targets=build', '--projects=tag:type:pkg'],
          ctx,
        ),
      ),
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
          'npx kill-port --port 3001,3002 && npx nx run shared-tree-shaking-no-server-host:test:e2e && lsof -ti tcp:3001,3002 | xargs kill',
          ctx,
        );
      }),
      step('E2E Shared Tree Shaking (server-calc)', async (ctx) => {
        if (!ctx.state.shouldRun) {
          logStepSkip(ctx, 'Not affected by current changes.');
          return;
        }
        await runShell(
          'npx kill-port --port 3001,3002,3003 && npx nx run shared-tree-shaking-with-server-host:test:e2e && lsof -ti tcp:3001,3002,3003 | xargs kill',
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
          'pnpm install --frozen-lockfile && find . -maxdepth 6 -type d \\( -name ".cache" -o -name ".modern-js" \\) -exec rm -rf {} +',
          ctx,
        ),
      ),
      step('Install Cypress', (ctx) =>
        runCommand('npx', ['cypress', 'install'], ctx),
      ),
      step('Build packages', (ctx) =>
        runCommand(
          'npx',
          ['nx', 'run-many', '--targets=build', '--projects=tag:type:pkg'],
          ctx,
        ),
      ),
      step('Install xvfb', (ctx) =>
        runShell('sudo apt-get update && sudo apt-get install xvfb', ctx),
      ),
      step('E2E Chrome Devtools Dev', (ctx) =>
        runShell(
          'npx kill-port 3009 3010 3011 3012 3013 4001 && pnpm run app:manifest:dev & echo "done" && npx wait-on tcp:3009 tcp:3010 tcp:3011 tcp:3012 tcp:3013 && sleep 10 && npx nx e2e:devtools chrome-devtools',
          ctx,
        ),
      ),
      step('E2E Chrome Devtools Prod', (ctx) =>
        runShell(
          'npx kill-port 3009 3010 3011 3012 3013 4001 && npx kill-port 3009 3010 3011 3012 3013 4001 && pnpm run app:manifest:prod & echo "done" && npx wait-on tcp:3009 tcp:3010 tcp:3011 tcp:3012 tcp:3013 && sleep 30 && npx nx e2e:devtools chrome-devtools',
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
        runCommand(
          'npx',
          [
            'nx',
            'run-many',
            '--targets=build',
            '--projects=tag:type:pkg',
            '--parallel=4',
            '--skip-nx-cache',
          ],
          ctx,
        ),
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
        runCommand(
          'npx',
          [
            'nx',
            'run-many',
            '--targets=build',
            '--projects=tag:type:pkg',
            '--parallel=4',
            '--skip-nx-cache',
          ],
          {
            ...ctx,
            cwd: ctx.state.basePath,
          },
        ),
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

if (args.list) {
  listJobs(jobs);
  process.exit(0);
}

main().catch((error) => {
  console.error('[ci:local] Failed:', error);
  process.exitCode = 1;
});

async function main() {
  for (const job of jobs) {
    await runJob(job);
  }
}

async function runJob(job, parentCtx = {}) {
  if (job.skipReason) {
    console.log(`[ci:local] Skipping job "${job.name}": ${job.skipReason}`);
    return;
  }
  if (!shouldRunJob(job.name)) {
    console.log(`[ci:local] Skipping job "${job.name}" (filtered).`);
    return;
  }

  if (job.matrix?.length) {
    for (const entry of job.matrix) {
      await runJob(
        {
          ...job,
          matrix: null,
          name: `${job.name} (${entry.name ?? entry.id ?? 'matrix'})`,
          env: { ...job.env, ...entry.env },
        },
        parentCtx,
      );
    }
    return;
  }

  const ctx = {
    ...parentCtx,
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

function shouldRunJob(name) {
  if (!onlyJobs) {
    return true;
  }
  return onlyJobs.has(name);
}

function listJobs(jobList) {
  console.log('ci:local job list:');
  for (const job of jobList) {
    if (job.matrix?.length) {
      for (const entry of job.matrix) {
        const entryName = entry.name ?? entry.id ?? 'matrix';
        console.log(`- ${job.name} (${entryName})`);
      }
    } else {
      console.log(`- ${job.name}`);
    }
  }
  console.log('\nUse --only=job1,job2 to run a subset.');
}

function parseArgs(argv) {
  const result = { list: false, only: null };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--list') {
      result.list = true;
      continue;
    }
    if (arg === '--only') {
      result.only = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg.startsWith('--only=')) {
      result.only = arg.slice('--only='.length);
    }
  }
  return result;
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
