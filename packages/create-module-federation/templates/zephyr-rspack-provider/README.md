# Zephyr with Rspack Provider Example

This example demonstrates how to use Zephyr with Rspack to create a federated module provider.

## Features

- Module Federation with Zephyr integration
- React component exposed for federation
- Rspack bundler configuration

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## How It Works

The example uses the `withZephyr` plugin from `zephyr-rspack-plugin` to enhance the Rspack configuration:

```js
const { withZephyr } = require('zephyr-rspack-plugin');

module.exports = withZephyr()({
  // ...rspack config
});
```

This integration enables improved module federation capabilities with the performance benefits of Rspack and Zephyr platform services.