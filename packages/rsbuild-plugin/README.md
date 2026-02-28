# @module-federation/rsbuild-plugin

## Example

```
npm install @module-federation/rsbuild-plugin -D
```

### Rsbuild App

```js
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  server: {
    port: 2000,
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'federation_consumer',
      remotes: {
        remote1: 'remote1@http://localhost:2001/mf-manifest.json',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
});
```

### Rsbuild App SSR (Node target with custom environment)

Use `target: 'node'` with an explicit `environment` to apply federation to a
specific Rsbuild app environment (for example `ssr`).

```ts
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';

export default defineConfig({
  environments: {
    client: {},
    ssr: {},
  },
  plugins: [
    pluginModuleFederation(
      {
        name: 'host',
        remotes: {
          remote: 'remote@http://localhost:3001/mf-manifest.json',
        },
      },
      {
        target: 'node',
        environment: 'ssr',
      },
    ),
  ],
});
```

`target: 'dual'` support remains scoped to Rslib/Rspress workflows.

### Default environment detection

If `environment` is omitted, the plugin will choose a default per tool:

- **Rslib**: `mf`
- **Rsbuild app**:
  - `target: 'web'` → `web`
  - `target: 'node'` → `node`
- **Rspress**:
  - `target: 'web'` → `web`
  - `target: 'node'` → `node`

You can still override with `environment` when your project uses custom names.

### Rslib Module

```js
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    // ...
    {
      format: 'mf',
      output: {
        distPath: {
          root: './dist/mf',
        },
        assetPrefix: 'http://localhost:3001/mf',
      },
      plugins: [
        // ...
        pluginModuleFederation({
          name: 'rslib_provider',
          exposes: {
            '.': './src/index.tsx',
          },
          shared: {
            react: {
              singleton: true,
            },
            'react-dom': {
              singleton: true,
            },
          },
        }),
      ],
    },
  ],
});
```

## Documentation

See [https://module-federation.io/guide/build-plugins/plugins-rsbuild.html](https://module-federation.io/guide/build-plugins/plugins-rsbuild.html) fordetails.
