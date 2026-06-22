#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import {
  dirname,
  extname,
  join,
  normalize,
  relative,
  resolve,
} from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '../..');
const HOST_READY_URL = 'http://127.0.0.1:3050/';
const HOST_PROBE_URL = 'http://127.0.0.1:3050/remove-remote-cache-fast';
const WAIT_TIMEOUT_MS = 60_000;
const WAIT_INTERVAL_MS = 500;
const REQUEST_DELAY_MS = 250;

const args = new Set(process.argv.slice(2));
const getArgValue = (name, fallback) => {
  const prefix = `${name}=`;
  const arg = process.argv.slice(2).find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : fallback;
};

const iterations = Number(getArgValue('--iterations', '20'));
const warmup = Number(getArgValue('--warmup', '3'));
const maxGrowthMb = Number(getArgValue('--max-growth-mb', '20'));
const strict = args.has('--strict');

if (!Number.isInteger(iterations) || iterations < 1) {
  throw new Error('--iterations must be a positive integer');
}
if (!Number.isInteger(warmup) || warmup < 1) {
  throw new Error('--warmup must be a positive integer');
}
if (!Number.isFinite(maxGrowthMb) || maxGrowthMb < 0) {
  throw new Error('--max-growth-mb must be a non-negative number');
}

const staticApps = [
  {
    name: 'remote v1',
    port: 3051,
    root: join(REPO_ROOT, 'apps/modernjs-ssr/remote/dist'),
    requiredPath: 'static/mf-manifest.json',
  },
  {
    name: 'nested remote',
    port: 3052,
    root: join(REPO_ROOT, 'apps/modernjs-ssr/nested-remote/dist'),
    requiredPath: 'mf-manifest.json',
  },
  {
    name: 'remote v2',
    port: 3055,
    root: join(REPO_ROOT, 'apps/modernjs-ssr/remote-new-version/dist'),
    requiredPath: 'mf-manifest.json',
  },
];

const requiredFiles = [
  join(REPO_ROOT, 'apps/modernjs-ssr/host/dist/mf-manifest.json'),
  ...staticApps.map((app) => join(app.root, app.requiredPath)),
  join(
    REPO_ROOT,
    'apps/modernjs-ssr/host/node_modules/@modern-js/app-tools/bin/modern.js',
  ),
];

const contentTypes = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.map': 'application/json',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
  '.zip': 'application/zip',
};

function assertBuildOutputs() {
  const missing = requiredFiles.filter((file) => !existsSync(file));
  if (missing.length > 0) {
    throw new Error(
      [
        'Missing Modern SSR build output:',
        ...missing.map((file) => `  - ${relative(REPO_ROOT, file)}`),
        'Run `pnpm run app:modern:build` before this probe.',
      ].join('\n'),
    );
  }
}

async function startStaticServer({ name, port, root }) {
  const server = createServer(async (req, res) => {
    const urlPath = decodeURIComponent(
      new URL(req.url || '/', HOST_READY_URL).pathname,
    );
    const requestPath = urlPath === '/' ? '/index.html' : urlPath;
    const file = resolve(root, normalize(requestPath).replace(/^[/\\]+/, ''));

    if (!file.startsWith(root)) {
      res.statusCode = 403;
      res.end('forbidden');
      return;
    }

    try {
      const fileStat = await stat(file);
      if (!fileStat.isFile()) {
        res.statusCode = 404;
        res.end('not found');
        return;
      }
    } catch {
      res.statusCode = 404;
      res.end('not found');
      return;
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Content-Type',
      contentTypes[extname(file)] || 'application/octet-stream',
    );
    createReadStream(file).pipe(res);
  });

  await new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen);
    server.listen(port, () => {
      server.off('error', rejectListen);
      resolveListen();
    });
  });

  console.log(`[gc-probe] ${name} static server: http://localhost:${port}`);
  return server;
}

function startHost() {
  const cli = join(
    REPO_ROOT,
    'apps/modernjs-ssr/host/node_modules/@modern-js/app-tools/bin/modern.js',
  );
  const child = spawn(process.execPath, ['--expose-gc', cli, 'serve'], {
    cwd: join(REPO_ROOT, 'apps/modernjs-ssr/host'),
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk) => {
    process.stdout.write(prefixLines('[host]', chunk));
  });
  child.stderr.on('data', (chunk) => {
    process.stderr.write(prefixLines('[host]', chunk));
  });

  return child;
}

function prefixLines(prefix, chunk) {
  return chunk
    .toString()
    .split(/(\r?\n)/)
    .map((part) =>
      part === '\n' || part === '\r\n' || part === ''
        ? part
        : `${prefix} ${part}`,
    )
    .join('');
}

async function waitForHost(child) {
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < WAIT_TIMEOUT_MS) {
    if (child.exitCode !== null) {
      throw new Error(
        `host exited before it became ready, code ${child.exitCode}`,
      );
    }

    try {
      const response = await fetch(HOST_READY_URL);
      if (response.status < 500) {
        return;
      }
      lastError = new Error(`host responded with ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await delay(WAIT_INTERVAL_MS);
  }

  throw new Error(
    `host did not become ready: ${lastError?.message || 'timeout'}`,
  );
}

async function requestProbe() {
  const response = await fetch(HOST_PROBE_URL);
  const html = await response.text();
  if (!response.ok) {
    throw new Error(`${HOST_PROBE_URL} responded with ${response.status}`);
  }

  const match = html.match(
    /<pre id="remove-remote-cache-result">([\s\S]*?)<\/pre>/,
  );
  if (!match) {
    throw new Error('probe result was not found in host response');
  }

  return JSON.parse(decodeHtml(match[1]));
}

function decodeHtml(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function findSnapshot(result, label) {
  const snapshot = result.snapshots.find((item) => item.label === label);
  if (!snapshot) {
    throw new Error(`snapshot "${label}" was not found`);
  }
  return snapshot;
}

function validateProbeResult(result) {
  if (!result.gcAvailable) {
    throw new Error(
      'host did not expose global.gc; the host must run with --expose-gc',
    );
  }
  if (result.heavyStats?.version !== 'v1') {
    throw new Error(
      `expected initial remote v1, got ${result.heavyStats?.version}`,
    );
  }
  if (result.reloadedHeavyStats?.version !== 'v2') {
    throw new Error(
      `expected reloaded remote v2, got ${result.reloadedHeavyStats?.version}`,
    );
  }
  if (result.removeRemoteError) {
    throw new Error(`removeRemote failed: ${result.removeRemoteError}`);
  }
  if (
    result.clearCacheCalls.length !== 1 ||
    result.clearCacheCalls[0].result !== 'resolved'
  ) {
    throw new Error(
      'removeRemote did not trigger a successful clearCache call',
    );
  }
}

function analyzeProbe(result) {
  validateProbeResult(result);

  const afterLoad = findSnapshot(result, 'after load');
  const afterRemove = findSnapshot(result, 'after removeRemote');
  const afterGc = findSnapshot(result, 'after gc');
  const afterReload = findSnapshot(result, 'after reload');

  return {
    afterLoad,
    afterRemove,
    afterGc,
    afterReload,
    heapAfterRemoveToGc: round(afterGc.heapUsedMb - afterRemove.heapUsedMb),
    heapAfterLoadToGc: round(afterGc.heapUsedMb - afterLoad.heapUsedMb),
    rssAfterRemoveToGc: round(afterGc.rssMb - afterRemove.rssMb),
    oldRemoteRemoved:
      !afterGc.globalSnapshotKeys.includes(
        'remote:http://127.0.0.1:3051/static/mf-manifest.json',
      ) &&
      !Object.values(afterGc.hostSnapshotRemotesInfo).includes(
        'http://127.0.0.1:3051/static/mf-manifest.json',
      ) &&
      !afterGc.moduleCacheKeys.includes('remote'),
    newRemoteLoaded: Object.values(
      afterReload.hostSnapshotRemotesInfo,
    ).includes('http://127.0.0.1:3055/mf-manifest.json'),
  };
}

function printProbe(index, analysis) {
  const decreased = analysis.heapAfterRemoveToGc < 0;
  const sign = (value) => (value > 0 ? `+${value}` : String(value));

  console.log(`\n[gc-probe] iteration ${index}`);
  console.log(
    [
      `  after load heap/rss: ${analysis.afterLoad.heapUsedMb}/${analysis.afterLoad.rssMb} MB`,
      `  after remove heap/rss: ${analysis.afterRemove.heapUsedMb}/${analysis.afterRemove.rssMb} MB`,
      `  after gc heap/rss: ${analysis.afterGc.heapUsedMb}/${analysis.afterGc.rssMb} MB`,
      `  after reload heap/rss: ${analysis.afterReload.heapUsedMb}/${analysis.afterReload.rssMb} MB`,
      `  heap remove -> gc: ${sign(analysis.heapAfterRemoveToGc)} MB`,
      `  heap load -> gc: ${sign(analysis.heapAfterLoadToGc)} MB`,
      `  rss remove -> gc: ${sign(analysis.rssAfterRemoveToGc)} MB`,
      `  old remote removed before reload: ${analysis.oldRemoteRemoved}`,
      `  new remote loaded after reload: ${analysis.newRemoteLoaded}`,
      `  heap decreased after gc: ${decreased}`,
    ].join('\n'),
  );
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

async function closeHost(child) {
  if (!child || child.exitCode !== null) {
    return;
  }

  child.kill('SIGINT');
  await Promise.race([
    new Promise((resolveExit) => child.once('exit', resolveExit)),
    delay(8000).then(() => {
      if (child.exitCode === null) {
        child.kill('SIGKILL');
      }
    }),
  ]);
}

async function main() {
  assertBuildOutputs();

  const staticServers = [];
  let host;
  let failed = false;

  const cleanup = async () => {
    await closeHost(host);
    await Promise.all(
      staticServers.map(
        (server) => new Promise((resolveClose) => server.close(resolveClose)),
      ),
    );
  };

  process.once('SIGINT', () => {
    cleanup().finally(() => process.exit(130));
  });

  try {
    for (const app of staticApps) {
      staticServers.push(await startStaticServer(app));
    }

    host = startHost();
    await waitForHost(host);
    console.log('[gc-probe] host ready with --expose-gc');
    console.log(
      `[gc-probe] probing ${HOST_PROBE_URL} for ${iterations} iteration(s)`,
    );

    const analyses = [];
    for (let index = 1; index <= iterations; index += 1) {
      const result = await requestProbe();
      const analysis = analyzeProbe(result);
      analyses.push(analysis);
      printProbe(index, analysis);

      if (index < iterations) {
        await delay(REQUEST_DELAY_MS);
      }
    }

    const decreasedCount = analyses.filter(
      (analysis) => analysis.heapAfterRemoveToGc < 0,
    ).length;
    const oldRemoteRemoved = analyses.every(
      (analysis) => analysis.oldRemoteRemoved,
    );
    const newRemoteLoaded = analyses.every(
      (analysis) => analysis.newRemoteLoaded,
    );

    console.log(
      `\n[gc-probe] heap decreased after gc in ${decreasedCount}/${iterations} iteration(s)`,
    );
    console.log(
      `[gc-probe] old remote removed before reload: ${oldRemoteRemoved}`,
    );
    console.log(
      `[gc-probe] new remote loaded after reload: ${newRemoteLoaded}`,
    );

    const baselineIndex = Math.min(warmup, analyses.length) - 1;
    const baseline = analyses[baselineIndex];
    const final = analyses[analyses.length - 1];
    const afterWarmup = analyses.slice(baselineIndex);
    const heapAfterGcGrowth = round(
      final.afterGc.heapUsedMb - baseline.afterGc.heapUsedMb,
    );
    const heapAfterReloadGrowth = round(
      final.afterReload.heapUsedMb - baseline.afterReload.heapUsedMb,
    );
    const maxHeapAfterGcGrowth = round(
      Math.max(
        ...afterWarmup.map(
          (analysis) =>
            analysis.afterGc.heapUsedMb - baseline.afterGc.heapUsedMb,
        ),
      ),
    );
    const maxHeapAfterReloadGrowth = round(
      Math.max(
        ...afterWarmup.map(
          (analysis) =>
            analysis.afterReload.heapUsedMb - baseline.afterReload.heapUsedMb,
        ),
      ),
    );

    console.log(
      `[gc-probe] baseline iteration: ${baselineIndex + 1} (warmup=${warmup})`,
    );
    console.log(
      `[gc-probe] final after-gc heap growth: ${heapAfterGcGrowth} MB (limit ${maxGrowthMb} MB)`,
    );
    console.log(
      `[gc-probe] final after-reload heap growth: ${heapAfterReloadGrowth} MB (limit ${maxGrowthMb} MB)`,
    );
    console.log(
      `[gc-probe] max after-gc heap growth after warmup: ${maxHeapAfterGcGrowth} MB`,
    );
    console.log(
      `[gc-probe] max after-reload heap growth after warmup: ${maxHeapAfterReloadGrowth} MB`,
    );

    if (
      heapAfterGcGrowth > maxGrowthMb ||
      heapAfterReloadGrowth > maxGrowthMb
    ) {
      failed = true;
      console.error(
        '[gc-probe] memory growth check failed: heap did not stabilize after warmup',
      );
    }

    if (!oldRemoteRemoved || !newRemoteLoaded) {
      failed = true;
    }

    if (strict && decreasedCount !== iterations) {
      failed = true;
      console.error(
        '[gc-probe] strict mode failed: heap did not decrease after gc in every iteration',
      );
    }
  } finally {
    await cleanup();
  }

  if (failed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('[gc-probe] Error:', error);
  process.exitCode = 1;
});
