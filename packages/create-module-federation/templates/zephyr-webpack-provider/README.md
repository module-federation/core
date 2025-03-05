# Zephyr with Webpack Provider Example

This example demonstrates how to use Zephyr with Webpack to create a federated module provider.

## Features

- Module Federation with Zephyr integration
- React component exposed for federation
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
});
```

This integration allows for improved module federation capabilities with Zephyr platform services.
