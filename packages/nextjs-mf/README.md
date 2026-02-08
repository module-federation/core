# nextjs-mf v9 (Next.js 16+)

`@module-federation/nextjs-mf` v9 is a clean rewrite for Next.js 16+.

## Support matrix

- Next.js `>=16.0.0`
- Webpack mode only (`next dev --webpack`, `next build --webpack`)
- Pages Router: stable
- App Router: beta (`Client Components` + `RSC`)
- Node runtime federation only

## Not supported

- Turbopack / Rspack builds
- Edge runtime federation
- App Router route handlers federation (`app/**/route.*`)
- Middleware federation
- Server action federation (`'use server'` modules)

## Installation

```bash
pnpm add @module-federation/nextjs-mf webpack
```

## Usage

```js
const { withNextFederation } = require('@module-federation/nextjs-mf');

/** @type {import('next').NextConfig} */
const baseConfig = {
  webpack(config) {
    return config;
  },
};

module.exports = withNextFederation(baseConfig, {
  name: 'host',
  mode: 'hybrid',
  filename: 'static/chunks/remoteEntry.js',
  remotes: ({ isServer }) => ({
    remote: `remote@http://localhost:3001/_next/static/${
      isServer ? 'ssr' : 'chunks'
    }/remoteEntry.js`,
  }),
  exposes: {
    './Header': './components/Header',
  },
  pages: {
    exposePages: true,
    pageMapFormat: 'routes-v2',
  },
  app: {
    enableClientComponents: true,
    enableRsc: true,
  },
  sharing: {
    includeNextInternals: true,
    strategy: 'loaded-first',
  },
});
```

## Required scripts

```json
{
  "scripts": {
    "dev": "NEXT_PRIVATE_LOCAL_WEBPACK=true next dev --webpack",
    "build": "NEXT_PRIVATE_LOCAL_WEBPACK=true next build --webpack"
  }
}
```

## Migration from v8

- `NextFederationPlugin` constructor usage is replaced by `withNextFederation` wrapper.
- `extraOptions` is removed.
- `@module-federation/nextjs-mf/utils` is removed.
- Migrate utility calls to `@module-federation/node/utils`.

See `MIGRATION-v9.md` for mapping details.
