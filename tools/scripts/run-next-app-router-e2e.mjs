#!/usr/bin/env node
import { spawn } from 'node:child_process';

process.env.NX_TUI = 'false';

const APPS = [
  {
    name: 'next-app-router-4000',
    port: 4000,
    cwd: 'apps/next-app-router/next-app-router-4000',
  },
  {
    name: 'next-app-router-4001',
    port: 4001,
    cwd: 'apps/next-app-router/next-app-router-4001',
  },
];

const MODES = new Set(['dev', 'prod', 'all']);
const DETACHED_PROCESS_GROUP = Symbol('detachedProcessGroup');

function shouldUseXvfb() {
  return process.platform === 'linux' && !process.env.CYPRESS_NO_XVFB;
}

function wrapWithXvfb(command, args) {
  if (!shouldUseXvfb()) {
    return { command, args };
  }
  return { command: 'xvfb-run', args: ['-a', command, ...args] };
}

function withNextWebpackEnv(extraEnv = {}) {
  return {
    ...process.env,
    ...(process.env.NEXT_PRIVATE_LOCAL_WEBPACK
      ? { NEXT_PRIVATE_LOCAL_WEBPACK: process.env.NEXT_PRIVATE_LOCAL_WEBPACK }
      : {}),
    ...extraEnv,
  };
}

async function main() {
  const modeArg = process.argv.find((arg) => arg.startsWith('--mode='));
  const mode = modeArg ? modeArg.split('=')[1] : 'all';

  if (!MODES.has(mode)) {
    console.error(
      `Unknown mode "${mode}". Expected one of ${Array.from(MODES).join(', ')}`,
    );
    process.exitCode = 1;
    return;
  }

  const scenarioModes = mode === 'all' ? ['dev', 'prod'] : [mode];
  for (const scenarioMode of scenarioModes) {
    await runScenario(scenarioMode);
  }
}

async function runScenario(mode) {
  console.log(`\n[next-app-router-e2e] Starting ${mode} scenario`);
  await runKillPort();

  if (mode === 'prod') {
    await buildApps();
  }

  const servers = startServers(mode);
  const firstServerExit = waitForFirstServerExit(servers);
  let shutdownRequested = false;

  try {
    await runGuardedCommand(
      'wait for app-router servers',
      firstServerExit,
      () => {
        const waitTargets = APPS.map((app) => `tcp:${app.port}`);
        return spawnWithPromise('npx', ['wait-on', ...waitTargets]);
      },
      () => shutdownRequested,
    );

    if (mode === 'prod') {
      await warmProductionRoutes(firstServerExit, () => shutdownRequested);
    }

    for (const app of APPS) {
      const { command, args } = wrapWithXvfb('npx', [
        'nx',
        'run',
        `${app.name}:e2e`,
        '--output-style=static',
      ]);
      await runGuardedCommand(
        `run ${app.name}:e2e`,
        firstServerExit,
        () => spawnWithPromise(command, args),
        () => shutdownRequested,
      );
    }
  } finally {
    shutdownRequested = true;
    let stopError = null;
    try {
      await stopServers(servers);
    } catch (error) {
      console.error(
        '[next-app-router-e2e] Failed to stop server processes:',
        error,
      );
      stopError = error;
    }
    await runKillPort();
    if (stopError) {
      throw stopError;
    }
  }

  console.log(`[next-app-router-e2e] Finished ${mode} scenario`);
}

async function buildApps() {
  console.log('[next-app-router-e2e] Building app-router apps...');
  for (const app of APPS) {
    await spawnWithPromise('npx', ['next', 'build', '--webpack'], {
      cwd: app.cwd,
      env: withNextWebpackEnv(),
    }).promise;
  }
}

function startServers(mode) {
  return APPS.map((app) => {
    const args =
      mode === 'prod'
        ? ['next', 'start', '-p', String(app.port)]
        : ['next', 'dev', '--webpack', '-p', String(app.port)];

    const child = spawn('npx', args, {
      stdio: 'inherit',
      cwd: app.cwd,
      env: withNextWebpackEnv(),
      detached: true,
    });
    child[DETACHED_PROCESS_GROUP] = true;

    const exitPromise = new Promise((resolve, reject) => {
      child.on('exit', (code, signal) => {
        resolve({ app: app.name, code, signal });
      });
      child.on('error', reject);
    });

    return { app, child, exitPromise };
  });
}

function waitForFirstServerExit(servers) {
  return Promise.race(servers.map(({ exitPromise }) => exitPromise));
}

async function stopServers(servers) {
  await Promise.all(
    servers.map(({ child, exitPromise }) =>
      shutdownProcess(child, exitPromise),
    ),
  );
}

async function warmProductionRoutes(serverExitPromise, isShutdownRequested) {
  const urls = APPS.flatMap((app) => [
    `http://localhost:${app.port}/`,
    `http://localhost:${app.port}/_next/static/chunks/mf-manifest.json`,
  ]);

  await warmUrls({
    urls,
    label: 'route',
    maxAttempts: 5,
    delayMs: 900,
    serverExitPromise,
    isShutdownRequested,
  });
}

async function runKillPort() {
  const ports = APPS.map((app) => String(app.port));
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await spawnWithPromise('npx', ['kill-port', ...ports]).promise;
      return;
    } catch (error) {
      const isFinalAttempt = attempt === 2;
      console.warn(
        `[next-app-router-e2e] kill-port attempt ${attempt + 1} failed: ${error.message}`,
      );

      if (isFinalAttempt) {
        return;
      }
      await sleep(700);
    }
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

async function runGuardedCommand(
  label,
  serverExitPromise,
  commandFactory,
  isShutdownRequested,
) {
  if (isShutdownRequested()) {
    return;
  }

  const { child, promise } = commandFactory();
  const serverExitError = serverExitPromise.then((info) => {
    if (isShutdownRequested()) {
      return info;
    }

    if (child.exitCode === null && child.signalCode === null) {
      sendSignal(child, 'SIGINT');
    }

    const error = new Error(
      `[next-app-router-e2e] Server exited while trying to ${label}: ${formatExit(info)}`,
    );
    error.name = 'ServeExitError';
    throw error;
  });

  try {
    return await Promise.race([promise, serverExitError]);
  } finally {
    serverExitError.catch(() => {});
    if (child.exitCode === null && child.signalCode === null) {
      sendSignal(child, 'SIGINT');
    }
  }
}

function formatExit(info) {
  if (!info) {
    return 'unknown';
  }
  if (info.signal) {
    return `signal ${info.signal}`;
  }
  if (typeof info.code === 'number') {
    return `code ${info.code}`;
  }
  return 'unknown';
}

async function warmUrls({
  urls,
  label,
  maxAttempts,
  delayMs,
  serverExitPromise,
  isShutdownRequested,
}) {
  const warmedUrls = new Set();

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    for (const url of urls) {
      if (warmedUrls.has(url)) {
        continue;
      }

      try {
        await runGuardedCommand(
          `warm ${label} ${url}`,
          serverExitPromise,
          () => spawnWithPromise('curl', ['-sf', '-o', '/dev/null', url]),
          isShutdownRequested,
        );
        warmedUrls.add(url);
      } catch (error) {
        if (error?.name === 'ServeExitError') {
          throw error;
        }
        console.warn(
          `[next-app-router-e2e] warmup attempt ${attempt + 1} failed for ${url}: ${error.message}`,
        );
      }
    }

    if (warmedUrls.size === urls.length) {
      return;
    }

    await sleep(delayMs);
  }

  const missing = urls.filter((url) => !warmedUrls.has(url));
  throw new Error(
    `[next-app-router-e2e] Failed to warm ${missing.length} ${label} URL(s): ${missing.join(', ')}`,
  );
}

async function shutdownProcess(proc, exitPromise) {
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error('\n[next-app-router-e2e] Failed:', error);
  process.exitCode = 1;
});
