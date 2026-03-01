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

const MODERN_APPS = [
  'modernjs-ssr-dynamic-nested-remote',
  'modernjs-ssr-dynamic-remote',
  'modernjs-ssr-dynamic-remote-new-version',
  'modernjs-ssr-host',
  'modernjs-ssr-nested-remote',
  'modernjs-ssr-remote-new-version',
];

const MODERN_PORTS = ['3050', '3052', '3053', '3054', '3055', '3056'];
const MODERN_MANIFEST_URLS = MODERN_PORTS.map(
  (port) => `http://127.0.0.1:${port}/mf-manifest.json`,
);
const MODERN_WAIT_TARGETS = [
  ...MODERN_PORTS.map((port) => `tcp:${port}`),
  ...MODERN_MANIFEST_URLS.map(
    (url) => `http-get://${url.replace('http://', '')}`,
  ),
];

const KILL_PORT_ARGS = ['npx', 'kill-port', ...MODERN_PORTS];
const MODERN_WAIT_TIMEOUT_MS = 180_000;
const MODERN_SERVE_CMD = [
  'pnpm',
  'exec',
  'turbo',
  'run',
  'dev',
  ...MODERN_APPS.map((appName) => `--filter=${appName}`),
  '--concurrency=20',
];

const SCENARIOS = {
  test: {
    label: 'modernjs readiness verification',
    serveCmd: MODERN_SERVE_CMD,
    waitTargets: MODERN_WAIT_TARGETS,
    verifyManifest: true,
  },
  manifest: {
    label: 'modernjs manifest verification',
    serveCmd: MODERN_SERVE_CMD,
    waitTargets: MODERN_WAIT_TARGETS,
    verifyManifest: true,
  },
};

const VALID_MODES = new Set(['test', 'manifest', 'all']);

async function main() {
  const modeArg = process.argv.find((arg) => arg.startsWith('--mode='));
  const mode = modeArg ? modeArg.split('=')[1] : 'test';

  if (!VALID_MODES.has(mode)) {
    console.error(
      `Unknown mode "${mode}". Expected one of ${Array.from(VALID_MODES).join(', ')}`,
    );
    process.exitCode = 1;
    return;
  }

  const targets = mode === 'all' ? ['test', 'manifest'] : [mode];

  for (const target of targets) {
    await runScenario(target);
  }
}

async function runScenario(name) {
  const scenario = SCENARIOS[name];
  if (!scenario) {
    throw new Error(`Unknown scenario: ${name}`);
  }

  console.log(`\n[modern-e2e] Starting ${scenario.label}`);

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
      'waiting for modernjs services',
      serveExitPromise,
      () =>
        spawnWithPromise('npx', [
          'wait-on',
          `--timeout=${MODERN_WAIT_TIMEOUT_MS}`,
          ...scenario.waitTargets,
        ]),
      () => shutdownRequested,
    );

    if (scenario.verifyManifest) {
      await runGuardedCommand(
        'validating modernjs manifest responses',
        serveExitPromise,
        () =>
          spawnWithPromise(process.execPath, [
            '-e',
            buildManifestValidationScript(MODERN_MANIFEST_URLS),
          ]),
        () => shutdownRequested,
      );
    }

    if (scenario.e2eCmd) {
      await runGuardedCommand(
        'running modernjs e2e tests',
        serveExitPromise,
        () => spawnWithPromise(scenario.e2eCmd[0], scenario.e2eCmd.slice(1)),
        () => shutdownRequested,
      );
    }
  } finally {
    shutdownRequested = true;

    let serveExitError = null;
    try {
      await shutdownServe(serve, serveExitPromise);
    } catch (error) {
      console.error('[modern-e2e] Serve command emitted error:', error);
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

  console.log(`[modern-e2e] Finished ${scenario.label}`);
}

async function runKillPort() {
  const { promise } = spawnWithPromise(
    KILL_PORT_ARGS[0],
    KILL_PORT_ARGS.slice(1),
  );
  try {
    await promise;
  } catch (error) {
    console.warn('[modern-e2e] kill-port command failed:', error.message);
  }
}

function buildManifestValidationScript(urls) {
  return `
    (async () => {
      const urls = ${JSON.stringify(urls)};
      await Promise.all(
        urls.map(async (url) => {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(\`\${url} responded with status \${response.status}\`);
          }
          const payload = await response.text();
          try {
            JSON.parse(payload);
          } catch (error) {
            throw new Error(\`\${url} did not return valid JSON\`);
          }
        }),
      );
    })().catch((error) => {
      console.error(error);
      process.exit(1);
    });
  `;
}

main().catch((error) => {
  console.error('[modern-e2e] Error:', error);
  process.exitCode = 1;
});
