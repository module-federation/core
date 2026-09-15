# `@module-federation/manifest` Documentation

## Description

This package contains the manifest plugin for webpack/rspack internal.

### Deferred provider metadata proposal

The independent provider-metadata draft records multiple concrete version/import
pairs and their assets in an optional `shared[].providers` array. Existing shared
fields remain unchanged; singleton and consumer-only rows omit the array.
This proposal is deferred pending [RFC #5082](https://github.com/module-federation/core/issues/5082) and is not part of the active
layers stack.

Webpack/Rspack parity is a goal for that RFC. This main-based draft uses the
existing stats collector; graph collection, layer/scope identity integration and
native Rspack emission must be reconciled before adoption. The earlier stacked
implementation and its layer tests remain preserved in [PR #5078](https://github.com/module-federation/core/pull/5078)
at [commit 964500cbb](https://github.com/module-federation/core/commit/964500cbb7debbe644c7c64ac0780d2255526233).
The subsequent resolved-provider-identifier fix is included in this draft; its
original commit and full history are retained at local ref
`backup/provider-before-independent-draft-3afa5e71e` (`3afa5e71e`).

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
