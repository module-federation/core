const path = require('node:path');

async function main() {
  const {
    createApp,
    createServer,
    LocalAdapter,
    createLogger,
  } = require('@module-federation/treeshake-server');
  const {
    createTreeshakeFrontendAdapter,
  } = require('@module-federation/treeshake-frontend/adapter');

  const port = Number(process.env.PORT ?? 4000);
  const hostname = process.env.HOST ?? '127.0.0.1';
  const logger = createLogger({ level: process.env.LOG_LEVEL ?? 'info' });

  const adapter = new LocalAdapter();
  const adapterConfig = adapter.fromEnv ? adapter.fromEnv(process.env) : {};
  const deps = await adapter.create(adapterConfig, { logger });

  const frontendAdapter = createTreeshakeFrontendAdapter({
    basePath: '/tree-shaking',
    distDir: path.resolve(__dirname, '..', 'dist'),
  });

  const app = createApp(
    { objectStore: deps.objectStore, projectPublisher: deps.projectPublisher },
    { logger, frontendAdapters: [frontendAdapter] },
  );
  const server = createServer({ app, port, hostname });

  const shutdown = async () => {
    if (deps.shutdown) {
      await deps.shutdown();
    }
    server.close?.();
  };

  process.on('SIGINT', () => {
    shutdown().finally(() => process.exit(0));
  });
  process.on('SIGTERM', () => {
    shutdown().finally(() => process.exit(0));
  });

  console.log(`Treeshake server (e2e) listening on http://${hostname}:${port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
