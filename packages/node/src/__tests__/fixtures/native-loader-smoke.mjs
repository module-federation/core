/**
 * Executed by register-smoke.test.ts in a child process started with
 * `node --import <dist>/register.mjs`. Serves a fake ESM remote entry and a
 * chunk over local HTTP, then loads them through the native loader.
 */
import assert from 'node:assert';
import http from 'node:http';

const chunkSrc = `export const message = 'hello-from-chunk';`;
const entrySrc = [
  `import { message } from './chunk.js';`,
  `const moduleMap = { './hello': () => Promise.resolve(() => message) };`,
  `export function get(id) { return Promise.resolve(moduleMap[id]()); }`,
  `export function init() {}`,
].join('\n');

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
const origin = `http://127.0.0.1:${server.address().port}`;

const distSrc = new URL(process.env.MF_NODE_DIST_SRC);
const { getNativeHttpLoaderState } = await import(
  new URL('loader-hooks/state.mjs', distSrc)
);
const { loadEntryViaNativeHttpLoader } = await import(
  new URL('loader-hooks/entryLoader.mjs', distSrc)
);

const state = getNativeHttpLoaderState();
assert.ok(state?.enabled, 'register entry point must create loader state');

// Origins outside the allowlist must be refused.
await assert.rejects(
  import(`${origin}/remoteEntry.js`),
  /allowlist/,
  'unallowed origin should be rejected',
);

const container = await loadEntryViaNativeHttpLoader({
  name: 'smoke_remote',
  entry: `${origin}/remoteEntry.js`,
  type: 'module',
});
const factory = await container.get('./hello');
assert.strictEqual(factory(), 'hello-from-chunk');

server.close();
console.log('native-loader-smoke:ok');
