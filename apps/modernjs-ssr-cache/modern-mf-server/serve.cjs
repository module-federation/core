// Temporary integrated serve command. Uses the real Modern production server.
process.env.NODE_ENV = 'production';
const fs = require('node:fs/promises');
const path = require('node:path');
const { once } = require('node:events');
const { createRequire } = require('node:module');
const integration = require('./index.cjs');
const configFile = path.resolve(process.argv[2] || 'weather.config.cjs');
const root = path.dirname(configFile);
const consumerRequire = createRequire(configFile);
const { createProdServer } = consumerRequire('@modern-js/prod-server');
let server,
  federation,
  stopping = false;
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  server?.closeAllConnections();
  if (server) await new Promise((resolve) => server.close(resolve));
  await federation?.close();
  process.exit(code);
}
(async () => {
  const config = await consumerRequire(configFile)(integration);
  federation = config.federation;
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
    ssrApplication: federation.configureApplication(config.application),
  });
  server.listen(
    Number(process.env.WEATHER_PORT || 3059),
    process.env.WEATHER_HOST || '127.0.0.1',
  );
  await once(server, 'listening');
  const url = 'http://127.0.0.1:' + server.address().port;
  await config.onReady?.(url);
  process.send?.({ ready: true, url, pid: process.pid });
  console.log('WEATHER_READY ' + url);
})().catch(async (error) => {
  console.error(error);
  await stop(1);
});
process.once('SIGTERM', () => stop());
process.once('SIGINT', () => stop());
process.once('disconnect', () => stop());
