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
    await stopServers(servers);
    await runKillPort();
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
    });

    return { app, child };
  });
}

function waitForFirstServerExit(servers) {
  return Promise.race(
    servers.map(
      ({ app, child }) =>
        new Promise((resolve, reject) => {
          child.on('exit', (code, signal) => {
            resolve({ app: app.name, code, signal });
          });
          child.on('error', reject);
        }),
    ),
  );
}

async function stopServers(servers) {
  await Promise.all(
    servers.map(async ({ child }) => {
      if (child.exitCode !== null) {
        return;
      }

      child.kill('SIGTERM');
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (child.exitCode === null) {
        child.kill('SIGKILL');
      }
    }),
  );
}

async function warmProductionRoutes(serverExitPromise, isShutdownRequested) {
  const urls = APPS.flatMap((app) => [
    `http://localhost:${app.port}/`,
    `http://localhost:${app.port}/_next/static/chunks/remoteEntry.js`,
  ]);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    for (const url of urls) {
      try {
        await runGuardedCommand(
          `warm ${url}`,
          serverExitPromise,
          () => spawnWithPromise('curl', ['-sf', url]),
          isShutdownRequested,
        );
      } catch (error) {
        if (error?.name === 'ServeExitError') {
          throw error;
        }
        console.warn(
          `[next-app-router-e2e] warmup attempt ${attempt + 1} failed for ${url}: ${error.message}`,
        );
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 900));
  }
}

async function runKillPort() {
  const ports = APPS.map((app) => String(app.port));
  try {
    await spawnWithPromise('npx', ['kill-port', ...ports]).promise;
  } catch (error) {
    console.warn(
      '[next-app-router-e2e] kill-port command failed:',
      error.message,
    );
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

async function runGuardedCommand(
  label,
  serverExitPromise,
  commandFactory,
  isShutdownRequested,
) {
  if (isShutdownRequested()) {
    return;
  }

  const serverExitError = serverExitPromise.then((info) => {
    const error = new Error(
      `[next-app-router-e2e] Server exited while trying to ${label}: ${formatExit(info)}`,
    );
    error.name = 'ServeExitError';
    throw error;
  });

  const command = commandFactory();
  await Promise.race([command.promise, serverExitError]);
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

main().catch((error) => {
  console.error('\n[next-app-router-e2e] Failed:', error);
  process.exitCode = 1;
});
