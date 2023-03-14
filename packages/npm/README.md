# Federate NPM

This plugin enables to federate any packages from NPM Registry into share scope of Host and Remote apps.

## Installation

```
$ npm i @module-federation/npm
```

## Usage

Register the plugin in `webpack configuration (webpack.config.js)` file

```typescript
import webpack from 'webpack';
const federateNpmLibsForRemote = require('@module-federation/npm');

module.exports = {
  /* ... */
  plugins: [
    // ...
    new ModuleFederationPlugin({
      name: 'my-app',
      filename: 'remoteEntry.js',
      exposes: {
        //...exposed components
        './Button': './src/Button',
        './Input': './src/Input',
      },
      remotes: {
        app2: federateNpmLibsForRemote(
          'app2@http://localhost:3002/remoteEntry.js'
        ),
      },
      shared: ['react', 'react-dom'],
    }),
  ],
};
```

Any package thats added to `ModuleFederationPlugin#shared` will be federated from NPM instead of loading it from webpack bundles.

> NOTE: This doesn't eliminate the packages from bundling into your output. In the event that this plugin fails to load the package from NPM, it fallbacks to the bundled version.

## Caveats

This Plugin is only designed to work with NPM for now. If you happen to have packages from Private Registry, plugin will fail to load the packages.
