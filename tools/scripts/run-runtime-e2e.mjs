#!/usr/bin/env node
import { spawn } from 'node:child_process';

const RUNTIME_WAIT_TARGETS = ['tcp:3005', 'tcp:3006', 'tcp:3007'];

const KILL_PORT_ARGS = ['npx', 'kill-port', '3005', '3006', '3007'];

const DEFAULT_CI_WAIT_MS = 10_000;

const SCENARIOS = {
  dev: {
    label: 'runtime development',
    serveCmd: ['pnpm', 'run', 'app:runtime:dev'],
    e2eCmd: [
      'npx',
      'nx',
      'run-many',
      '--target=test:e2e',
      '--projects=3005-runtime-host',
      '--parallel=1',
    ],
    waitTargets: RUNTIME_WAIT_TARGETS,
    ciWaitMs: DEFAULT_CI_WAIT_MS,
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

  console.log(`\n[runtime-e2e] Starting ${scenario.label}`);

  await runKillPort();

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

  try {
    const { factory: waitFactory, note: waitFactoryNote } =
      getWaitFactory(scenario);
    if (waitFactoryNote) {
      console.log(waitFactoryNote);
    }

    await runGuardedCommand(
      'waiting for runtime demo ports',
      serveExitPromise,
      waitFactory,
      () => shutdownRequested,
    );

    await runGuardedCommand(
      'running runtime e2e tests',
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

function getWaitFactory(scenario) {
  const waitTargets = scenario.waitTargets ?? [];
  if (!waitTargets.length) {
    return {
      factory: () =>
        spawnWithPromise(process.execPath, ['-e', 'process.exit(0)']),
    };
  }

  if (process.env.CI) {
    const waitMs = getCiWaitMs(scenario);
    return {
      factory: () =>
        spawnWithPromise(process.execPath, [
          '-e',
          `setTimeout(() => process.exit(0), ${waitMs});`,
        ]),
      note: `[runtime-e2e] CI detected; sleeping for ${waitMs}ms before running runtime e2e tests`,
    };
  }

  return {
    factory: () => spawnWithPromise('npx', ['wait-on', ...waitTargets]),
  };
}

function getCiWaitMs(scenario) {
  const userOverride = Number.parseInt(
    process.env.RUNTIME_E2E_CI_WAIT_MS ?? '',
    10,
  );
  if (!Number.isNaN(userOverride) && userOverride >= 0) {
    return userOverride;
  }
  if (typeof scenario.ciWaitMs === 'number' && scenario.ciWaitMs >= 0) {
    return scenario.ciWaitMs;
  }
  return DEFAULT_CI_WAIT_MS;
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
  console.error('[runtime-e2e] Error:', error);
  process.exitCode = 1;
});

async function runGuardedCommand(
  description,
  serveExitPromise,
  factory,
  isShutdownRequested = () => false,
) {
  const { child, promise } = factory();

  const serveWatcher = serveExitPromise.then((info) => {
    if (isShutdownRequested()) {
      return info;
    }
    if (child.exitCode === null && child.signalCode === null) {
      sendSignal(child, 'SIGINT');
    }
    throw new Error(
      `Serve process exited while ${description}: ${formatExit(info)}`,
    );
  });

  try {
    return await Promise.race([promise, serveWatcher]);
  } finally {
    serveWatcher.catch(() => {});
    if (child.exitCode === null && child.signalCode === null) {
      // ensure processes do not linger if the command resolved first
      sendSignal(child, 'SIGINT');
    }
  }
}
