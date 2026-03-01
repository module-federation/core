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

const MANIFEST_WAIT_TARGETS = [
  'tcp:3009',
  'tcp:3010',
  'tcp:3011',
  'tcp:3012',
  'tcp:3013',
  'http-get://localhost:3009/mf-manifest.json',
  'http-get://localhost:3010/mf-manifest.json',
  'http-get://localhost:3011/mf-manifest.json',
  'http-get://localhost:3012/remoteEntry.js',
  'http-get://localhost:3013/',
];

const KILL_PORT_ARGS = [
  'npx',
  'kill-port',
  '3013',
  '3009',
  '3010',
  '3011',
  '3012',
];

const SCENARIOS = {
  dev: {
    label: 'manifest development',
    serveCmd: ['pnpm', 'run', 'app:manifest:dev'],
    e2eCmd: ['pnpm', '--filter', '3008-webpack-host', 'run', 'e2e'],
    waitTargets: MANIFEST_WAIT_TARGETS,
  },
  prod: {
    label: 'manifest production',
    serveCmd: ['pnpm', 'run', 'app:manifest:prod'],
    e2eCmd: ['pnpm', '--filter', '3008-webpack-host', 'run', 'e2e'],
    waitTargets: MANIFEST_WAIT_TARGETS,
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

  console.log(`\n[manifest-e2e] Starting ${scenario.label}`);

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
      'waiting for manifest services',
      serveExitPromise,
      () => spawnWithPromise('npx', ['wait-on', ...scenario.waitTargets]),
      () => shutdownRequested,
    );

    await runGuardedCommand(
      'running manifest e2e tests',
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
      console.error('[manifest-e2e] Serve command emitted error:', error);
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

  console.log(`[manifest-e2e] Finished ${scenario.label}`);
}

async function runKillPort() {
  const { promise } = spawnWithPromise(
    KILL_PORT_ARGS[0],
    KILL_PORT_ARGS.slice(1),
  );
  try {
    await promise;
  } catch (error) {
    console.warn('[manifest-e2e] kill-port command failed:', error.message);
  }
}

main().catch((error) => {
  console.error('[manifest-e2e] Error:', error);
  process.exitCode = 1;
});
