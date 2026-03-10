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

const RUNTIME_PORTS = ['3005', '3006', '3007'];
const RUNTIME_WAIT_TARGETS = [
  ...RUNTIME_PORTS.map((port) => `tcp:${port}`),
  'http-get://127.0.0.1:3005/',
  'http-get://127.0.0.1:3006/mf-manifest.json',
  'http-get://127.0.0.1:3007/mf-manifest.json',
];
const RUNTIME_SERVE_APPS = [
  'runtime-host',
  'runtime-remote1',
  'runtime-remote2',
];
const RUNTIME_E2E_APP = 'runtime-host';

const KILL_PORT_ARGS = ['npx', 'kill-port', ...RUNTIME_PORTS];
const RUNTIME_WAIT_TIMEOUT_MS = 180_000;

const SCENARIOS = {
  dev: {
    label: 'runtime demo e2e',
    serveCmd: [
      'pnpm',
      'exec',
      'turbo',
      'run',
      'serve:development',
      ...RUNTIME_SERVE_APPS.map((appName) => `--filter=${appName}`),
    ],
    e2eCmd: [
      'pnpm',
      'exec',
      'turbo',
      'run',
      'e2e',
      `--filter=${RUNTIME_E2E_APP}`,
    ],
    waitTargets: RUNTIME_WAIT_TARGETS,
  },
};

const VALID_MODES = new Set(['dev', 'all']);

async function main() {
  const modeArg = process.argv.find((arg) => arg.startsWith('--mode='));
  const mode = modeArg ? modeArg.split('=')[1] : 'dev';

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

  console.log(`\n[runtime-e2e] Starting ${scenario.label}`);

  await runKillPort();

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
    await runGuardedCommand(
      'waiting for runtime demo services',
      serveExitPromise,
      () =>
        spawnWithPromise('npx', [
          'wait-on',
          `--timeout=${RUNTIME_WAIT_TIMEOUT_MS}`,
          ...scenario.waitTargets,
        ]),
      () => shutdownRequested,
    );

    await runGuardedCommand(
      'running runtime demo e2e tests',
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
      console.error('[runtime-e2e] Serve command emitted error:', error);
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

  console.log(`[runtime-e2e] Finished ${scenario.label}`);
}

async function runKillPort() {
  const { promise } = spawnWithPromise(
    KILL_PORT_ARGS[0],
    KILL_PORT_ARGS.slice(1),
  );
  try {
    await promise;
  } catch (error) {
    console.warn('[runtime-e2e] kill-port command failed:', error.message);
  }
}

main().catch((error) => {
  console.error('[runtime-e2e] Error:', error);
  process.exitCode = 1;
});
