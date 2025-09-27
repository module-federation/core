#!/usr/bin/env node
import { spawn } from 'node:child_process';

const MANIFEST_WAIT_TARGETS = [
  'tcp:3009',
  'tcp:3012',
  'http://127.0.0.1:4001/',
];

const KILL_PORT_ARGS = [
  'npx',
  'kill-port',
  '3013',
  '3009',
  '3010',
  '3011',
  '3012',
  '4001',
];

const SCENARIOS = {
  dev: {
    label: 'manifest development',
    serveCmd: ['pnpm', 'run', 'app:manifest:dev'],
    e2eCmd: [
      'npx',
      'nx',
      'run-many',
      '--target=e2e',
      '--projects=manifest-webpack-host',
      '--parallel=2',
    ],
    waitTargets: MANIFEST_WAIT_TARGETS,
  },
  prod: {
    label: 'manifest production',
    serveCmd: ['pnpm', 'run', 'app:manifest:prod'],
    e2eCmd: [
      'npx',
      'nx',
      'run-many',
      '--target=e2e',
      '--projects=manifest-webpack-host',
      '--parallel=1',
    ],
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

  let serveExitInfo;
  let shutdownRequested = false;

  const serveExitPromise = new Promise((resolve, reject) => {
    serve.on('exit', (code, signal) => {
      serveExitInfo = { code, signal };
      resolve(serveExitInfo);
    });
    serve.on('error', reject);
  });

  const guard = (commandDescription, factory) => {
    const controller = new AbortController();
    const { signal } = controller;
    const { child, promise } = factory(signal);

    const watchingPromise = serveExitPromise.then((info) => {
      if (!shutdownRequested) {
        if (child.exitCode === null && child.signalCode === null) {
          controller.abort();
        }
        throw new Error(
          `Serve process exited while ${commandDescription}: ${formatExit(info)}`,
        );
      }
      return info;
    });

    return Promise.race([promise, watchingPromise]).finally(() => {
      if (child.exitCode === null && child.signalCode === null) {
        controller.abort();
      }
    });
  };

  const runCommand = (cmd, args, signal) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      signal,
    });

    const promise = new Promise((resolve, reject) => {
      child.on('exit', (code, childSignal) => {
        if (code === 0) {
          resolve({ code, signal: childSignal });
        } else {
          reject(
            new Error(
              `${cmd} ${args.join(' ')} exited with ${formatExit({ code, signal: childSignal })}`,
            ),
          );
        }
      });
      child.on('error', reject);
    });

    return { child, promise };
  };

  try {
    await guard('waiting for manifest services', (signal) =>
      runCommand('npx', ['wait-on', ...scenario.waitTargets], signal),
    );

    await guard('running manifest e2e tests', (signal) =>
      runCommand(scenario.e2eCmd[0], scenario.e2eCmd.slice(1), signal),
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

function spawnWithPromise(cmd, args, options = {}) {
  const child = spawn(cmd, args, {
    stdio: 'inherit',
    ...options,
  });

  const promise = new Promise((resolve, reject) => {
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve({ code, signal });
      } else {
        reject(
          new Error(
            `${cmd} ${args.join(' ')} exited with ${formatExit({ code, signal })}`,
          ),
        );
      }
    });
    child.on('error', reject);
  });

  return { child, promise };
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
      // escalate to next signal on timeout
    }
  }

  return exitPromise;
}

function sendSignal(proc, signal) {
  if (proc.exitCode !== null || proc.signalCode !== null) {
    return;
  }

  try {
    process.kill(-proc.pid, signal);
  } catch (error) {
    if (error.code !== 'ESRCH' && error.code !== 'EPERM') {
      throw error;
    }
    try {
      proc.kill(signal);
    } catch (innerError) {
      if (innerError.code !== 'ESRCH') {
        throw innerError;
      }
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

  if (code === 130 || code === 137 || code === 143) {
    return true;
  }

  if (code == null && ['SIGINT', 'SIGTERM', 'SIGKILL'].includes(signal)) {
    return true;
  }

  return false;
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

main().catch((error) => {
  console.error('[manifest-e2e] Error:', error);
  process.exitCode = 1;
});
