process.env.NODE_ENV = 'production';
const fs = require('node:fs/promises');
const path = require('node:path');
const { once } = require('node:events');
const { randomUUID } = require('node:crypto');
const r = require('node:module').createRequire(
  path.join(
    process.env.SSR_CACHE_PACKAGES_ROOT || path.resolve(__dirname, '..'),
    'package.json',
  ),
);
const { createProdServer } = r('@modern-js/prod-server');
const { createSSRUpdateAdapter } = r('@module-federation/modern-js-v3/server');
const kind = process.env.LAB_KIND;
const root = process.env.LAB_ROOT;
const assetURL = process.env.LAB_ASSETS;
let application,
  server,
  held,
  heldStarted = false;
let dynamic = false,
  version = 'v1',
  lastUpdate;
const records = [];
const record = (value) => {
  records.push(value);
  if (records.length > 128) records.shift();
};
const adapter = createSSRUpdateAdapter({
  name: 'lab_' + kind,
  entries: ['index', 'b'],
  staticOnly: kind === 'static',
  hydration: {
    remotes: [{ name: 'remote', entry: assetURL + '/v1/mf-manifest.json' }],
  },
});
globalThis.__labRequest = async (request) => {
  const url = new URL(request.url);
  const id = url.searchParams.get('id') || randomUUID();
  const entered = Date.now();
  record({ id, event: 'loader-enter', at: entered });
  if (url.searchParams.has('hold') && held) {
    heldStarted = true;
    await held.promise;
  }
  const result = {
    requestId: id,
    loaderEntered: entered,
    renderedAt: Date.now(),
    pid: process.pid,
    generation: application.status.generation,
    dynamic: kind === 'dynamic' && dynamic,
  };
  record({ id, event: 'loader-exit', at: Date.now() });
  return result;
};
function status() {
  return {
    kind,
    pid: process.pid,
    version,
    dynamic,
    status: application.status,
    plan: adapter.plan('remote'),
    held: heldStarted,
    lastUpdate,
    records,
  };
}
async function update(next, register = false) {
  if (!['v1', 'v2'].includes(next)) throw Error('Expected v1 or v2');
  record({ event: 'update-start', at: Date.now() });
  try {
    const remotes = [
      {
        name: 'remote',
        entry: assetURL + '/' + next + '/mf-manifest.json',
        client: { entry: assetURL + '/' + next + '/mf-manifest.json' },
      },
    ];
    if (kind === 'dynamic' && (dynamic || register))
      remotes.push({
        name: 'lab_palette',
        entry: assetURL + '/palette/' + next + '/mf-manifest.json',
        client: { entry: assetURL + '/palette/' + next + '/mf-manifest.json' },
      });
    lastUpdate = await adapter.updateRemotes(application, remotes);
    version = next;
    if (register) dynamic = true;
    record({ event: 'update-complete', at: Date.now(), result: lastUpdate });
    return lastUpdate;
  } catch (e) {
    record({
      event: 'update-failed',
      at: Date.now(),
      error: String(e),
      failedStage: e.failedStage,
    });
    throw e;
  }
}
function release() {
  held?.resolve();
  held = undefined;
  heldStarted = false;
}
(async () => {
  server = await createProdServer({
    pwd: path.join(root, kind, 'dist'),
    serverConfigPath: path.join(root, 'missing-config'),
    config: {
      server: { ssr: true },
      output: {},
      source: {},
      tools: {},
      html: {},
      bff: {},
      dev: {},
      security: {},
    },
    appContext: { apiDirectory: '', lambdaDirectory: '' },
    routes: JSON.parse(
      await fs.readFile(path.join(root, kind, 'dist/route.json')),
    ).routes,
    ssrApplication: {
      maxPendingRequests: 16,
      requestTimeoutMs: 3000,
      drainTimeoutMs: 15000,
      onReady(a) {
        application = a;
      },
      resolveScope(request) {
        return [new URL(request.url).pathname.startsWith('/b') ? 'b' : 'index'];
      },
      reloadEntry: adapter.reload,
      async dispose(_, entries) {
        adapter.dispose(entries);
      },
      async validate(resources) {
        adapter.prepareResources(resources);
      },
      async bypass(request) {
        const url = new URL(request.url);
        if (!url.pathname.startsWith('/__lab/')) return;
        try {
          if (url.pathname === '/__lab/status') return Response.json(status());
          if (url.pathname === '/__lab/client-remote')
            return Response.json({
              name: 'lab_palette',
              entry: assetURL + '/palette/' + version + '/mf-manifest.json',
            });
          if (request.method !== 'POST')
            return new Response('POST required', { status: 405 });
          if (url.pathname === '/__lab/update')
            return Response.json(
              await update(
                url.searchParams.get('v'),
                url.searchParams.has('dynamic'),
              ),
            );
          if (url.pathname === '/__lab/arm') {
            if (held || application.status.phase !== 'serving')
              return new Response('Experiment already active', { status: 409 });
            records.length = 0;
            let resolve;
            const promise = new Promise((r) => {
              resolve = r;
            });
            held = { promise, resolve };
            return Response.json({ armed: true });
          }
          if (url.pathname === '/__lab/release') {
            release();
            return Response.json({ released: true });
          }
          if (url.pathname === '/__lab/sample') {
            if (
              application.status.phase !== 'serving' ||
              application.status.activeRequests ||
              application.status.pendingRequests
            )
              return new Response('Wait for the application to become idle', {
                status: 409,
              });
            const gc = url.searchParams.has('gc');
            if (gc) {
              if (!global.gc)
                return new Response('Start with --expose-gc', { status: 409 });
              global.gc();
              await new Promise(setImmediate);
              global.gc();
            }
            const memory = process.memoryUsage();
            return Response.json({
              at: Date.now(),
              pid: process.pid,
              kind,
              gc,
              ...memory,
              generation: application.status.generation,
              instances: globalThis.__FEDERATION__?.__INSTANCES__?.length,
              status: application.status,
            });
          }
          if (url.pathname === '/__lab/snapshot') {
            if (
              application.status.activeRequests ||
              application.status.phase !== 'serving'
            )
              return new Response('Wait for idle', { status: 409 });
            const file = require('node:v8').writeHeapSnapshot(
              path.join(root, kind + '-' + Date.now() + '.heapsnapshot'),
            );
            return Response.json({ file, pid: process.pid });
          }
          return new Response('Unknown control', { status: 404 });
        } catch (e) {
          return Response.json(
            { error: String(e), failedStage: e.failedStage },
            { status: 500 },
          );
        }
      },
    },
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = 'http://127.0.0.1:' + server.address().port;
  for (const route of ['/', '/b']) {
    const response = await fetch(url + route);
    const body = await response.text();
    if (response.status !== 200 || !body.includes('SSR / PLAYGROUND'))
      throw Error('Warmup failed ' + route + ': ' + body.slice(0, 300));
  }
  process.send?.({
    ready: true,
    url,
    kind,
    pid: process.pid,
    plan: adapter.plan('remote'),
  });
  console.log('HOST_READY', kind, url, JSON.stringify(adapter.plan('remote')));
})().catch((e) => {
  console.error(require('node:util').inspect(e, { depth: 10 }));
  process.exit(1);
});
async function stop() {
  release();
  server?.closeAllConnections();
  if (server) await new Promise((r) => server.close(r));
  adapter.dispose();
  process.exit();
}
process.once('SIGTERM', stop);
process.once('SIGINT', stop);
process.once('disconnect', stop);
