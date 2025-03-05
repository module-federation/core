# Zephyr with Rspack Consumer Example

This example demonstrates how to use Zephyr with Rspack to consume federated modules.

## Features

- Module Federation with Zephyr integration
- React component consumption from remote provider
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
  // ...rspack config with remotes
});
```

This integration enables improved module federation consumption capabilities with the performance benefits of Rspack and Zephyr platform services.