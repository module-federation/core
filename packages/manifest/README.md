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

## Bridge rendering metadata

Statically identifiable default exports created with `createBridgeComponent` publish
`render: 'bridge'` and `isService: false` on the corresponding expose. Other exposes
keep their existing shape. The fields are also preserved in MF runtime Snapshots.

The analyzer follows the expose's default export through local variables and static
re-exports without executing producer code. It recognizes calls named
`createBridgeComponent`, including named-import aliases and namespace members,
regardless of the factory's package or a framework's bundled implementation.
No framework import registration is required. A local factory with this name is
also treated as a Bridge factory. Merely importing or calling the factory elsewhere
in the file, or exporting only a named provider, does not mark the default export.
Framework wrappers are recognized when the expose calls or imports them under the
`createBridgeComponent` name. Arbitrary wrapper function bodies are not inspected,
so a differently named wrapper is not inferred as Bridge.
Re-exports from configured federated remotes stop source analysis at the remote
boundary and keep their existing metadata, since their source is not local.

Provider options must be static objects without spreads or computed keys.
Service App declarations and ambiguous wrappers are diagnosed at build time.
Loader-generated exposes keep their existing metadata and are not inferred from
the untransformed source. An unmarked legacy provider requires an explicit
`render: 'bridge'` hint in the unified consumer.
