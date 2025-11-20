## Lynx Module Federation Demo

This is a ReactLynx project with Module Federation support, demonstrating the `@module-federation/rspeedy-core-plugin`.

## Features

- ✅ **Lynx/Rspeedy Integration**: Built with `@lynx-js/rspeedy`
- ✅ **Module Federation**: Uses `@module-federation/rsbuild-plugin` for build-time setup
- ✅ **Runtime Plugin**: Implements `@module-federation/rspeedy-core-plugin` for native script loading
- ✅ **Error Handling**: Comprehensive error handling and fallback components
- ✅ **TypeScript**: Full TypeScript support with proper typing

## Architecture

### Build-time Configuration
- **`lynx.config.ts`**: Configures Module Federation with `pluginModuleFederation`
- **Shared Dependencies**: React, react-dom, and @lynx-js/react are shared between remotes
- **Remote Loading**: Configured to load remote applications via manifest files

### Runtime Configuration  
- **`src/module-federation-setup.ts`**: Initializes Module Federation runtime
- **`RspeedyCorePlugin`**: Bridges MF runtime with Lynx's `nativeApp.loadScript()`
- **Remote Loader**: Custom component for loading and displaying remote modules

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm run dev
```

Scan the QRCode in the terminal with your LynxExplorer App to see the result.

## Module Federation Demo

The app includes an interactive demo that showcases:

1. **Plugin Status**: Shows that the rspeedy-core-plugin is active
2. **Remote Loading**: Demonstrates loading remote modules (with error handling)
3. **Fallback Behavior**: Shows how the system handles failed remote loads
4. **Native Bridge**: Explains how the plugin bridges to Lynx's native script loading

## Key Files

- **`src/module-federation-setup.ts`**: MF runtime initialization with rspeedy plugin
- **`src/components/ModuleFederationDemo.tsx`**: Interactive demo component
- **`src/components/RemoteLoader.tsx`**: Generic remote module loader
- **`lynx.config.ts`**: Build configuration with Module Federation

## Adding Remote Applications

To add actual remote applications:

1. **Update `lynx.config.ts`**:
```typescript
pluginModuleFederation({
  name: 'lynx-host',
  remotes: {
    'my-remote': 'my-remote@http://localhost:3001/mf-manifest.json',
  },
  // ...
})
```

2. **Update `src/module-federation-setup.ts`**:
```typescript
const mfInstance = createInstance({
  name: 'lynx-host',
  remotes: [{
    name: 'my-remote',
    entry: 'http://localhost:3001/mf-manifest.json',
  }],
  plugins: [RspeedyCorePlugin()],
});
```

3. **Use in components**:
```tsx
<RemoteLoader
  remoteName="my-remote"
  moduleName="Button"
  fallback={FallbackComponent}
/>
```

## Development

You can start editing the page by modifying `src/App.tsx`. The page auto-updates as you edit the file.
