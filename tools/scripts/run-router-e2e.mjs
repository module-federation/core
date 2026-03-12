#!/usr/bin/env node
import { spawn } from 'node:child_process';
import {
  DETACHED_PROCESS_GROUP,
  formatExit,
  isExpectedServeExit,
  runGuardedCommand,
  shutdownServe,
  spawnWithPromise,
} from './e2e-process-utils.mjs';

const ROUTER_WAIT_TARGETS = [
  'tcp:2000',
  'tcp:2001',
  'tcp:2002',
  'tcp:2003',
  'tcp:2004',
  'tcp:2005',
  'tcp:2006',
  'tcp:2100',
  'tcp:2200',
];

const KILL_PORT_ARGS = [
  'npx',
  'kill-port',
  '2000',
  '2001',
  '2002',
  '2003',
  '2004',
  '2005',
  '2006',
  '2100',
  '2200',
];

const ROUTER_WAIT_TIMEOUT_MS = 180_000;
const ROUTER_CI_STABILIZE_WAIT_MS = 20_000;

const SCENARIOS = {
  dev: {
    label: 'router development',
    serveCmd: ['pnpm', 'run', 'app:router:dev'],
    e2eCmd: ['pnpm', '--filter', 'host', 'run', 'e2e:ci'],
    waitTargets: ROUTER_WAIT_TARGETS,
  },
};

const VALID_MODES = new Set(['dev', 'all']);

async function main() {
  const modeArg = process.argv.find((arg) => arg.startsWith('--mode='));
  const mode = modeArg ? modeArg.split('=')[1] : 'all';

  if (!VALID_MODES.has(mode)) {
    console.error(
      `Unknown mode "${mode}". Expected one of ${Array.from(VALID_MODES).join(', ')}`,
    );
    process.exitCode = 1;
    return;
  }

  const targets = mode === 'all' ? ['dev'] : [mode];

  for (const target of targets) {
    await runScenario(target);
  }
}

async function runScenario(name) {
  const scenario = SCENARIOS[name];
  if (!scenario) {
    throw new Error(`Unknown scenario: ${name}`);
  }

  console.log(`\n[router-e2e] Starting ${scenario.label}`);

  await runKillPort();

  const serve = spawn(scenario.serveCmd[0], scenario.serveCmd.slice(1), {
    stdio: 'inherit',
    detached: true,
    env: {
      ...process.env,
      HOST: process.env.HOST ?? 'localhost',
    },
  });
  serve[DETACHED_PROCESS_GROUP] = true;

  let serveExitInfo;
  let shutdownRequested = false;

  const serveExitPromise = new Promise((resolve, reject) => {
    serve.on('exit', (code, signal) => {
      serveExitInfo = { code, signal };
      resolve(serveExitInfo);
    });
    serve.on('error', reject);
  });

  try {
    const waitFactory = getWaitFactory(scenario);

    await runGuardedCommand(
      'waiting for router demo ports',
      serveExitPromise,
      waitFactory,
      () => shutdownRequested,
    );

    if (process.env.CI) {
      await runGuardedCommand(
        'stabilizing router development servers for CI',
        serveExitPromise,
        () =>
          spawnWithPromise(process.execPath, [
            '-e',
            `setTimeout(() => process.exit(0), ${ROUTER_CI_STABILIZE_WAIT_MS});`,
          ]),
        () => shutdownRequested,
      );
    }

    await runGuardedCommand(
      'running router e2e tests',
      serveExitPromise,
      () => spawnWithPromise(scenario.e2eCmd[0], scenario.e2eCmd.slice(1)),
      () => shutdownRequested,
    );
  } finally {
    shutdownRequested = true;

    let serveExitError = null;
    try {
      await shutdownServe(serve, serveExitPromise);
    } catch (error) {
      console.error('[router-e2e] Serve command emitted error:', error);
      serveExitError = error;
    }

    await runKillPort();

    if (serveExitError) {
      throw serveExitError;
    }
  }

  if (!isExpectedServeExit(serveExitInfo)) {
    throw new Error(
      `Serve command for ${scenario.label} exited unexpectedly with ${formatExit(serveExitInfo)}`,
    );
  }

  console.log(`[router-e2e] Finished ${scenario.label}`);
}

async function runKillPort() {
  const { promise } = spawnWithPromise(
    KILL_PORT_ARGS[0],
    KILL_PORT_ARGS.slice(1),
  );
  try {
    await promise;
  } catch (error) {
    console.warn('[router-e2e] kill-port command failed:', error.message);
  }
}

function getWaitFactory(scenario) {
  const waitTargets = scenario.waitTargets ?? [];
  if (!waitTargets.length) {
    return () => spawnWithPromise(process.execPath, ['-e', 'process.exit(0)']);
  }

  return () =>
    spawnWithPromise('npx', [
      'wait-on',
      `--timeout=${ROUTER_WAIT_TIMEOUT_MS}`,
      ...waitTargets,
    ]);
}

main().catch((error) => {
  console.error('[router-e2e] Error:', error);
  process.exitCode = 1;
});
