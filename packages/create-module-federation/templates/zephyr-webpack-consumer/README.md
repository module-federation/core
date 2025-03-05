# Zephyr with Webpack Consumer Example

This example demonstrates how to use Zephyr with Webpack to consume federated modules.

## Features

- Module Federation with Zephyr integration
- React component consumption from remote provider
- Webpack bundler configuration

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## How It Works

The example uses the `withZephyr` plugin from `zephyr-webpack-plugin` to enhance the Webpack configuration:

```js
const { withZephyr } = require('zephyr-webpack-plugin');

module.exports = withZephyr()({
  // ...webpack config
  plugins: [
    new ModuleFederationPlugin({
      name: 'consumer',
      remotes: {
        provider: 'provider@http://localhost:3000/remoteEntry.js',
      },
      // ...
    }),
  ],
});
```

This integration allows for improved module federation capabilities with Zephyr platform services.
