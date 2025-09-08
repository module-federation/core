# @module-federation/rspeedy-core-plugin

A Module Federation runtime plugin for rspeedy (Lynx) applications.

## Overview

This plugin enables Module Federation functionality in rspeedy/Lynx environments by bridging the Module Federation runtime with Lynx's native script loading mechanism (`nativeApp.loadScript`).

## Installation

```bash
npm install @module-federation/rspeedy-core-plugin
# or
pnpm add @module-federation/rspeedy-core-plugin
```

## Usage

### Basic Setup (Synchronous)

```typescript
import { createInstance } from '@module-federation/enhanced/runtime';
import RspeedyCorePlugin from '@module-federation/rspeedy-core-plugin';

const mfInstance = createInstance({
  name: 'host',
  remotes: [
    {
      name: 'remote1',
      entry: 'http://localhost:3001/remoteEntry.js',
    },
  ],
  plugins: [RspeedyCorePlugin()],
});
```

### Async Setup

For scenarios where you prefer asynchronous script loading:

```typescript
import { createInstance } from '@module-federation/enhanced/runtime';
import { AsyncRspeedyCorePlugin } from '@module-federation/rspeedy-core-plugin';

const mfInstance = createInstance({
  name: 'host',
  remotes: [
    {
      name: 'remote1',
      entry: 'http://localhost:3001/remoteEntry.js',
    },
  ],
  plugins: [AsyncRspeedyCorePlugin()],
});
```

### With Rspeedy Configuration

In your `lynx.config.ts`:

```typescript
import { defineConfig } from '@lynx-js/rspeedy';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

export default defineConfig({
  plugins: [
    pluginModuleFederation({
      name: 'host',
      remotes: {
        remote1: 'remote1@http://localhost:3001/mf-manifest.json',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  // ... other rspeedy config
});
```

## How It Works

1. **loadEntry Hook**: The plugin implements the `loadEntry` hook to intercept module federation remote loading
2. **Native Script Loading**: Uses Lynx's `nativeApp.loadScript()` method to load remote entries
3. **Bundle Initialization**: Properly initializes the loaded bundle with the required Lynx context (`tt` parameter)
4. **Container Return**: Returns the initialized module federation container for use

## API

### RspeedyCorePlugin()

Returns a Module Federation runtime plugin configured for Lynx/rspeedy environments using synchronous script loading.

**Returns**: `FederationRuntimePlugin`

### AsyncRspeedyCorePlugin()

Returns a Module Federation runtime plugin configured for Lynx/rspeedy environments using asynchronous script loading.

**Returns**: `FederationRuntimePlugin`

## Environment Requirements

- Must be running in a Lynx environment with `globalThis.nativeApp` available
- The remote entries must be built with Module Federation support
- Compatible with rspeedy/Lynx's bundle loading mechanism

## Error Handling

The plugin includes comprehensive error handling for:
- Missing `globalThis.nativeApp`
- Failed script loading
- Invalid module federation containers
- Initialization errors

## Comparison with Other Plugins

This plugin is similar to:
- `@module-federation/repack-core-plugin` for React Native
- `@module-federation/metro-core-plugin` for Metro

But specifically designed for the Lynx runtime environment and rspeedy bundler.

## Contributing

Please see the main Module Federation repository for contribution guidelines.

## License

MIT