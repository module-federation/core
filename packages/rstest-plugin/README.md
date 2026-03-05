# @module-federation/rstest-plugin

This package contains the `federation()` Rsbuild plugin used by Rstest to enable
Module Federation compatibility mode for Node test environments
(JSDOM / Node workers) and browser mode.

It is extracted from `rstest/packages/core/src/core/plugins/federation.ts` to allow shared ownership and versioning
alongside other Module Federation tooling.

## Usage

### Node/JSDOM test environments (default)

```ts
import { federation } from '@module-federation/rstest-plugin';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  federation: true,
  plugins: [
    federation({
      name: 'main_app_web',
      remotes: {
        'component-app': 'component_app@http://localhost:3001/remoteEntry.js',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
});
```

By default, `federation()` applies Node-safe Module Federation settings:

- `target: async-node`
- CommonJS library output (`library.type = 'commonjs-module'`)
- `remoteType = 'script'` when remotes are present
- Node runtime plugin (`@module-federation/node/runtimePlugin`)
- `experiments.optimization.target = 'node'`

### Browser mode

```ts
import { federation } from '@module-federation/rstest-plugin';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  federation: true,
  plugins: [
    federation(
      {
        name: 'browser_host',
        remotes: {
          app2: 'app2@http://localhost:3001/remoteEntry.js',
        },
      },
      { target: 'browser' },
    ),
  ],
});
```

In browser target mode, node-only defaults are not applied.

