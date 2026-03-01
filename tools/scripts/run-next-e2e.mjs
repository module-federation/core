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

const NEXT_WAIT_TARGETS = ['tcp:3000', 'tcp:3001', 'tcp:3002'];

const KILL_PORT_ARGS = ['npx', 'kill-port', '3000', '3001', '3002'];

const E2E_APPS = [
  '@module-federation/3000-home',
  '@module-federation/3001-shop',
  '@module-federation/3002-checkout',
];

const SCENARIOS = {
  dev: {
    label: 'next.js development',
    serveCmd: [
      'pnpm',
      'exec',
      'turbo',
      'run',
      'serve:development',
      ...E2E_APPS.map((appName) => `--filter=${appName}`),
      '--concurrency=3',
    ],
    e2eApps: E2E_APPS,
    waitTargets: NEXT_WAIT_TARGETS,
  },
  prod: {
    label: 'next.js production',
    buildCmd: [
      'pnpm',
      'exec',
      'turbo',
      'run',
      'build:production',
      ...E2E_APPS.map((appName) => `--filter=${appName}`),
      '--concurrency=3',
    ],
    serveCmd: [
      'pnpm',
      'exec',
      'turbo',
      'run',
      'serve:production',
      ...E2E_APPS.map((appName) => `--filter=${appName}`),
      '--concurrency=3',
    ],
    e2eApps: E2E_APPS,
    waitTargets: NEXT_WAIT_TARGETS,
  },
};

const VALID_MODES = new Set(['dev', 'prod', 'all']);

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

  const targets = mode === 'all' ? ['dev', 'prod'] : [mode];

  for (const target of targets) {
    await runScenario(target);
  }
}

async function runScenario(name) {
  const scenario = SCENARIOS[name];
  if (!scenario) {
    throw new Error(`Unknown scenario: ${name}`);
  }

  console.log(`\n[next-e2e] Starting ${scenario.label}`);

  // Pre-cleanup: ensure ports are free
  await runKillPort();

  // Build step (production only)
  if (scenario.buildCmd) {
    console.log(`[next-e2e] Building next.js apps for production...`);
    const { promise: buildPromise } = spawnWithPromise(
      scenario.buildCmd[0],
      scenario.buildCmd.slice(1),
    );
    await buildPromise;
    console.log(`[next-e2e] Build complete`);
  }

  // Start serve processes
  const serve = spawn(scenario.serveCmd[0], scenario.serveCmd.slice(1), {
    stdio: 'inherit',
    detached: true,
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
    // Wait for all servers to be ready
    const waitFactory = getWaitFactory(scenario);

    await runGuardedCommand(
      'waiting for next.js servers',
      serveExitPromise,
      waitFactory,
      () => shutdownRequested,
    );

    // Run e2e tests for each app sequentially
    for (const app of scenario.e2eApps) {
      console.log(`\n[next-e2e] Running e2e tests for ${app}`);
      await runGuardedCommand(
        `running e2e tests for ${app}`,
        serveExitPromise,
        () => spawnWithPromise('pnpm', ['--filter', app, 'run', 'e2e']),
        () => shutdownRequested,
      );
      console.log(`[next-e2e] Finished e2e tests for ${app}`);
    }
  } finally {
    shutdownRequested = true;

    let serveExitError = null;
    try {
      await shutdownServe(serve, serveExitPromise);
    } catch (error) {
      console.error('[next-e2e] Serve command emitted error:', error);
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

  console.log(`[next-e2e] Finished ${scenario.label}`);
}

async function runKillPort() {
  const { promise } = spawnWithPromise(
    KILL_PORT_ARGS[0],
    KILL_PORT_ARGS.slice(1),
  );
  try {
    await promise;
  } catch (error) {
    console.warn('[next-e2e] kill-port command failed:', error.message);
  }
}

function getWaitFactory(scenario) {
  const waitTargets = scenario.waitTargets ?? [];
  if (!waitTargets.length) {
    return () => spawnWithPromise(process.execPath, ['-e', 'process.exit(0)']);
  }

  return () => spawnWithPromise('npx', ['wait-on', ...waitTargets]);
}

main().catch((error) => {
  console.error('[next-e2e] Error:', error);
  process.exitCode = 1;
});
