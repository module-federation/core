# @module-federation/esbuild

Module Federation plugin for esbuild. Enables sharing code between independently built and deployed applications using the Module Federation protocol.

## Installation

```bash
npm install @module-federation/esbuild @module-federation/runtime
# or
pnpm add @module-federation/esbuild @module-federation/runtime
```

## Requirements

- **esbuild** `^0.25.0`
- **format**: `'esm'` (ESM output is required for dynamic imports and top-level await)
- **splitting**: `true` (code splitting is required for shared/exposed module chunks)
- **@module-federation/runtime** must be installed and resolvable

The plugin will automatically set `format: 'esm'` and `splitting: true` if not already configured.

## Quick Start

### 1. Create a Federation Config

```js
// federation.config.js
const { withFederation } = require('@module-federation/esbuild/build');

module.exports = withFederation({
  name: 'myApp',
  filename: 'remoteEntry.js',
  exposes: {
    './Button': './src/components/Button',
  },
  remotes: {
    remoteApp: 'http://localhost:3001/remoteEntry.js',
  },
  shared: {
    react: { singleton: true, version: '^18.2.0' },
    'react-dom': { singleton: true, version: '^18.2.0' },
  },
});
```

### 2. Use the Plugin in Your Build

```js
const esbuild = require('esbuild');
const { moduleFederationPlugin } = require('@module-federation/esbuild/plugin');
const federationConfig = require('./federation.config.js');

esbuild.build({
  entryPoints: ['./src/main.tsx'],
  outdir: './dist',
  bundle: true,
  format: 'esm',
  splitting: true,
  plugins: [moduleFederationPlugin(federationConfig)],
});
```

## How It Works

### Architecture

The plugin uses `@module-federation/runtime` directly for all Module Federation functionality. It works by intercepting module imports via esbuild's plugin hooks and replacing them with virtual modules that use the MF runtime:

1. **Shared Modules**: Imports of shared dependencies (e.g., `react`) are replaced with virtual proxy modules that call `loadShare()` from the MF runtime for version negotiation between containers.

2. **Remote Modules**: Imports matching remote names (e.g., `remoteApp/Button`) are replaced with virtual proxy modules that call `loadRemote()` to fetch modules from remote containers at runtime.

3. **Container Entry**: When `exposes` is configured, a `remoteEntry.js` is generated with standard `get()`/`init()` exports that follow the Module Federation protocol.

4. **Runtime Initialization**: Entry points are augmented with runtime initialization code that sets up the MF instance before any app code runs, using ESM top-level await.

5. **Manifest**: An `mf-manifest.json` is generated for runtime discovery.

### Shared Module Flow

```
┌─────────────────────────────────────────────────┐
│ import React from 'react'                       │
│                    │                             │
│                    ▼                             │
│  ┌──────────────────────────┐                   │
│  │ Shared Proxy (virtual)    │                   │
│  │ loadShare('react')        │                   │
│  │   ├─ Share Scope found?   │                   │
│  │   │  ├─ YES: use shared   │                   │
│  │   │  └─ NO: use fallback  │───► Bundled react │
│  │   └─ return module        │     (separate     │
│  └──────────────────────────┘      chunk)        │
└─────────────────────────────────────────────────┘
```

### Remote Module Flow

```
┌─────────────────────────────────────────────────┐
│ import Button from 'remoteApp/Button'           │
│                    │                             │
│                    ▼                             │
│  ┌──────────────────────────┐                   │
│  │ Remote Proxy (virtual)    │                   │
│  │ loadRemote('remoteApp/    │                   │
│  │            Button')       │                   │
│  │   ├─ Load remoteEntry.js  │                   │
│  │   ├─ Call init(shareScope)│                   │
│  │   ├─ Call get('./Button') │                   │
│  │   └─ return module        │                   │
│  └──────────────────────────┘                   │
└─────────────────────────────────────────────────┘
```

## Configuration

### `withFederation(config)`

Normalizes a federation configuration object. Use this to prepare your config before passing it to `moduleFederationPlugin()`.

```js
const { withFederation } = require('@module-federation/esbuild/build');
```

#### Config Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | Yes | Unique name for this federation container |
| `filename` | `string` | No | Remote entry filename (default: `'remoteEntry.js'`) |
| `exposes` | `Record<string, string>` | No | Modules to expose to other containers |
| `remotes` | `Record<string, string>` | No | Remote containers to consume |
| `shared` | `Record<string, SharedConfig>` | No | Dependencies to share between containers |

#### SharedConfig

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `singleton` | `boolean` | `false` | Only allow a single version of this package |
| `strictVersion` | `boolean` | `false` | Throw error on version mismatch |
| `requiredVersion` | `string` | `'*'` | Required semver version range |
| `version` | `string` | auto | The version of the shared package |
| `eager` | `boolean` | `false` | Load shared module eagerly |

### `moduleFederationPlugin(config)`

Creates the esbuild plugin instance.

```js
const { moduleFederationPlugin } = require('@module-federation/esbuild/plugin');
```

## Examples

### Host Application (Consumer)

```js
// federation.config.js
const { withFederation } = require('@module-federation/esbuild/build');

module.exports = withFederation({
  name: 'host',
  remotes: {
    mfe1: 'http://localhost:3001/remoteEntry.js',
  },
  shared: {
    react: { singleton: true, version: '^18.2.0' },
    'react-dom': { singleton: true, version: '^18.2.0' },
  },
});
```

```tsx
// App.tsx - Using remote modules
import RemoteComponent from 'mfe1/component';

export function App() {
  return (
    <div>
      <h1>Host App</h1>
      <RemoteComponent />
    </div>
  );
}
```

### Remote Application (Provider)

```js
// federation.config.js
const { withFederation } = require('@module-federation/esbuild/build');

module.exports = withFederation({
  name: 'mfe1',
  filename: 'remoteEntry.js',
  exposes: {
    './component': './src/MyComponent',
  },
  shared: {
    react: { singleton: true, version: '^18.2.0' },
    'react-dom': { singleton: true, version: '^18.2.0' },
  },
});
```

### Both Host and Remote

An application can be both a host and a remote simultaneously:

```js
const { withFederation } = require('@module-federation/esbuild/build');

module.exports = withFederation({
  name: 'shell',
  filename: 'remoteEntry.js',
  exposes: {
    './Header': './src/Header',
  },
  remotes: {
    sidebar: 'http://localhost:3002/remoteEntry.js',
  },
  shared: {
    react: { singleton: true, version: '^18.2.0' },
    'react-dom': { singleton: true, version: '^18.2.0' },
  },
});
```

## API

### Exports from `@module-federation/esbuild/plugin`

- `moduleFederationPlugin(config)` - Creates the esbuild plugin

### Exports from `@module-federation/esbuild/build`

- `withFederation(config)` - Normalizes federation configuration
- `share(shareObjects)` - Processes shared dependency configurations
- `shareAll(config)` - Shares all dependencies from package.json
- `findPackageJson(folder)` - Finds nearest package.json
- `lookupVersion(key, workspaceRoot)` - Looks up dependency version
- `setInferVersion(infer)` - Enable/disable version inference

### Exports from `@module-federation/esbuild`

Re-exports everything from both `plugin` and `build` entry points.

## Notes

### Remote Module Named Exports

Since remote module exports are unknown at build time, only the default export is statically re-exported. For named exports from remote modules, use one of these patterns:

```js
// Pattern 1: Default import (recommended for React components)
import RemoteComponent from 'remote/component';

// Pattern 2: Destructure from default
import Remote from 'remote/utils';
const { helper, formatter } = Remote;

// Pattern 3: Dynamic import
const { helper } = await import('remote/utils');
```

### Shared Module Subpaths

When you share a package like `react`, subpath imports like `react/jsx-runtime` are also handled through the share scope. The plugin automatically detects subpath imports and routes them appropriately.
