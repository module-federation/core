# Module Federation Enhanced Plugin Architecture

## Overview

The Module Federation Enhanced plugin is a webpack 5-specific implementation that orchestrates multiple sub-plugins to enable module federation capabilities. This document describes the actual implementation architecture based on the codebase analysis.

## Webpack Version Requirement

**Important**: This plugin is built exclusively for webpack 5. There is no webpack 4 compatibility layer or abstraction. The implementation directly uses webpack 5 APIs and module structures.

## Core Plugin Structure

### Main Plugin: ModuleFederationPlugin

The `ModuleFederationPlugin` is the orchestrator that applies sub-plugins in a specific order. The actual plugin application sequence is:

#### Phase 1: Immediate Application (before afterPlugins hook)

1. **RemoteEntryPlugin** - Must be applied before ModuleFederationPlugin
2. **ExternalsPlugin** (conditional) - Applied if `experiments.externalRuntime === true`
3. **FederationModulesPlugin** - Sets up federation hooks
4. **StartupChunkDependenciesPlugin** (conditional) - Applied if `experiments.asyncStartup === true`
5. **DtsPlugin** (conditional) - Applied if `dts !== false`
6. **PrefetchPlugin** (conditional) - Applied if `dataPrefetch` is configured
7. **FederationRuntimePlugin** - Core runtime setup
8. **DefinePlugin** - Defines build-time constants
9. **StatsPlugin** (conditional) - Applied if `manifest !== false` and exposes exist

#### Phase 2: afterPlugins Hook (deferred application)

Only three plugins use the afterPlugins hook:

1. **ContainerPlugin** (conditional) - Applied if `exposes` is defined
2. **ContainerReferencePlugin** (conditional) - Applied if `remotes` is defined
3. **SharePlugin** (conditional) - Applied if `shared` is defined

### Plugin Dependencies Chain

When `ContainerPlugin` is applied, it triggers:
- **FederationRuntimePlugin** (re-applied)

When `FederationRuntimePlugin` is applied, it triggers:
- **EmbedFederationRuntimePlugin**
- **HoistContainerReferencesPlugin**

## Experiments Configuration

The `experiments` object controls several advanced features:

```typescript
experiments?: {
  optimization?: {
    disableSnapshot?: boolean;  // Controls FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN
    target?: 'web' | 'node';    // Controls ENV_TARGET
  };
  provideExternalRuntime?: boolean;  // Adds inject-external-runtime-core-plugin
  externalRuntime?: boolean;         // Externalizes @module-federation/runtime-core
  asyncStartup?: boolean;            // Enables StartupChunkDependenciesPlugin
}
```

## Direct Webpack Coupling

The implementation is tightly coupled to webpack 5 internals:

1. **Direct require() of webpack internals**:
   ```javascript
   const ModuleDependency = require(
     normalizeWebpackPath('webpack/lib/dependencies/ModuleDependency')
   );
   ```

2. **Webpack-specific compilation hooks**:
   - `compiler.hooks.afterPlugins`
   - `compiler.hooks.compilation`
   - `compiler.hooks.make`
   - `compilation.hooks.optimizeChunks`

3. **Webpack-specific module types**:
   - Custom dependencies extending webpack's `ModuleDependency`
   - Custom module factories
   - Direct manipulation of webpack's chunk graph

## Conditional Plugin Application

Plugins are conditionally applied based on configuration:

- **ContainerPlugin**: Only if `exposes` is defined and non-empty
- **ContainerReferencePlugin**: Only if `remotes` is defined and non-empty
- **SharePlugin**: Only if `shared` is defined
- **StatsPlugin**: Only if `manifest !== false` and container plugin is used
- **DtsPlugin**: Only if `dts !== false`
- **PrefetchPlugin**: Only if `dataPrefetch` is configured
- **StartupChunkDependenciesPlugin**: Only if `experiments.asyncStartup === true`

## RSpack Compatibility Note

While the codebase imports from `@module-federation/rspack/remote-entry-plugin`, this is a compatibility hack. The core implementation remains webpack 5-specific and uses webpack's internal APIs directly.

## Performance Characteristics

No performance claims can be verified from the codebase. The plugin system adds multiple layers of indirection and hooks into webpack's compilation process. Actual performance depends on:

- Number of exposed/remote modules
- Shared dependencies configuration
- Build-time optimizations enabled
- Runtime loading patterns

## Build-time Constants

The plugin defines several build-time constants via DefinePlugin:

- `FEDERATION_BUILD_IDENTIFIER`: Composed from name and build version
- `FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN`: Based on `experiments.optimization.disableSnapshot`
- `ENV_TARGET`: Only defined if manually specified in `experiments.optimization.target`

## Runtime Plugin System

The plugin supports runtime plugins via the `runtimePlugins` option. These are:
- Loaded as ES modules
- Applied during federation runtime initialization
- Can be file paths or module names

## Key Implementation Details

1. **Container Chunk Splitting**: `ContainerPlugin.patchChunkSplit()` modifies webpack's chunk splitting behavior for federation containers

2. **Manifest Generation**: Uses `ContainerManager` from `@module-federation/managers` to process expose options

3. **Library Type Support**: Automatically enables library types in webpack output configuration

4. **Single Instance Guard**: Uses WeakSet/WeakMap to ensure plugins are only applied once per compiler

## Limitations and Constraints

1. **Webpack 5 only** - No backward compatibility
2. **Direct webpack internals usage** - Fragile to webpack updates
3. **Fixed plugin order** - Cannot be customized
4. **Tight coupling** - Difficult to extend or modify behavior
5. **Limited experiments** - Only specific experimental features supported

## Summary

The Module Federation Enhanced plugin is a webpack 5-specific implementation that uses a fixed sequence of sub-plugins to enable module federation. It directly manipulates webpack internals, supports conditional feature enablement through experiments, and provides no abstraction layer for other bundlers. The architecture prioritizes webpack 5 integration over modularity or extensibility.