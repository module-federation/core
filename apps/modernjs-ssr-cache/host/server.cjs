process.env.NODE_ENV = 'production';
const fs = require('node:fs/promises');
const path = require('node:path');
const { once } = require('node:events');
const { createProdServer } = require('@modern-js/prod-server');
const {
  createSSRUpdateAdapter,
} = require('@module-federation/modern-js-v3/server');
const root = __dirname;
const assets = process.env.SSR_CACHE_ASSET_URL;
let application,
  server,
  origin,
  busy = false,
  dynamic = false,
  result;
const versions = { tomorrow: 'v1', 'day-after': 'v1' };
const history = [];
const entry = (day, version) =>
  assets +
  (day === 'tomorrow' ? '/' : '/palette/') +
  version +
  '/mf-manifest.json';
const remote = (day, version) => ({
  name: day === 'tomorrow' ? 'remote' : 'lab_palette',
  entry: entry(day, version),
  client: { entry: entry(day, version) },
});
// Static ownership is valid only until the server activates the dynamic page.
// Runtime ownership tracking independently observes its register/load calls.
const options = {
  name: 'lab_static',
  entries: ['tomorrow', 'day-after', 'memo'],
  get staticOnly() {
    return !dynamic;
  },
  hydration: { remotes: [remote('tomorrow', 'v1'), remote('day-after', 'v1')] },
};
let adapter = createSSRUpdateAdapter(options);
function instance() {
  const inst = globalThis.__FEDERATION__?.__INSTANCES__?.find(
    (i) => i.name === 'lab_static',
  );
  if (!inst) throw Error('Host MF instance is not ready');
  return inst;
}
globalThis.__weatherVisit = async (request) => {
  const day = new URL(request.url).pathname.startsWith('/day-after')
    ? 'day-after'
    : 'tomorrow';
  if (day === 'day-after') {
    dynamic = true;
    const mf = instance();
    if (!mf.options.remotes.some((r) => r.name === 'lab_palette')) {
      const { client, ...registration } = remote(day, versions[day]);
      mf.registerRemotes([registration]);
    }
  }
  return { day, dynamic, pid: process.pid, result };
};
// Invoked by the server-only lazy component, only when /day-after renders.
// Browser hydration uses its own normal MF loadRemote call and release mapping.
globalThis.__weatherLoad = () => instance().loadRemote('lab_palette/Weather');
async function idle() {
  const deadline = Date.now() + 15000;
  while (
    application.status.activeRequests ||
    application.status.pendingRequests
  ) {
    if (Date.now() > deadline) throw Error('SSR requests have not settled');
    await new Promise((r) => setTimeout(r, 10));
  }
}
async function sample() {
  await idle();
  if (!global.gc) throw Error('请使用 start.cjs --memory 启动以开启 GC');
  const started = performance.now();
  const preGC = process.memoryUsage();
  global.gc();
  await new Promise(setImmediate);
  global.gc();
  return {
    ...process.memoryUsage(),
    preGC,
    gcMs: performance.now() - started,
    pid: process.pid,
    sampledAt: new Date().toISOString(),
    gc: 'completed',
  };
}
async function html(route) {
  const r = await fetch(origin + route);
  const body = await r.text();
  if (!r.ok) throw Error('SSR failed: ' + r.status);
  return body;
}
async function memo() {
  const text = await html('/memo');
  const match = text.match(
    /<script type="application\/json" id="memo-evidence">(.*?)<\/script>/s,
  );
  if (!match) throw Error('Missing server memo evidence');
  return JSON.parse(match[1]);
}
async function update(day) {
  if (busy) throw Error('已有更新正在执行');
  if (!['tomorrow', 'day-after'].includes(day)) throw Error('Unknown page');
  busy = true;
  try {
    const oldInstance = new WeakRef(instance());
    const beforeMemo = await memo();
    const before = await sample();
    const next = versions[day] === 'v1' ? 'v2' : 'v1';
    const changes = [remote(day, next)];
    const outcome = await adapter.updateRemotes(application, changes);
    versions[day] = next;
    const route = day;
    const body = await html('/' + route);
    if (!body.includes('data-release="' + versions[route] + '"'))
      throw Error('SSR weather version did not match update');
    const afterMemo = await memo();
    const after = await sample();
    {
      const preserved = beforeMemo.id === afterMemo.id;
      result = {
        mf: {
          oldInstanceCollected: !oldInstance.deref(),
          oldInstanceDisposed: oldInstance.deref()?.disposed ?? true,
          hostInstances: globalThis.__FEDERATION__.__INSTANCES__.filter(
            (i) => i.name === 'lab_static',
          ).length,
          registeredInstances: globalThis.__FEDERATION__.__INSTANCES__.map(
            (i) => i.name,
          ),
        },
        summary:
          (day === 'tomorrow' ? '明天' : '后天') +
          '预报已更新 · ' +
          (preserved ? '出行备忘保留' : '出行备忘已重新初始化'),
        before,
        after,
        beforeMemo,
        afterMemo,
        mode: outcome.mode,
        version: next,
        generation: outcome.generation,
      };
      history.push(result);
      if (history.length > 20) history.shift();
    }
    return { result };
  } finally {
    busy = false;
  }
}
(async () => {
  server = await createProdServer({
    pwd: path.join(root, 'dist'),
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
    routes: JSON.parse(await fs.readFile(path.join(root, 'dist/route.json')))
      .routes,
    ssrApplication: {
      maxPendingRequests: 16,
      requestTimeoutMs: 3000,
      drainTimeoutMs: 15000,
      onReady(value) {
        application = value;
      },
      resolveScope(request) {
        const p = new URL(request.url).pathname;
        return [
          p.startsWith('/static/')
            ? '$assets'
            : p.startsWith('/memo')
              ? 'memo'
              : p.startsWith('/day-after')
                ? 'day-after'
                : 'tomorrow',
        ];
      },
      reloadEntry: adapter.reload,
      dispose(_, entries) {
        return adapter.dispose(entries);
      },
      validate(resources) {
        adapter.prepareResources(resources);
      },
      async bypass(request) {
        const url = new URL(request.url);
        if (url.pathname === '/')
          return Response.redirect(new URL('/tomorrow', request.url), 302);
        if (!url.pathname.startsWith('/__weather/')) return;
        try {
          if (url.pathname === '/__weather/state')
            return Response.json({
              pid: process.pid,
              dynamic,
              versions,
              status: application.status,
              plan: adapter.plan('remote'),
              result,
              history,
            });
          if (request.method !== 'POST')
            return new Response('POST required', { status: 405 });
          if (url.pathname === '/__weather/reset') {
            if (busy) throw Error('请等待更新完成');
            busy = true;
            try {
              await application.update(async () => {
                await adapter.dispose(undefined, { preserveRemotes: false });
                dynamic = false;
                versions.tomorrow = versions['day-after'] = 'v1';
                result = undefined;
                history.length = 0;
                adapter = createSSRUpdateAdapter(options);
              });
              await html('/tomorrow');
              await memo();
              return Response.json({
                rebuilt: true,
                pid: process.pid,
                memory: await sample(),
              });
            } finally {
              busy = false;
            }
          }
          if (url.pathname === '/__weather/update') {
            const body = await request.json();
            return Response.json(await update(body.day));
          }
          if (url.pathname === '/__weather/sample')
            return Response.json(await sample());
          if (url.pathname === '/__weather/snapshot') {
            if (busy) throw Error('请等待更新完成');
            await idle();
            return Response.json({
              file: require('node:v8').writeHeapSnapshot(
                path.join(root, 'weather-' + Date.now() + '.heapsnapshot'),
              ),
            });
          }
          return new Response('Unknown action', { status: 404 });
        } catch (e) {
          console.dir(e, { depth: 10 });
          return Response.json({ error: String(e) }, { status: 500 });
        }
      },
    },
  });
  server.listen(Number(process.env.WEATHER_PORT || 3059), '127.0.0.1');
  await once(server, 'listening');
  origin = 'http://127.0.0.1:' + server.address().port;
  await html('/tomorrow');
  await memo();
  process.send?.({ ready: true, url: origin, pid: process.pid });
  console.log('WEATHER_READY ' + origin);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
async function stop() {
  server?.closeAllConnections();
  if (server) await new Promise((r) => server.close(r));
  await adapter.dispose();
  process.exit();
}
process.once('SIGTERM', stop);
process.once('SIGINT', stop);
process.once('disconnect', stop);
