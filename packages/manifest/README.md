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

The plugin collects metadata after modules are built and before module concatenation,
then writes it during manifest generation. It follows the expose's default export
through local bindings and static re-exports using the compilation's resolved module
graph, including aliases, module-specific resolution and module replacements. It
never executes producer code. It recognizes calls named
`createBridgeComponent`, including named-import aliases and namespace members,
regardless of the factory's package or a framework's bundled implementation.
No framework import registration is required. A local factory with this name is
also treated as a Bridge factory. Merely importing or calling the factory elsewhere
in the file, or exporting only a named provider, does not mark the default export.
Framework wrappers are recognized when the expose calls or imports them under the
`createBridgeComponent` name. Arbitrary wrapper function bodies are not inspected,
so a differently named wrapper is not inferred as Bridge.
Remote, external and ignored modules are opaque and keep their existing metadata.
The analyzer does not resolve their requests against the local filesystem.

Provider options must be static objects without spreads or computed keys.
Service App declarations and ambiguous wrappers are diagnosed at build time.
Webpack reuses its parser AST and caches compact export descriptions with each
module. Rspack analyzes the already transformed source of reachable built modules
once per compilation. Loader output and resource queries therefore use the actual
built exports, rather than the original file contents. An unmarked legacy provider
requires an explicit
`render: 'bridge'` hint in the unified consumer.
