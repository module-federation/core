# Treeshake Server

An adapter-driven build service for shared treeshaking. The CLI runs in **local filesystem mode only** and embeds the treeshake UI automatically. When importing the package, you can register your own adapters, middlewares, and optional frontend UI.

## CLI (embedded UI, local-only)

```bash
pnpm --filter @module-federation/treeshake-server dev
# or
pnpm --filter @module-federation/treeshake-server start
```

Defaults:

- API: `http://localhost:3000/tree-shaking-shared`
- UI: `http://localhost:3000/tree-shaking`
- Storage: local filesystem (`LOCAL_STORE_DIR`, default `./log/static`)

The CLI **ignores** `ADAPTER_ID` and always uses the local filesystem adapter.

### Frontend env overrides (CLI)

The CLI always embeds the UI. You can only override where it is served from:

- `TREESHAKE_FRONTEND_DIST=/path/to/dist`
- `TREESHAKE_FRONTEND_BASE_PATH=/tree-shaking`
- `TREESHAKE_FRONTEND_SPA_FALLBACK=0`

## Library usage (custom adapters + middlewares)

```ts
import { createAdapterRegistry, createAdapterDeps, createApp, createServer, LocalAdapter } from '@module-federation/treeshake-server';
import { createTreeshakeFrontendAdapter } from '@module-federation/treeshake-frontend/adapter';

const registry = createAdapterRegistry([
  new LocalAdapter(),
  // new MyCustomAdapter(),
]);

const deps = await createAdapterDeps({
  registry,
  adapterId: 'local', // or your custom adapter id
});

const app = createApp(deps, {
  appExtensions: [
    (appInstance) => {
      appInstance.use('*', async (c, next) => {
        c.res.headers.set('x-treeshake', 'true');
        await next();
      });
    },
  ],
  frontendAdapters: [
    createTreeshakeFrontendAdapter({
      basePath: '/tree-shaking',
      distDir: '/path/to/treeshake-frontend/dist',
    }),
  ],
});

createServer({ app, port: 3000, hostname: '0.0.0.0' });
```

In library mode you control the adapter registry, middleware, and frontend embedding.
