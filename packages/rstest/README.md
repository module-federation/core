# @module-federation/rstest

Module Federation integration for Rstest Node, JSDOM, and browser test
environments.

## Installation

```bash
npm install --save-dev @module-federation/rstest @rstest/core
```

Use `@rstest/core@0.11.4` or newer. That release includes Rstest's federation
support
([web-infra-dev/rstest#1407](https://github.com/web-infra-dev/rstest/pull/1407)).

## Usage

### Node and JSDOM

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

For Node test environments, the plugin enables Rstest's federation
compatibility mode automatically. Do not also set `federation: true` in
`rstest.config.*`.

If the test project already uses `@module-federation/rsbuild-plugin`, reuse
that configuration instead of declaring the options twice:

```ts
import { createModuleFederationConfig, pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { federation } from '@module-federation/rstest';
import { defineConfig } from '@rstest/core';

const options = createModuleFederationConfig({
  name: 'main_app_web',
  remotes: {
    'component-app': 'component_app@http://localhost:3001/remoteEntry.js',
  },
});

export default defineConfig({
  plugins: [
    pluginModuleFederation(options, {
      environment: 'rstest',
      target: 'node',
    }),
    federation(),
  ],
});
```

Register the Rsbuild plugin first. `federation()` then applies the Rstest
defaults to the same typed options and creates a single compiler plugin.

For both Node and browser targets, `dts`, `manifest`, and `dev` default to
`false`; explicit values are preserved.

The plugin applies these Node defaults:

- `target: async-node`
- `experiments.asyncStartup = true`
- CommonJS library output (`library.type = 'commonjs-module'`); `module` and
  `modern-module` library types are normalized
- Node runtime plugin (`@module-federation/node/runtimePlugin`)
- `experiments.optimization.target = 'node'`
- Script remote transport (`remoteType = 'script'`); inline prefixes such as
  `commonjs ...` still override the default

### Browser Mode

Install `@rstest/browser` and a Playwright browser before enabling Browser
Mode. See [Rstest's Browser Mode setup](https://rstest.rs/guide/browser-testing/getting-started).

```ts
import { federation } from '@module-federation/rstest';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  browser: {
    enabled: true,
    provider: 'playwright',
  },
  plugins: [
    federation({
      name: 'browser_host',
      remotes: {
        app2: 'app2@http://localhost:3001/remoteEntry.js',
      },
    }),
  ],
});
```

Browser Mode is detected from Rstest's resolved `browser.enabled`
configuration. In browser target mode, node-only defaults are not applied.
`experiments.asyncStartup` remains enabled.

The plugin name is `rstest:federation`, exported as
`FEDERATION_PLUGIN_NAME`.

## Real-world Example

Rstest's
[federation example](https://github.com/web-infra-dev/rstest/tree/v0.11.4/examples/federation)
tests an HTTP component remote and a locally built CommonJS remote from Node
and JSDOM projects. It covers both static and dynamic remote imports.

## Documentation

See the
[Rstest integration guide](https://module-federation.io/integrations/build-tool/rstest)
for configuration details.
