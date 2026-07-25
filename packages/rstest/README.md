# @module-federation/rstest

This package contains the `federation()` Rsbuild plugin used by Rstest to enable
Module Federation compatibility mode for Node test environments
(JSDOM / Node workers) and browser mode.

It is the companion plugin for [Rstest](https://rstest.rs)'s federation mode,
owned and versioned alongside the rest of the Module Federation tooling.

## Required @rstest/core version

Use `@rstest/core@0.11.4` or newer. That release includes Rstest's federation
support
([web-infra-dev/rstest#1407](https://github.com/web-infra-dev/rstest/pull/1407)).

For Node test environments, this plugin automatically enables Rstest's
federation compatibility mode. Do not set `federation: true` in
`rstest.config.*`; the plugin applies it through Rstest's exposed configuration
API when the test build targets Node.

## Stable plugin name

The plugin registers itself with the Rsbuild plugin name `rstest:federation`
(exported as `FEDERATION_PLUGIN_NAME`). This name is a stable, public contract:
rstest may detect the plugin by this name to enable federation-specific
behavior. It will not be renamed without a major version bump.

## Usage

### Node/JSDOM test environments (default)

```ts
import { federation } from '@module-federation/rstest';
import { defineConfig } from '@rstest/core';

export default defineConfig({
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

By default, `federation()` applies Node-safe Module Federation settings and
enables Rstest federation mode automatically:

- `target: async-node`
- `experiments.asyncStartup = true`
- CommonJS library output (`library.type = 'commonjs-module'`)
- Node runtime plugin (`@module-federation/node/runtimePlugin`)
- `experiments.optimization.target = 'node'`
- Remote transport is inferred from each remote declaration, so standard URL
  remotes and `commonjs ...` path remotes work without setting `remoteType`

Keep `federation: true` out of `rstest.config.*`. Setting it manually is only
needed when using Module Federation without this plugin.

### Browser mode

```ts
import { federation } from '@module-federation/rstest';
import { defineConfig } from '@rstest/core';

export default defineConfig({
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
`experiments.asyncStartup` remains enabled.
