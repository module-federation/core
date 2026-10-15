# @module-federation/rspress-plugin

Module Federation plugin for [Rspress](https://rspress.dev/). Wraps the Rsbuild Module Federation plugin and can rebuild search / LLM indexes from HTML after the build.

## Install

```bash
pnpm add @module-federation/rspress-plugin
```

## Build

```bash
pnpm --filter @module-federation/rspress-plugin run build
```

## Usage

```ts
import { pluginModuleFederation } from '@module-federation/rspress-plugin';

export default {
  plugins: [
    pluginModuleFederation({
      name: 'doc-app',
      // ...Module Federation options
    }),
  ],
};
```

Optional second argument controls Rspress-specific behavior (`autoShared`, `rebuildSearchIndex`, `rebuildLlms`).
