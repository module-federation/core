Here's an updated README.md that incorporates the plugin options and ensures they are met:


# @module-federation/esbuild

This package provides an esbuild plugin for Module Federation, enabling you to easily share code between independently built and deployed applications.

## Installation

Install the package using npm:

```bash
npm install @module-federation/esbuild
```

## Usage

To use the Module Federation plugin with esbuild, add it to your esbuild configuration:

```js
const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');
const { moduleFederationPlugin } = require('@module-federation/esbuild/esbuild-adapter');
const { federationBuilder } = require('@module-federation/esbuild/build');

async function build() {
  const tsConfig = 'tsconfig.json';
  const outputPath = path.join('dist', 'host');

  await federationBuilder.init({
    options: {
      workspaceRoot: path.join(__dirname, '..'),
      outputPath,
      tsConfig,
      federationConfig: path.join('host', 'federation.config.js'),
      verbose: false,
      watch: false,
    },
  });

  await esbuild.build({
    entryPoints: [path.join('host', 'main.ts')],
    external: federationBuilder.externals,
    outdir: outputPath,
    bundle: true,
    platform: 'browser',
    format: 'esm',
    mainFields: ['es2020', 'browser', 'module', 'main'],
    conditions: ['es2020', 'es2015', 'module'],
    resolveExtensions: ['.ts', '.tsx', '.mjs', '.js'],
    tsconfig: tsConfig,
    splitting: true,
    plugins: [moduleFederationPlugin(federationBuilder)],
  });
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
}

// Example of federation.config.js

const { withFederation, shareAll } = require('@module-federation/esbuild/build');

module.exports = withFederation({
  name: 'host',
  filename: 'remoteEntry.js',
  exposes: {
    './Component': './src/Component',
  },
  shared: {
    ...shareAll({
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
      includeSecondaries: false,
    }),
  },
});

```

The `moduleFederationPlugin` accepts a configuration object with the following properties:

- `name` (string): The name of the host application.
- `filename` (string, optional): The name of the remote entry file. Defaults to `'remoteEntry.js'`.
- `remotes` (object, optional): An object specifying the remote applications and their entry points.
- `exposes` (object, optional): An object specifying the modules to be exposed by the host application.
- `shared` (array, optional): An array of package names to be shared between the host and remote applications.

## Plugin Features

The `moduleFederationPlugin` includes the following features:

- **Virtual Share Module**: Creates a virtual module for sharing dependencies between the host and remote applications.
- **Virtual Remote Module**: Creates a virtual module for importing exposed modules from remote applications.
- **CommonJS to ESM Transformation**: Transforms CommonJS modules to ESM format for compatibility with Module Federation.
- **Shared Dependencies Linking**: Links shared dependencies between the host and remote applications.
- **Manifest Generation**: Generates a manifest file containing information about the exposed modules and their exports.

## API

### `moduleFederationPlugin(config)`

Creates an esbuild plugin for Module Federation.

- `config` (object): The Module Federation configuration.
  - `name` (string): The name of the host application.
  - `filename` (string, optional): The name of the remote entry file. Defaults to `'remoteEntry.js'`.
  - `remotes` (object, optional): An object specifying the remote applications and their entry points.
  - `exposes` (object, optional): An object specifying the modules to be exposed by the host application.
  - `shared` (array, optional): An array of package names to be shared between the host and remote applications.

Returns an esbuild plugin instance.

