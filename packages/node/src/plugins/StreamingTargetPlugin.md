# StreamingTargetPlugin

## Introduction
The `StreamingTargetPlugin` is designed to provide a new transport layer for Webpack, allowing for the streaming of chunks in Node.js environments where the chunks may not be available on disk. It serves as an alternative to Webpack's `CommonJsChunkLoadingPlugin` but without a coupled filesystem.

## Installation
To be installed via npm or yarn. (Installation command to be provided by package maintainer.)
`npm install @module-federation/node`

## Prerequisites
- The plugin is generally used in conjunction with `NodeFederationPlugin` or `UniversalFederationPlugin`.
  
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
For future plans and improvements, refer to the [Roadmap/RFC](https://github.com/module-federation/universe/discussions/1170).

## Contributing
Contribution guidelines to be provided by package maintainer.

## License
License information to be provided by package maintainer.

---

URLs:
- Roadmap/RFC: https://github.com/module-federation/universe/discussions/1170