<p align="center">
  <img src="https://github.com/module-federation/nextjs-mf/blob/main/packages/node/assets/banner.png" width="800"/>
</p>
<div align="center">
	<!--  for version -->
  <img src="https://img.shields.io/npm/v/@module-federation/node" alt="version" >
	<img src="https://img.shields.io/apm/l/atomic-design-ui.svg?" alt="license" >
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

### UniversalFederationPlugin

This plugin is an abstraction over both `NodeFederationPlugin` and `ModuleFederationPlugin`. It will alternate between which it uses based on where the build is intended to be used.

If the build is intended to be used on the `browser`, it will use the standard `ModuleFederationPlugin` and bundle your code accordingly, however, if it is intended for `server` usage, it will use `NodeFederationPlugin` to create the bundle.

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

### NodeFederationPlugin and StreamingTargetPlugin

You can also use each of the underlying plugins individually if you need more control over when they are used.

At build time, you need to be aware if you're building for the `server` or for the `browser`.
If it's building for server, we need to set `target: false` to allow the plugins to function correctly.

The `NodeFederationPlugin` follows the same API as the [Module Federation Plugin](https://webpack.js.org/plugins/module-federation-plugin) and therefore should be a drop-in replacement if you already have it set up in your `webpack.config.js`.

### 🔧 Config Example
An example configuration is presented below:
```js

const {NodeFederationPlugin, StreamingTargetPlugin} = require("@module-federation/node");

const config = {
  target: isServer ? false : "web",
  plugins: [
    new NodeFederationPlugin({
      name: 'website2',
      library: {type: 'commonjs-module'},
      remotes: {},
      filename: 'remoteEntry.js',
      exposes: {
        './SharedComponent': './remoteServer/SharedComponent',
      },
    }),
    new StreamingTargetPlugin({
      name: 'website2',
      library: {type: 'commonjs-module'},
      remotes: {},
    }),
  ]
}
```
## 🔑 License
- MIT @[ScriptedAlchemy](https://github.com/ScriptedAlchemy)

## 👨‍💻 Contributors
List of our amazing contributors 💥

<a href="https://github.com/module-federation/nextjs-mf/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=module-federation/node" />
</a>
