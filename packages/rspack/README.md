# `@module-federation/rspack` Documentation

## Eager exposes

Rspack exposes can be included in the container entry chunk by setting
`eager: true`:

```js
const { ModuleFederationPlugin } = require('@module-federation/enhanced/rspack');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'remote',
      filename: 'remoteEntry.js',
      exposes: {
        './data-loader': {
          import: './src/data-loader',
          eager: true,
        },
      },
    }),
  ],
};
```

The exposed module is bundled into `remoteEntry.js`, but it is not evaluated
until its container factory is called. `container.get()` remains asynchronous.

`ExposeEagerPlugin` is also exported from `@module-federation/rspack/plugin`
for use alongside Rspack's built-in module federation plugin:

```js
const rspack = require('@rspack/core');
const { ExposeEagerPlugin } = require('@module-federation/rspack/plugin');

const federationOptions = {
  name: 'remote',
  filename: 'remoteEntry.js',
  exposes: {
    './data-loader': {
      import: './src/data-loader',
      eager: true,
    },
  },
};

module.exports = {
  plugins: [new ExposeEagerPlugin(federationOptions), new rspack.container.ModuleFederationPlugin(federationOptions)],
};
```
