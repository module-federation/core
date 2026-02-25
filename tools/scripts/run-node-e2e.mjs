#!/usr/bin/env node
import { spawn } from 'node:child_process';

process.env.NX_TUI = 'false';

const REMOTE_PROJECTS =
  'node-local-remote,node-remote,node-dynamic-remote-new-version,node-dynamic-remote';
const HOST_PROJECT = 'node-host';

const REMOTE_WAIT_TARGETS = [
  'file:apps/node-local-remote/dist/remoteEntry.js',
  'http-get://127.0.0.1:3022/remoteEntry.js',
  'http-get://127.0.0.1:3026/remoteEntry.js',
  'http-get://127.0.0.1:3027/remoteEntry.js',
];
const HOST_WAIT_TARGETS = ['http-get://127.0.0.1:3333/api'];
const KILL_PORT_ARGS = [
  'npx',
  'kill-port',
  '3022',
  '3023',
  '3026',
  '3027',
  '3333',
];

const DETACHED_PROCESS_GROUP = Symbol('detachedProcessGroup');

async function main() {
  console.log('\n[node-e2e] Starting node federation e2e');

  await runKillPort();

  const remotes = spawn(
    'npx',
    [
      'nx',
      'run-many',
      '--target=serve',
      `--projects=${REMOTE_PROJECTS}`,
      '--parallel=10',
    ],
    {
      stdio: 'inherit',
      detached: true,
      env: childEnv(),
    },
  );
  remotes[DETACHED_PROCESS_GROUP] = true;

  let remotesExitInfo;
  let hostExitInfo;

  const remotesExitPromise = watchProcessExit(remotes, (info) => {
    remotesExitInfo = info;
  });

  let host = null;
  let hostExitPromise = Promise.resolve({ code: 0, signal: null });

  try {
    await runGuardedCommand(
      'waiting for remotes to be ready',
      [{ label: 'remote serve', exitPromise: remotesExitPromise }],
      (signal) =>
        spawnWithPromise(
          'npx',
          ['wait-on', '--timeout', '180000', ...REMOTE_WAIT_TARGETS],
          {
            signal,
            env: childEnv(),
          },
        ),
    );

    host = spawn(
      'npx',
      ['nx', 'run-many', '--target=serve', `--projects=${HOST_PROJECT}`],
      {
        stdio: 'inherit',
        detached: true,
        env: childEnv(),
      },
    );
    host[DETACHED_PROCESS_GROUP] = true;

    hostExitPromise = watchProcessExit(host, (info) => {
      hostExitInfo = info;
    });

    const activeProcesses = [
      { label: 'remote serve', exitPromise: remotesExitPromise },
      { label: 'host serve', exitPromise: hostExitPromise },
    ];

    await runGuardedCommand(
      'waiting for host API to be ready',
      activeProcesses,
      (signal) =>
        spawnWithPromise(
          'npx',
          ['wait-on', '--timeout', '180000', ...HOST_WAIT_TARGETS],
          {
            signal,
            env: childEnv(),
          },
        ),
    );

    await runGuardedCommand(
      'running node federation e2e tests',
      activeProcesses,
      (signal) =>
        spawnWithPromise('npx', ['nx', 'run', 'node-host-e2e:e2e'], {
          signal,
          env: childEnv(),
        }),
    );
  } finally {
    let shutdownError = null;

    if (host) {
      try {
        await shutdownServe(host, hostExitPromise);
      } catch (error) {
        shutdownError = shutdownError ?? error;
        console.error('[node-e2e] Failed to stop host serve process:', error);
      }
    }

    try {
      await shutdownServe(remotes, remotesExitPromise);
    } catch (error) {
      shutdownError = shutdownError ?? error;
      console.error('[node-e2e] Failed to stop remote serve process:', error);
    }

    await runKillPort();

    if (shutdownError) {
      throw shutdownError;
    }
  }

  if (!isExpectedServeExit(remotesExitInfo)) {
    throw new Error(
      `Remote serve exited unexpectedly with ${formatExit(remotesExitInfo)}`,
    );
  }

  if (host && !isExpectedServeExit(hostExitInfo)) {
    throw new Error(
      `Host serve exited unexpectedly with ${formatExit(hostExitInfo)}`,
    );
  }

  console.log('[node-e2e] Finished node federation e2e');
}

function childEnv() {
  return {
    ...process.env,
    NX_TUI: 'false',
  };
}

function spawnWithPromise(cmd, args, options = {}) {
  const child = spawn(cmd, args, {
    stdio: 'inherit',
    ...options,
  });
  if (options.detached) {
    child[DETACHED_PROCESS_GROUP] = true;
  }

  const promise = watchProcessExit(child).then((info) => {
    if (info.code === 0) {
      return info;
    }
    throw new Error(
      `${cmd} ${args.join(' ')} exited with ${formatExit({ code: info.code, signal: info.signal })}`,
    );
  });

  return { child, promise };
}

function watchProcessExit(proc, onExit) {
  return new Promise((resolve, reject) => {
    proc.on('exit', (code, signal) => {
      const info = { code, signal };
      onExit?.(info);
      resolve(info);
    });
    proc.on('error', reject);
  });
}

async function runGuardedCommand(description, watchedProcesses, factory) {
  const controller = new AbortController();
  const { child, promise } = factory(controller.signal);

  const watchedPromises = watchedProcesses.map(({ label, exitPromise }) =>
    exitPromise.then((info) => {
      if (child.exitCode === null && child.signalCode === null) {
        controller.abort();
      }
      throw new Error(
        `${label} exited while ${description}: ${formatExit(info)}`,
      );
    }),
  );

  try {
    await Promise.race([promise, ...watchedPromises]);
  } finally {
    if (child.exitCode === null && child.signalCode === null) {
      controller.abort();
    }
  }
}

async function runKillPort() {
  const { promise } = spawnWithPromise(
    KILL_PORT_ARGS[0],
    KILL_PORT_ARGS.slice(1),
    {
      env: childEnv(),
    },
  );
  try {
    await promise;
  } catch (error) {
    console.warn('[node-e2e] kill-port command failed:', error.message);
  }
}

async function shutdownServe(proc, exitPromise) {
  if (proc.exitCode !== null || proc.signalCode !== null) {
    return exitPromise;
  }

  const sequence = [
    { signal: 'SIGINT', timeoutMs: 8000 },
    { signal: 'SIGTERM', timeoutMs: 5000 },
    { signal: 'SIGKILL', timeoutMs: 3000 },
  ];

  for (const { signal, timeoutMs } of sequence) {
    if (proc.exitCode !== null || proc.signalCode !== null) {
      break;
    }

    sendSignal(proc, signal);

    try {
      await waitWithTimeout(exitPromise, timeoutMs);
      break;
    } catch (error) {
      if (error?.name !== 'TimeoutError') {
        throw error;
      }
    }
  }

  return exitPromise;
}

function sendSignal(proc, signal) {
  if (proc.exitCode !== null || proc.signalCode !== null) {
    return;
  }

  if (proc[DETACHED_PROCESS_GROUP]) {
    try {
      process.kill(-proc.pid, signal);
      return;
    } catch (error) {
      if (error.code !== 'ESRCH' && error.code !== 'EPERM') {
        throw error;
      }
    }
  }

  try {
    proc.kill(signal);
  } catch (error) {
    if (error.code !== 'ESRCH') {
      throw error;
    }
  }
}

function waitWithTimeout(promise, timeoutMs) {
  return new Promise((resolve, reject) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      const timeoutError = new Error(`Timed out after ${timeoutMs}ms`);
      timeoutError.name = 'TimeoutError';
      reject(timeoutError);
    }, timeoutMs);

    promise.then(
      (value) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function isExpectedServeExit(info) {
  if (!info) {
    return false;
  }

  const { code, signal } = info;
  if (code === 0) {
    return true;
  }

  return signal === 'SIGINT' || signal === 'SIGTERM' || signal === 'SIGKILL';
}

function formatExit(info) {
  if (!info) {
    return 'unknown exit';
  }

  if (typeof info.code === 'number') {
    return `code ${info.code}`;
  }

  if (info.signal) {
    return `signal ${info.signal}`;
  }

  return 'unknown exit';
}

main().catch((error) => {
  console.error('[node-e2e] Failed:', error);
  process.exitCode = 1;
});
