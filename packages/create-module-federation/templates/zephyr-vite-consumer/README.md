# Zephyr with Vite Consumer Example

This example demonstrates how to use Zephyr with Vite to consume federated modules.

## Features

- Module Federation with Zephyr integration
- React component consumption from remote provider
- Vite configuration with native Module Federation support via vite-plugin-zephyr

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## How It Works

The example uses the `withZephyr` function from `vite-plugin-zephyr` to enable Module Federation in Vite:

```js
import { withZephyr } from 'vite-plugin-zephyr';

const mfConfig = {
  name: 'consumer',
  remotes: {
    provider: {
      name: 'provider',
      entry: 'http://localhost:3004/remoteEntry.js',
    },
  },
  // Module Federation configuration
};

export default defineConfig({
  plugins: [react(), withZephyr({ mfConfig })],
  // ...vite config
});
```

This integration provides improved module federation capabilities with the fast build times of Vite and the power of Zephyr platform services.
