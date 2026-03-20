#!/usr/bin/env node
import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import {
  DETACHED_PROCESS_GROUP,
  formatExit,
  isExpectedServeExit,
  runGuardedCommand,
  shutdownServe,
  spawnWithPromise,
} from './e2e-process-utils.mjs';

const NEXT_WAIT_TARGETS = ['tcp:3000', 'tcp:3001', 'tcp:3002'];
const NEXT_DEV_READINESS_CHECKS = [
  {
    label: 'home client manifest',
    url: 'http://localhost:3000/_next/static/chunks/mf-manifest.json',
    expect: 'json',
  },
  {
    label: 'shop client manifest',
    url: 'http://localhost:3001/_next/static/chunks/mf-manifest.json',
    expect: 'json',
  },
  {
    label: 'shop server manifest',
    url: 'http://localhost:3001/_next/static/ssr/mf-manifest.json',
    expect: 'json',
  },
  {
    label: 'checkout client manifest',
    url: 'http://localhost:3002/_next/static/chunks/mf-manifest.json',
    expect: 'json',
  },
  {
    label: 'checkout server manifest',
    url: 'http://localhost:3002/_next/static/ssr/mf-manifest.json',
    expect: 'json',
  },
  {
    label: 'home page',
    url: 'http://localhost:3000/',
    expect: 'html',
  },
];
const NEXT_READINESS_TIMEOUT_MS = 120000;
const NEXT_READINESS_RETRY_MS = 1000;

const KILL_PORT_ARGS = ['npx', 'kill-port', '3000', '3001', '3002'];

const E2E_APPS = [
  '@module-federation/3000-home',
  '@module-federation/3001-shop',
  '@module-federation/3002-checkout',
];
const NEXT_APP_OUTPUTS = [
  new URL('../../apps/3000-home/.next', import.meta.url),
  new URL('../../apps/3001-shop/.next', import.meta.url),
  new URL('../../apps/3002-checkout/.next', import.meta.url),
];
const TURBO_CONCURRENCY_FLOOR = 20;
const NEXT_SERVE_CONCURRENCY = Math.max(
  TURBO_CONCURRENCY_FLOOR,
  E2E_APPS.length,
);
const NEXT_BUILD_CONCURRENCY = Math.max(
  TURBO_CONCURRENCY_FLOOR,
  E2E_APPS.length,
);

function turboRun(task, apps, options = {}) {
  const args = [
    'pnpm',
    'exec',
    'turbo',
    'run',
    task,
    ...apps.map((appName) => `--filter=${appName}`),
  ];

  if (options.concurrency) {
    args.push(`--concurrency=${options.concurrency}`);
  }

  if (options.only) {
    args.push('--only');
  }

  return args;
}

const SCENARIOS = {
  dev: {
    label: 'next.js development',
    serveCmd: turboRun('serve:development', E2E_APPS, {
      concurrency: NEXT_SERVE_CONCURRENCY,
    }),
    e2eApps: E2E_APPS,
    readinessChecks: NEXT_DEV_READINESS_CHECKS,
    waitTargets: NEXT_WAIT_TARGETS,
  },
  prod: {
    label: 'next.js production',
    buildCmd: turboRun('build:production', E2E_APPS, {
      concurrency: NEXT_BUILD_CONCURRENCY,
    }),
    serveCmd: turboRun('serve:production', E2E_APPS, {
      concurrency: NEXT_SERVE_CONCURRENCY,
    }),
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
  await removeNextOutputs();

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
    const waitFactory = getWaitFactory(scenario);

    await runGuardedCommand(
      'waiting for next.js servers',
      serveExitPromise,
      waitFactory,
      () => shutdownRequested,
    );
    await waitForScenarioReadiness(scenario);

    // Run e2e tests for each app sequentially
    for (const app of scenario.e2eApps) {
      console.log(`\n[next-e2e] Running e2e tests for ${app}`);
      const e2eCmd = turboRun('e2e', [app], { only: true });
      await runGuardedCommand(
        `running e2e tests for ${app}`,
        serveExitPromise,
        () => spawnWithPromise(e2eCmd[0], e2eCmd.slice(1)),
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

async function removeNextOutputs() {
  await Promise.all(
    NEXT_APP_OUTPUTS.map(async (outputPath) => {
      await fs.rm(outputPath, {
        recursive: true,
        force: true,
      });
    }),
  );
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function findJsonDocumentEnd(source) {
  let depth = 0;
  let started = false;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < source.length; index++) {
    const character = source[index];

    if (!started) {
      if (character.trim() === '') {
        continue;
      }

      if (character !== '{' && character !== '[') {
        return undefined;
      }

      started = true;
      depth = 1;
      continue;
    }

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (character === '\\') {
        escaped = true;
        continue;
      }

      if (character === '"') {
        inString = false;
      }

      continue;
    }

    if (character === '"') {
      inString = true;
      continue;
    }

    if (character === '{' || character === '[') {
      depth += 1;
      continue;
    }

    if (character === '}' || character === ']') {
      depth -= 1;

      if (depth === 0) {
        return index + 1;
      }
    }
  }

  return undefined;
}

async function waitForScenarioReadiness(scenario) {
  const checks = scenario.readinessChecks ?? [];
  if (!checks.length) {
    return;
  }

  console.log('[next-e2e] Waiting for HTTP readiness checks...');
  const deadline = Date.now() + NEXT_READINESS_TIMEOUT_MS;
  let lastError;

  while (Date.now() < deadline) {
    try {
      await Promise.all(checks.map(runReadinessCheck));
      console.log('[next-e2e] HTTP readiness checks passed');
      return;
    } catch (error) {
      lastError = error;
      await sleep(NEXT_READINESS_RETRY_MS);
    }
  }

  throw new Error(
    `[next-e2e] Timed out waiting for readiness checks: ${lastError?.message || 'unknown error'}`,
  );
}

async function runReadinessCheck(check) {
  const response = await fetch(check.url, {
    cache: 'no-store',
  });
  const body = await response.text();

  if (!response.ok) {
    throw new Error(`${check.label} returned ${response.status}`);
  }

  if (check.expect === 'json') {
    const documentEnd = findJsonDocumentEnd(body);
    if (documentEnd === undefined) {
      throw new Error(`${check.label} did not return JSON`);
    }

    JSON.parse(body.slice(0, documentEnd));
    return;
  }

  if (check.expect === 'html' && !body.includes('<html')) {
    throw new Error(`${check.label} did not return HTML`);
  }
}

function getWaitFactory(scenario) {
  const waitTargets = scenario.waitTargets ?? [];
  if (!waitTargets.length) {
    return () => spawnWithPromise(process.execPath, ['-e', 'process.exit(0)']);
  }

  return () => spawnWithPromise('npx', ['wait-on', ...waitTargets]);
}

main().catch((error) => {
  console.error('[next-e2e] Error:', error);
  process.exitCode = 1;
});
