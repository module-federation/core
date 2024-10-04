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
