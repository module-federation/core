#!/usr/bin/env node
import { spawn } from 'node:child_process';

// Disable the Nx interactive TUI for all child processes spawned by this script.
process.env.NX_TUI = 'false';

const NEXT_WAIT_TARGETS = ['tcp:3000', 'tcp:3001', 'tcp:3002'];

const KILL_PORT_ARGS = ['npx', 'kill-port', '3000', '3001', '3002'];

const E2E_APPS = ['3000-home', '3001-shop', '3002-checkout'];

// Marks child processes that run in their own process group so we can safely signal the group.
const DETACHED_PROCESS_GROUP = Symbol('detachedProcessGroup');

const SCENARIOS = {
  dev: {
    label: 'next.js development',
    serveCmd: [
      'npx',
      'nx',
      'run-many',
      '--target=serve',
      '--configuration=development',
      `--projects=${E2E_APPS.join(',')}`,
      '--parallel=3',
    ],
    e2eApps: E2E_APPS,
    waitTargets: NEXT_WAIT_TARGETS,
  },
  prod: {
    label: 'next.js production',
    buildCmd: [
      'npx',
      'nx',
      'run-many',
      '--target=build',
      '--configuration=production',
      `--projects=${E2E_APPS.join(',')}`,
      '--parallel=3',
    ],
    serveCmd: [
      'npx',
      'nx',
      'run-many',
      '--target=serve',
      '--configuration=production',
      `--projects=${E2E_APPS.join(',')}`,
      '--parallel=3',
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
    const { factory: waitFactory, note: waitFactoryNote } =
      getWaitFactory(scenario);
    if (waitFactoryNote) {
      console.log(waitFactoryNote);
    }

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
        () => spawnWithPromise('npx', ['nx', 'run', `${app}:e2e`]),
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

function spawnWithPromise(cmd, args, options = {}) {
  const child = spawn(cmd, args, {
    stdio: 'inherit',
    ...options,
  });
  if (options.detached) {
    child[DETACHED_PROCESS_GROUP] = true;
  }

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

  return {
    factory: () => spawnWithPromise('npx', ['wait-on', ...waitTargets]),
  };
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
      if (error.name !== 'TimeoutError') {
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
  console.error('[next-e2e] Error:', error);
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
      sendSignal(child, 'SIGINT');
    }
  }
}
