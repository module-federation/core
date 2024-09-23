<p align="center">
  <img src="https://github.com/module-federation/nextjs-mf/blob/main/packages/node/assets/banner.png" width="800"/>
</p>
<div align="center">
	<!--  for version -->
  <img src="https://img.shields.io/npm/v/@module-federation/node" alt="version" >
	<img src="https://img.shields.io/npm/l/@module-federation/node.svg?" alt="license" >
  <!-- for downloads -->
  <img src="https://img.shields.io/npm/dt/@module-federation/node" alt="downloads">
 </div>

<p align="center">
<strong>A package to bring the concept and power of module federation to NodeJS.</strong>
</p>

## ⚡ Features

- Exposes two Webpack Plugins to enable Module Federation.
- Can exported as UniversalFederationPlugin or NodeFederationPlugin with StreamingTargetPlugin
- Allows server to fetch chunks across the network.
- Allow distributed deployments of federated applications.

## 📦 Installation

To install the plugin run one of the following commands in your terminal for your application.

```bash
# npm
npm install @module-federation/node

# yarn
yarn add @module-federation/node
```

## 🚀 Usage

There are two approaches to using the plugins exported from this package, dependent on your use case.

### Use as Runtime Plugin

`module-federation/enhanced` supports runtime plugins.

```js
const { ModuleFederationPlugin } = require('@module-federation/enhanced');

const options = {
  target: 'async-node',
  output: {
    chunkFilename: '[id]-[chunkhash].js', // important to hash chunks
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      exposes: {},
      remotes: {
        app2: 'app2@http://',
      },
      runtimePlugins: [require.resolve('@module-federation/node/runtimePlugin')],
      remoteType: 'script',
      library: { type: 'commonjs-module', name: 'app1' },
    }),
  ],
};
```

or you can enable it with some presets via UniversalFederation

```js
new UniversalFederationPlugin({
  name: 'website2',
  library: { type: 'commonjs-module' },
  isServer: true, // or false
  remotes: {},
  filename: 'remoteEntry.js',
  useRuntimePlugin: true, // uses the module-federation/enhanced runtime plugin api
  exposes: {
    './SharedComponent': './remoteServer/SharedComponent',
  },
});
```

### UniversalFederationPlugin

This plugin is an abstraction over both `NodeFederationPlugin` and `ModuleFederationPlugin`. It will alternate between which it uses based on where the build is intended to be used.

If the build is intended to be used on the `browser`, it will use the standard `ModuleFederationPlugin` and bundle your code accordingly, however, if it is intended for `server` usage, it will use `NodeFederationPlugin` to create the bundle.

This simplifies the code required in your `webpack.config.js` to enable SSR Module Federation. It determines which platform it needs to build for based on two things:

1. If the options passed to the plugin has specified `isServer: true`
2. If the name assigned to the config being used is `server`

It accepts the other standard options from `ModuleFederationPlugin` as well. You can see an example usage below:

```js
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
      useRuntimePlugin: true, // uses the module-federation/enhanced runtime plugins
      exposes: {
        './SharedComponent': './remoteServer/SharedComponent',
      },
    }),
  ],
};
```

### NodeFederationPlugin and StreamingTargetPlugin

You can also use each of the underlying plugins individually if you need more control over when they are used.

At build time, you need to be aware if you're building for the `server` or for the `browser`.
If it's building for server, we need to set `target: false` to allow the plugins to function correctly.

The `NodeFederationPlugin` follows the same API as the [Module Federation Plugin](https://webpack.js.org/plugins/module-federation-plugin) and therefore should be a drop-in replacement if you already have it set up in your `webpack.config.js`.

### 🔧 Config Example

An example configuration is presented below:

```js
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

## Utilities

This package also exposes a few utilities to help with the setup of your federated application.

### revalidate

Used to "hot reload" the federated application.

- This is useful when you're developing your federated application and want to see changes without having to restart the server.
- Also useful for production environments where you want to be able to update the federated application without having to restart the server.

```js
import { revalidate } from '@module-federation/node/utils';

// we automatically reset require cache, so the reload callback is only if you need to do something else
revalidate().then((shouldReload) => {
  // do something extra after revalidation
  if (shouldReload) {
    // reload the server
  }
});
```

_Note_: To ensure that changes made to files in remotes are picked up `revalidate`, you can set the remotes webpack [output.filename](https://webpack.js.org/configuration/output/#outputfilename) to `[name]-[contenthash].js` (or similar). This will cause the remoteEntry.js file to be regenerated with a unique hash every time a new build occurs. The revalidate method intelligently detects changes by comparing the hashes of the remoteEntry.js files. By incorporating [contenthash] into the remote's webpack configuration, you enable the shell to seamlessly incorporate the updated files from the remotes.

**Hot reloading Express.js**

Express has its own route stack, so reloading require cache will not be enough to reload the routes inside express.

```js
//express.js
const app = express();

global.clearRoutes = () => {
  app._router.stack = app._router.stack.filter((k) => !(k && k.route && k.route.path));
};

// in some other file (within the scope of webpack build)
// wherever you have your revalidation logic
revalidate().then((shouldReload) => {
  if (shouldReload) {
    global.clearRoutes();
  }
});
```

### Overriding default http chunk fetch

```js
const chunkFetcher = globalThis.webpackChunkLoad || globalThis.fetch || fetchPolyfill;
// then it will pass one argument to the function, the url to fetch

chunkFetcher(url)
  .then((res) => res.text())
  .then((text) => {
    // do something with the text
  });
```

If you want to use your own custom fetch, or add fetch headers, either in the entrypoint of webpack or outside of webpack scope, like in express server you can override the default chunk fetcher by setting the `globalThis.webpackChunkLoad` variable.

```js
globalThis.webpackChunkLoad = async (url) => {
  const res = await fetch(url, {
    headers: {
      'x-custom-header': 'custom-header-value',
    },
  });
  return res.text();
};
```

## 🔑 License

- MIT @[ScriptedAlchemy](https://github.com/ScriptedAlchemy)

## 👨‍💻 Contributors

List of our amazing contributors 💥

<a href="https://github.com/module-federation/nextjs-mf/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=module-federation/node" />
</a>
