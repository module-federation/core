#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { constants } from 'node:fs';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

process.env.CI = process.env.CI ?? 'true';

const DETACHED_PROCESS_GROUP = Symbol('detachedProcessGroup');
const VALID_PLATFORMS = new Set(['android', 'ios']);

main().catch((error) => {
  console.error('[metro-e2e] Failed:', error);
  process.exitCode = 1;
});

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!options.platform || !VALID_PLATFORMS.has(options.platform)) {
    throw new Error(
      `Unknown or missing --platform. Expected one of: ${Array.from(VALID_PLATFORMS).join(', ')}`,
    );
  }
  if (!options.appName) {
    throw new Error('Missing --appName=<name>.');
  }

  if (options.platform === 'ios' && process.platform !== 'darwin') {
    if (options.skipOnMissingPrereqs) {
      console.log('[metro-e2e] Skipped: iOS Metro E2E requires macOS.');
      return;
    }
    throw new Error('iOS Metro E2E requires macOS.');
  }

  const prerequisitesOk = await checkPrerequisites(options);
  if (!prerequisitesOk) {
    return;
  }

  console.log(
    `[metro-e2e] Starting ${options.platform} e2e for "${options.appName}"`,
  );

  await configureRnefCacheAuth(options);

  await runCommand('pnpm', [
    '--filter',
    options.appName,
    `e2e:prepare:${options.platform}`,
  ]);

  const serve = spawn(
    'pnpm',
    ['--filter', options.appName, `e2e:serve:${options.platform}`],
    {
      stdio: 'inherit',
      env: process.env,
      detached: true,
    },
  );
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
    if (options.platform === 'android') {
      await runGuardedCommand(
        'running Metro Android release app',
        serveExitPromise,
        () =>
          runCommand('pnpm', ['--filter', options.appName, 'android:release']),
        () => shutdownRequested,
      );
      await runGuardedCommand(
        'running Metro Android adb reverse',
        serveExitPromise,
        () => runCommand('pnpm', ['--filter', options.appName, 'adbreverse']),
        () => shutdownRequested,
      );
      await runGuardedCommand(
        'running Metro Android e2e tests',
        serveExitPromise,
        () =>
          runCommand('pnpm', ['--filter', options.appName, 'e2e:run:android']),
        () => shutdownRequested,
      );
    } else {
      await runGuardedCommand(
        'running Metro iOS release app',
        serveExitPromise,
        () => runCommand('pnpm', ['--filter', options.appName, 'ios:release']),
        () => shutdownRequested,
      );
      await runGuardedCommand(
        'running Metro iOS e2e tests',
        serveExitPromise,
        () => runCommand('pnpm', ['--filter', options.appName, 'e2e:run:ios']),
        () => shutdownRequested,
      );
    }
  } finally {
    shutdownRequested = true;

    let serveExitError = null;
    try {
      await shutdownServe(serve, serveExitPromise);
    } catch (error) {
      console.error('[metro-e2e] Serve command emitted error:', error);
      serveExitError = error;
    }

    if (serveExitError) {
      throw serveExitError;
    }
  }

  if (!isExpectedServeExit(serveExitInfo)) {
    throw new Error(
      `Metro serve command exited unexpectedly with ${formatExit(serveExitInfo)}`,
    );
  }

  console.log(`[metro-e2e] Finished ${options.platform} e2e`);
}

function parseArgs(argv) {
  const result = {
    platform: null,
    appName: null,
    skipRnefCacheAuth: false,
    skipOnMissingPrereqs: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--skip-rnef-cache-auth') {
      result.skipRnefCacheAuth = true;
      continue;
    }
    if (arg === '--skip-on-missing-prereqs') {
      result.skipOnMissingPrereqs = true;
      continue;
    }

    if (arg.startsWith('--platform=')) {
      result.platform = arg.slice('--platform='.length);
      continue;
    }

    if (arg.startsWith('--appName=')) {
      result.appName = arg.slice('--appName='.length);
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return result;
}

function isEnabledEnvFlag(value) {
  return value === 'true' || value === '1';
}

async function checkPrerequisites(options) {
  const hasMaestro = await commandExists('maestro');
  if (!hasMaestro) {
    return handleMissingPrereq(
      options,
      'maestro CLI is required for Metro E2E. Install it via https://maestro.mobile.dev/getting-started/installing-maestro',
    );
  }

  const canWriteMaestroHome = await hasWritableMaestroHome();
  if (!canWriteMaestroHome) {
    return handleMissingPrereq(
      options,
      `Write access to ${join(process.env.HOME ?? '~', '.maestro')} is required for Metro E2E tooling.`,
    );
  }

  if (options.platform === 'android') {
    const hasAdb = await commandExists('adb');
    if (!hasAdb) {
      return handleMissingPrereq(
        options,
        'Android SDK command-line tools (adb) are required for Metro Android E2E.',
      );
    }
  }

  if (options.platform === 'ios') {
    const hasXcrun = await commandExists('xcrun');
    if (!hasXcrun) {
      return handleMissingPrereq(
        options,
        'Xcode command-line tools (xcrun) are required for Metro iOS E2E.',
      );
    }
  }

  return true;
}

function handleMissingPrereq(options, message) {
  if (options.skipOnMissingPrereqs) {
    console.log(`[metro-e2e] Skipped: ${message}`);
    return false;
  }
  throw new Error(message);
}

async function commandExists(command) {
  const result = await runShell(`command -v "${command}" >/dev/null 2>&1`, {
    allowFailure: true,
  });
  return result.code === 0;
}

async function hasWritableMaestroHome() {
  const home = process.env.HOME;
  if (!home) {
    return false;
  }
  const maestroHome = join(home, '.maestro');
  try {
    await mkdir(maestroHome, { recursive: true });
    await access(maestroHome, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

async function configureRnefCacheAuth(options) {
  if (options.skipRnefCacheAuth) {
    console.log('[metro-e2e] Skipping RNEF cache auth configuration.');
    return;
  }

  const githubToken = process.env.GITHUB_TOKEN?.trim();
  if (!githubToken) {
    console.log(
      '[metro-e2e] GITHUB_TOKEN not set; skipping RNEF cache auth configuration.',
    );
    return;
  }

  const rnefPath = join('apps', `metro-${options.appName}`, '.rnef', 'cache');
  await mkdir(rnefPath, { recursive: true });
  await writeFile(
    join(rnefPath, 'project.json'),
    JSON.stringify({ githubToken }),
    'utf8',
  );
}

async function runGuardedCommand(
  commandDescription,
  serveExitPromise,
  factory,
  isShutdownRequested,
) {
  const commandPromise = factory();
  const serveWatchPromise = serveExitPromise.then((info) => {
    if (!isShutdownRequested()) {
      throw new Error(
        `Metro serve process exited while ${commandDescription}: ${formatExit(info)}`,
      );
    }
    return info;
  });

  await Promise.race([commandPromise, serveWatchPromise]);
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
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      const error = new Error(`Timed out after ${timeoutMs}ms`);
      error.name = 'TimeoutError';
      reject(error);
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

function isExpectedServeExit(exitInfo) {
  if (!exitInfo) {
    return false;
  }
  if (exitInfo.code === 0) {
    return true;
  }
  return ['SIGINT', 'SIGTERM', 'SIGKILL'].includes(exitInfo.signal);
}

function formatExit({ code, signal } = {}) {
  const parts = [];
  if (code !== null && code !== undefined) {
    parts.push(`code ${code}`);
  }
  if (signal) {
    parts.push(`signal ${signal}`);
  }
  return parts.length > 0 ? parts.join(', ') : 'unknown status';
}

function runCommand(command, args = [], options = {}) {
  const { cwd, allowFailure = false, env = process.env } = options;
  const child = spawn(command, args, {
    stdio: 'inherit',
    cwd,
    env,
  });

  return new Promise((resolve, reject) => {
    child.on('exit', (code, signal) => {
      if (code === 0 || allowFailure) {
        resolve({ code, signal });
        return;
      }
      reject(
        new Error(
          `${command} ${args.join(' ')} exited with ${formatExit({ code, signal })}`,
        ),
      );
    });
    child.on('error', reject);
  });
}

function runShell(command, options = {}) {
  return runCommand('bash', ['-lc', command], options);
}
