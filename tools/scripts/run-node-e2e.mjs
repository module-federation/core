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

const NODE_REMOTE_PORTS = ['3022', '3023', '3026', '3027'];
const NODE_HOST_PORT = '3333';
const NODE_WAIT_TIMEOUT_MS = 180_000;
const KILL_PORT_ARGS = [
  'npx',
  'kill-port',
  ...NODE_REMOTE_PORTS,
  NODE_HOST_PORT,
];

const REMOTE_SERVE_CMD = [
  'pnpm',
  'exec',
  'turbo',
  'run',
  'serve:development',
  '--filter=node-remote',
  '--filter=node-local-remote',
  '--filter=node-dynamic-remote',
  '--filter=node-dynamic-remote-new-version',
  '--concurrency=4',
];

const HOST_SERVE_CMD = [
  'pnpm',
  'exec',
  'turbo',
  'run',
  'serve:development',
  '--filter=node-host',
  '--concurrency=1',
];

const E2E_CMD = [
  'pnpm',
  'exec',
  'turbo',
  'run',
  'e2e',
  '--filter=node-host-e2e',
  '--only',
];

async function main() {
  console.log('\n[node-e2e] Starting Node federation topology');

  await runKillPort();

  const remotes = spawnDetached(REMOTE_SERVE_CMD);
  let remotesExitInfo;
  let hostExitInfo;
  let shutdownRequested = false;
  let host = null;

  const remotesExitPromise = new Promise((resolve, reject) => {
    remotes.on('exit', (code, signal) => {
      remotesExitInfo = { code, signal };
      resolve(remotesExitInfo);
    });
    remotes.on('error', reject);
  });

  let hostExitPromise = Promise.resolve({ code: 0, signal: null });

  try {
    await runGuardedCommand(
      'waiting for node federation remotes',
      remotesExitPromise,
      () =>
        spawnWithPromise('npx', [
          'wait-on',
          `--timeout=${NODE_WAIT_TIMEOUT_MS}`,
          ...NODE_REMOTE_PORTS.map((port) => `tcp:${port}`),
        ]),
      () => shutdownRequested,
    );

    host = spawnDetached(HOST_SERVE_CMD);
    hostExitPromise = new Promise((resolve, reject) => {
      host.on('exit', (code, signal) => {
        hostExitInfo = { code, signal };
        resolve(hostExitInfo);
      });
      host.on('error', reject);
    });

    const topologyExitPromise = Promise.race([
      remotesExitPromise,
      hostExitPromise,
    ]);

    await runGuardedCommand(
      'waiting for node federation host',
      topologyExitPromise,
      () =>
        spawnWithPromise('npx', [
          'wait-on',
          `--timeout=${NODE_WAIT_TIMEOUT_MS}`,
          `tcp:${NODE_HOST_PORT}`,
        ]),
      () => shutdownRequested,
    );

    await runGuardedCommand(
      'running node federation e2e tests',
      topologyExitPromise,
      () => spawnWithPromise(E2E_CMD[0], E2E_CMD.slice(1)),
      () => shutdownRequested,
    );
  } finally {
    shutdownRequested = true;

    let shutdownError = null;

    try {
      if (host) {
        await shutdownServe(host, hostExitPromise);
      }
    } catch (error) {
      console.error('[node-e2e] Host command emitted error:', error);
      shutdownError = error;
    }

    try {
      await shutdownServe(remotes, remotesExitPromise);
    } catch (error) {
      console.error('[node-e2e] Remote command emitted error:', error);
      shutdownError ??= error;
    }

    await runKillPort();

    if (shutdownError) {
      throw shutdownError;
    }
  }

  if (!isExpectedServeExit(hostExitInfo)) {
    throw new Error(
      `Host command exited unexpectedly with ${formatExit(hostExitInfo)}`,
    );
  }

  if (!isExpectedServeExit(remotesExitInfo)) {
    throw new Error(
      `Remote command exited unexpectedly with ${formatExit(remotesExitInfo)}`,
    );
  }

  console.log('[node-e2e] Finished Node federation topology');
}

function spawnDetached(command) {
  const child = spawn(command[0], command.slice(1), {
    stdio: 'inherit',
    detached: true,
  });
  child[DETACHED_PROCESS_GROUP] = true;
  return child;
}

async function runKillPort() {
  const { promise } = spawnWithPromise(
    KILL_PORT_ARGS[0],
    KILL_PORT_ARGS.slice(1),
  );
  try {
    await promise;
  } catch (error) {
    console.warn('[node-e2e] kill-port command failed:', error.message);
  }
}

main().catch((error) => {
  console.error('[node-e2e] Error:', error);
  process.exitCode = 1;
});
