# Module Federation Support for Node Environments

This package exposes three Webpack Plugins to bring the concept and power of Module Federation to NodeJS. This will allow your server to fetch chunks across the network allowing for distributed deployments of federated applications.

## Installation

To install the plugin run one of the following commands in your terminal for your application.

```bash
# npm
npm install @module-federation/node

# yarn
yarn add @module-federation/node
```

## Usage

There are two approaches to using the plugins exported from this package, dependent on your use case.

### UniversalFederationPlugin

This plugin is an abstraction over both `StreamingTargetPlugin` and `ModuleFederationPlugin`. It will alternate between which it uses based on where the build is intended to be used.

If the build is intended to be used on the `browser`, it will use the standard `ModuleFederationPlugin` and bundle your code accordingly, however, if it is intended for `server` usage, it will use `StreamingTargetPlugin` to create the bundle.

This simplifies the code required in your `webpack.config.js` to enable SSR Module Federation. It determines which platform it needs to build for based on two things:

1. If the options passed to the plugin has specified `isServer: true`
2. If the name assigned to the config being used is `server`

It accepts the other standard options from `ModuleFederationPlugin` as well. You can see an example usage below:

```js
const {UniversalFederationPlugin} = require("@module-federation/node");

const config = {
  target: isServer ? false : "web",
  plugins: [
    new UniversalFederationPlugin({
      name: 'website2',
      library: {type: 'commonjs-module'}, 
      isServer: true, // or false
      remotes: {},
      filename: 'remoteEntry.js',
      exposes: {
        './SharedComponent': './remoteServer/SharedComponent',
      },
    }),
  ]
}
```

### StreamingTargetPlugin and NodeFederationPlugin

You can also use each of the underlying plugins individually if you need more control over when they are used.

At build time, you need to be aware if you're building for the `server` or for the `browser`.
If it's building for server, we need to set `target: false` to allow the plugins to function correctly.

The `StreamingTargetPlugin` follows the same API as the [Module Federation Plugin](https://webpack.js.org/plugins/module-federation-plugin) and therefore should be a drop-in replacement if you already have it set up in your `webpack.config.js`.

An example configuration is presented below:
```js

const {StreamingTargetPlugin, NodeFederationPlugin} = require("@module-federation/node");

const config = {
  target: isServer ? false : "web",
  plugins: [
    new StreamingTargetPlugin({
      name: 'website2',
      library: {type: 'commonjs-module'},
      remotes: {},
      filename: 'remoteEntry.js',
      exposes: {
        './SharedComponent': './remoteServer/SharedComponent',
      },
    }),
    new NodeFederationPlugin({
      name: 'website2',
      library: {type: 'commonjs-module'},
      remotes: {},
    }),
  ]
}
```

## Utilities

This package also exposes a few utilities to help with the setup of your federated application.

### revalidate

Used to "hot reload" the federated application. 
- This is useful when you're developing your federated application and want to see changes without having to restart the server.
- Also useful for production environments where you want to be able to update the federated application without having to restart the server.

```js
import {revalidate} from "@module-federation/node";

// we automatically reset require cache, so the reload callback is only if you need to do something else
revalidate().then((shouldReload) => {
  // do something extra after revalidation
  if(shouldReload) { 
    // reload the server
  }
});
```

**Hot reloading Express.js**

Express has its own route stack, so reloading require cache will not be enough to reload the routes inside express.

```js
//express.js
const app = express();

global.clearRoutes = () => {
  app._router.stack = app._router.stack.filter(
    k => !(k && k.route && k.route.path)
  )
}

// in some other file (within the scope of webpack build)
// wherever you have your revalidation logic
revalidate().then((shouldReload) => {
  if(shouldReload) {
    global.clearRoutes();
  }
});

```
