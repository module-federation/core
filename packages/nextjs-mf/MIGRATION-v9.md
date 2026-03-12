# Migration guide: nextjs-mf v8 -> v9

## Breaking changes

- `NextFederationPlugin` is removed from public API.
- `extraOptions` is removed.
- `@module-federation/nextjs-mf/utils` export is removed.
- Webpack mode is required in Next 16 (`--webpack`).

## API migration

### Before (v8)

```js
const NextFederationPlugin = require('@module-federation/nextjs-mf');

module.exports = {
  webpack(config, options) {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'home',
        filename: 'static/chunks/remoteEntry.js',
        remotes: {
          shop: `shop@http://localhost:3001/_next/static/${
            options.isServer ? 'ssr' : 'chunks'
          }/remoteEntry.js`,
        },
        extraOptions: {
          exposePages: true,
          debug: false,
        },
      }),
    );

    return config;
  },
};
```

### After (v9)

```js
const { withNextFederation } = require('@module-federation/nextjs-mf');

module.exports = withNextFederation(
  {
    webpack(config) {
      return config;
    },
  },
  {
    name: 'home',
    mode: 'pages',
    filename: 'static/chunks/remoteEntry.js',
    remotes: ({ isServer }) => ({
      shop: `shop@http://localhost:3001/_next/static/${
        isServer ? 'ssr' : 'chunks'
      }/remoteEntry.js`,
    }),
    pages: {
      exposePages: true,
      pageMapFormat: 'routes-v2',
    },
    diagnostics: {
      level: 'warn',
    },
  },
);
```

## Legacy option mapping

- `extraOptions.exposePages` -> `pages.exposePages`
- `extraOptions.skipSharingNextInternals` -> `sharing.includeNextInternals = false`
- `extraOptions.debug` -> `diagnostics.level = 'debug'`
- `extraOptions.enableImageLoaderFix` -> removed (`NMF005`)
- `extraOptions.enableUrlLoaderFix` -> removed (`NMF005`)
- `extraOptions.automaticPageStitching` -> removed (`NMF005`)

## Utilities migration

- Replace:

```js
import { revalidate, flushChunks } from '@module-federation/nextjs-mf/utils';
```

- With:

```js
import { revalidate, flushChunks } from '@module-federation/node/utils';
```

## Required scripts for Next 16+

```json
{
  "scripts": {
    "dev": "NEXT_PRIVATE_LOCAL_WEBPACK=true next dev --webpack",
    "build": "NEXT_PRIVATE_LOCAL_WEBPACK=true next build --webpack"
  }
}
```
