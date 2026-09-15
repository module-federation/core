process.env.NODE_ENV = 'production';
const path = require('node:path');
const fs = require('node:fs/promises');
const { once } = require('node:events');
const r = require('node:module').createRequire(
  path.join(process.env.SSR_CACHE_PACKAGES_ROOT, 'package.json'),
);
let server;
(async () => {
  const dist = path.join(process.env.LAB_ROOT, 'console/dist');
  server = await r('@modern-js/prod-server').createProdServer({
    pwd: dist,
    serverConfigPath: path.join(dist, 'missing-config'),
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
    routes: JSON.parse(await fs.readFile(path.join(dist, 'route.json'))).routes,
    ssrApplication: {
      onReady() {},
      maxPendingRequests: 16,
      requestTimeoutMs: 3000,
      drainTimeoutMs: 15000,
      async bypass(request) {
        const url = new URL(request.url);
        if (url.pathname.startsWith('/api/'))
          return fetch(process.env.LAB_API + url.pathname + url.search, {
            method: request.method,
            signal: request.signal,
          });
      },
    },
  });
  server.listen(Number(process.env.SSR_CACHE_DEMO_PORT || 3059), '127.0.0.1');
  await once(server, 'listening');
  process.send?.({ url: 'http://127.0.0.1:' + server.address().port });
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
function stop() {
  server?.closeAllConnections();
  server?.close();
  process.exit();
}
process.once('SIGTERM', stop);
process.once('disconnect', stop);
