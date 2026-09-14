process.env.NODE_ENV = 'production';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { injectResourcePlugin, createNodeServer } = require(
  process.env.SSR_CACHE_MODERN_ENTRY,
);
const out = path.join(process.env.SSR_CACHE_CASE_DIR, 'dist');
const route = {
  entryName: 'main',
  bundle: 'host.cjs',
  entryPath: 'index.html',
  urlPath: '/',
};
globalThis.executions = {
  boot: 0,
  leaf: 0,
  middle: 0,
  page: 0,
  other: 0,
  dynamic: 0,
};
fs.writeFileSync(path.join(out, 'index.html'), '<html></html>');
function prepareResources() {
  const context = { middlewares: [], routes: [route], distDirectory: out };
  let prepare;
  injectResourcePlugin().setup({
    onPrepare(fn) {
      prepare = fn;
    },
    getServerContext() {
      return context;
    },
  });
  prepare();
  return context.middlewares.find((m) => m.name === 'inject-server-manifest')
    .handler;
}
async function getManifest(middleware) {
  const data = new Map();
  await middleware(
    { get: (k) => data.get(k), set: (k, v) => data.set(k, v) },
    async () => {},
  );
  return data.get('serverManifest');
}
async function main() {
  let resources = prepareResources();
  let manifest = await getManifest(resources);
  let host = manifest.renderBundles.main;
  const instance = host.req.federation.instance;
  const remote = (v) => ({
    name: 'dynamic',
    entry: path.join(out, v + '.cjs'),
    type: 'commonjs-module',
    entryGlobalName: v,
  });
  instance.registerRemotes([remote('v1')]);
  const server = await createNodeServer(async (request) => {
    const manifest = await getManifest(resources);
    return (await manifest.renderBundles.main.requestHandler)(request, {});
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject);
      resolve();
    });
  });
  const address = server.address();
  const read = async () => {
    const res = await fetch('http://127.0.0.1:' + address.port, {
      signal: AbortSignal.timeout(10000),
    });
    return { status: res.status, text: await res.text() };
  };
  const results = { pid: process.pid, port: address.port };
  try {
    results.initial = await read();
    assert.equal(results.initial.text, 'v1');
    await instance.removeRemote('dynamic');
    instance.registerRemotes([remote('v2')]);
    results.remoteUpdateOnly = await read();
    for (const key of Object.keys(require.cache))
      if (key.startsWith(out + path.sep)) delete require.cache[key];
    results.clearNodeCacheOnly = await read();
    const oldManifest = manifest;
    resources = prepareResources();
    manifest = await getManifest(resources);
    results.recreateResources = await read();
    results.manifestReplaced = manifest !== oldManifest;
    results.mfInstanceReused =
      manifest.renderBundles.main.req.federation.instance === instance;
    results.pidUnchanged = process.pid === results.pid;
    results.portUnchanged = server.address().port === results.port;
    assert.equal(results.remoteUpdateOnly.text, 'v1');
    assert.equal(results.clearNodeCacheOnly.text, 'v1');
    assert.equal(results.recreateResources.text, 'v2');
    console.log(JSON.stringify(results, null, 2));
    fs.writeFileSync(
      path.join(process.env.SSR_CACHE_CASE_DIR, 'modern-result.json'),
      JSON.stringify(results, null, 2),
    );
  } finally {
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
