# `@module-federation/manifest` Documentation

## Description

This package contains the manifest plugin for webpack/rspack internal.

## Installation

```sh
npm install @module-federation/manifest
```

## Usage

1. replace expose options with container.options.exposes = containerManager.containerPluginExposesOptions;

```js
import { ContainerManager } from '@module-federation/managers';
const containerManager = new ContainerManager();
containerManager.init(options);
// it will set expose name automatically
options.exposes = containerManager.containerPluginExposesOptions;
```

2. use StatsPlugin in webpack.config.js

```js
import { StatsPlugin } from '@module-federation/manifest';

new StatsPlugin(mfOptions, {
  pluginVersion: pkg.version,
  bundler: 'webpack',
}).apply(compiler);
```

For Webpack, manifest generation uses the module graph when the compiler
provides the required federation metadata, falling back to the existing stats
reader otherwise. Set
`manifest: { useLegacyStats: true }` in the federation options to use the legacy
JavaScript stats reader as a rollback. The option defaults to `false` and does
not affect stats emitted natively by Rspack.

TODO: Remove the rollback option and legacy Webpack reader once supported
Webpack versions have verified graph parity and reported migration regressions
are resolved.
