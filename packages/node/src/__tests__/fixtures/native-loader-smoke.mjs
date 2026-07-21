/**
 * Executed by register-smoke.test.ts in a child process started with
 * `node --import <dist>/register.mjs`. Serves a fake ESM remote entry and a
 * chunk over local HTTP, then loads them through the native loader.
 */
import assert from 'node:assert';
import { once } from 'node:events';
import http from 'node:http';
import { Worker, isMainThread, parentPort } from 'node:worker_threads';

const chunkSrc = `export const message = 'hello-from-chunk';`;
const entrySrc = [
  `import { message } from './chunk.js';`,
  `const moduleMap = { './hello': () => Promise.resolve(() => message) };`,
  `export function get(id) { return Promise.resolve(moduleMap[id]()); }`,
  `export function init() {}`,
].join('\n');

if (!isMainThread) {
  const server = http.createServer((req, res) => {
    res.setHeader('content-type', 'text/javascript');
    if (req.url === '/remoteEntry.js') {
      res.end(entrySrc);
    } else if (req.url === '/chunk.js') {
      res.end(chunkSrc);
    } else {
      res.statusCode = 404;
      res.end('not found');
    }
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  parentPort.postMessage(server.address().port);
} else {
  // Node 24 waits synchronously for off-thread loader hooks, so the HTTP
  // fixture must run on a separate thread to continue serving requests.
  const serverWorker = new Worker(new URL(import.meta.url), { execArgv: [] });
  const [port] = await once(serverWorker, 'message');
  const origin = `http://127.0.0.1:${port}`;

  try {
    const distSrc = new URL(process.env.MF_NODE_DIST_SRC);
    const { getNativeHttpLoaderState } = await import(
      new URL('loader-hooks/protocol.mjs', distSrc)
    );
    const { loadEntryViaNativeHttpLoader } = await import(
      new URL('loader-hooks/entryLoader.mjs', distSrc)
    );

    const state = getNativeHttpLoaderState();
    assert.ok(state, 'register entry point must create loader state');

    const container = await loadEntryViaNativeHttpLoader({
      name: 'smoke_remote',
      entry: `${origin}/remoteEntry.js`,
      type: 'module',
    });
    const factory = await container.get('./hello');
    assert.strictEqual(factory(), 'hello-from-chunk');

    await assert.rejects(
      import('http://127.0.0.1:1/blocked.js'),
      /allowlist/,
      'unallowed origin should be rejected',
    );

    console.log('native-loader-smoke:ok');
  } finally {
    await serverWorker.terminate();
  }
}
