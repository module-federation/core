# @module-federation/react-router-proxy-plugin

Automatically proxies React Router imports to enable seamless routing coordination between Module Federation micro-frontends without conflicts.

## Overview

This plugin is part of the Module Federation ecosystem and solves routing conflicts in React micro-frontend applications. It automatically replaces `react-router-dom` imports with bridge-compatible versions, ensuring that routing works correctly across different micro-applications.

## Key Features

- **Automatic Router Proxying**: Automatically replaces `react-router-dom` with bridge-compatible versions
- **Version Detection**: Supports both React Router v5 and v6 with automatic version detection
- **Zero Configuration**: Works out of the box with Module Federation Plugin
- **Conflict Prevention**: Prevents routing conflicts between host and remote applications
- **Safe Guards**: Ensures `react-router-dom` is not set as shared dependency

## When to Use

- Building micro-frontend applications with Module Federation
- Need to coordinate routing between multiple React applications
- Want to load remote applications with their own routing systems
- Require seamless navigation across different micro-applications

## Installation

```bash
npm install @module-federation/react-router-proxy-plugin
# or
yarn add @module-federation/react-router-proxy-plugin
# or
pnpm add @module-federation/react-router-proxy-plugin
```

## Usage

### Basic Setup

Add the plugin to your Webpack configuration alongside the Module Federation Plugin:

```js
const ModuleFederationPlugin = require('@module-federation/webpack');
const ReactRouterProxyPlugin = require('@module-federation/react-router-proxy-plugin');

const moduleFederationOptions = {
  name: 'remote1',
  exposes: {
    './App': './src/App.tsx',
  },
  // Note: DO NOT set react-router-dom as shared when using this plugin
  shared: ['react', 'react-dom'],
};

module.exports = {
  plugins: [
    new ModuleFederationPlugin(moduleFederationOptions),
    new ReactRouterProxyPlugin({
      moduleFederationOptions
    }),
  ],
};
```

### With Rsbuild

```js
// rsbuild.config.ts
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { ModuleFederationPlugin } from '@module-federation/webpack';
import ReactRouterProxyPlugin from '@module-federation/react-router-proxy-plugin';

export default defineConfig({
  plugins: [pluginReact()],
  tools: {
    rspack: (config, { appendPlugins }) => {
      const mfOptions = {
        name: 'remote1',
        exposes: {
          './App': './src/App.tsx',
        },
        shared: ['react', 'react-dom'],
      };
      
      appendPlugins([
        new ModuleFederationPlugin(mfOptions),
        new ReactRouterProxyPlugin({
          moduleFederationOptions: mfOptions
        }),
      ]);
    },
  },
});
```

### Alternative Simple Usage

If you prefer a more streamlined approach, you can also use the plugin without explicitly passing all Module Federation options:

```js
const ModuleFederationPlugin = require('@module-federation/webpack');
const ReactRouterProxyPlugin = require('@module-federation/react-router-proxy-plugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'remote1',
      exposes: {
        './App': './src/App.tsx',
      },
      shared: ['react', 'react-dom'],
    }),
    // The plugin will automatically detect and configure router proxying
    new ReactRouterProxyPlugin({
      moduleFederationOptions: {
        name: 'remote1', // Minimal config required
      }
    }),
  ],
};
```

## How It Works

The plugin performs the following operations:

1. **Version Detection**: Automatically detects the React Router version in your project
2. **Alias Configuration**: Sets up Webpack aliases to proxy React Router imports:
   - React Router v5: `react-router-dom` → `@module-federation/bridge-react/dist/router-v5.es.js`
   - React Router v6: `react-router-dom` → `@module-federation/bridge-react/dist/router-v6.es.js`
3. **Safety Checks**: Ensures `react-router-dom` is not configured as a shared dependency
4. **Automatic Integration**: Applies configuration during Webpack's compilation process

## API Reference

### ReactRouterProxyPlugin Options

```typescript
interface ReactRouterProxyPluginOptions {
  moduleFederationOptions: ModuleFederationPluginOptions;
}
```

- `moduleFederationOptions`: The same options passed to ModuleFederationPlugin

## Important Considerations

### ⚠️ Shared Dependencies

**DO NOT** set `react-router-dom` as a shared dependency when using this plugin:

```js
// ❌ This will cause an error
new ModuleFederationPlugin({
  shared: {
    'react-router-dom': { singleton: true }, // This will throw an error
  },
});

// ✅ Correct usage
new ModuleFederationPlugin({
  shared: ['react', 'react-dom'], // react-router-dom should NOT be here
});
```

### Supported React Router Versions

- React Router v5.x (uses `router-v5.es.js` bridge)
- React Router v6.x (uses `router-v6.es.js` bridge)

## Related Packages

This plugin works in conjunction with:

- [`@module-federation/bridge-react`](../bridge-react): Provides React Bridge components and utilities
- [`@module-federation/webpack`](../../webpack): Module Federation Webpack plugin
- [`@module-federation/runtime`](../../runtime): Module Federation runtime

## Example Project Structure

```
my-micro-frontend/
├── host-app/
│   ├── webpack.config.js (with ReactRouterProxyPlugin)
│   └── src/
│       └── App.tsx (loads remote apps)
├── remote-app/
│   ├── webpack.config.js (with ReactRouterProxyPlugin)
│   └── src/
│       ├── App.tsx (uses createBridgeComponent)
│       └── routes/ (internal routing)
```

## Troubleshooting

### Common Issues

1. **Error: "React-router-dom cannot be set to shared"**
   - Remove `react-router-dom` from the shared dependencies configuration

2. **Routing not working between apps**
   - Ensure both host and remote apps use the ReactRouterProxyPlugin
   - Verify that remote apps use `createBridgeComponent` for exports

3. **Version conflicts**
   - Check that all apps use compatible React Router versions
   - The plugin automatically handles v5/v6 differences

## License

MIT