# StreamingTargetPlugin

## Overview

The `StreamingTargetPlugin` is designed to introduce a new transport layer for Webpack. It enables the streaming of chunks in Node.js environments, even when the chunks are not readily available on disk. This plugin is an excellent alternative to Webpack's `CommonJsChunkLoadingPlugin`, offering similar functionality without the need for a coupled filesystem.

## Installation

You can install the `StreamingTargetPlugin` via npm or yarn using the following command:
`npm install @module-federation/node`

## Prerequisites

The `StreamingTargetPlugin` is typically used in combination with either the `NodeFederationPlugin` or the `UniversalFederationPlugin`.

## Usage

### With NodeFederationPlugin

```javascript
const { NodeFederationPlugin, StreamingTargetPlugin } = require('@module-federation/node');
const config = {
  target: isServer ? false : 'web',
  plugins: [
    new NodeFederationPlugin({
      name: 'website2',
      library: { type: 'commonjs-module' },
      remotes: {},
      filename: 'remoteEntry.js',
      exposes: {
        './SharedComponent': './remoteServer/SharedComponent',
      },
    }),
    new StreamingTargetPlugin({
      name: 'website2',
      library: { type: 'commonjs-module' },
      remotes: {},
    }),
  ],
};
```

### With UniversalFederationPlugin

```javascript
const { UniversalFederationPlugin } = require('@module-federation/node');
const config = {
  target: isServer ? false : 'web',
  plugins: [
    new UniversalFederationPlugin({
      name: 'website2',
      library: { type: 'commonjs-module' },
      isServer: true, // or false
      remotes: {},
      filename: 'remoteEntry.js',
      exposes: {
        './SharedComponent': './remoteServer/SharedComponent',
      },
    }),
  ],
};
```

## Options

- `name`: The name of the federated module.
- `library`: The type of module, usually `commonjs-module`.
- `remotes`: An object specifying the remote federated modules.
- `promiseBaseURI`: The base URI for the promise. Optional.
- `debug`: Flag to enable/disable debug mode. Optional.

## Roadmap

For future plans and improvements, refer to the [Roadmap/RFC](https://github.com/module-federation/core/discussions/1170).

## Contributing

Contribution guidelines to be provided by package maintainer.

## License

License information to be provided by package maintainer.

---

URLs:

- Roadmap/RFC: https://github.com/module-federation/core/discussions/1170
