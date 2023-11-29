# FederationHost Class

## Overview
`FederationHost` orchestrates module federation, managing remote modules and shared dependencies. It utilizes a sophisticated plugin architecture and lifecycle hooks for comprehensive control and flexibility.

## Constructor
```typescript
constructor(userOptions: UserOptions)
```
Initializes `FederationHost` with user-defined options.

### Parameters
- `userOptions: UserOptions`: Configuration for the FederationHost.
  - **Properties**:
    - `name`: `string` - Name of the host.
    - `plugins`: `Array<FederationRuntimePlugin>` - List of plugins.
    - `remotes`: `Array<Remote>` - List of remote modules.
    - `shared`: `Record<string, SharedConfig>` - Configuration for shared modules.
    - `inBrowser`: `boolean` - Flag to indicate if running in a browser environment.

## Properties
- **options: Options**
  - Configuration settings of FederationHost.
  - **Properties**:
    - `id`: `string` - Unique identifier for the host.
    - `name`: `string` - Name of the host.
    - `plugins`: `Array<FederationRuntimePlugin>` - List of plugins.
    - `remotes`: `Array<Remote>` - List of remote modules.
    - `shared`: `Record<string, SharedConfig>` - Configuration for shared modules.
    - `inBrowser`: `boolean` - Flag to indicate if running in a browser environment.
- **hooks: PluginSystem**
  - Lifecycle hooks for FederationHost interaction.
- **version: string**
  - Version of FederationHost.
- **name: string**
  - Name identifier for FederationHost.
- **moduleCache: Map<string, Module>**
  - Cache for stored modules.
- **snapshotHandler: SnapshotHandler**
  - Manages snapshots in federation process.
- **loaderHook: PluginSystem**
  - Plugin system for module loading operations.
- **loadingShare: Object**
  - Tracks loading state of shared modules.

## Methods

### `initOptions`
```typescript
initOptions(userOptions: UserOptions): Options
```
Initializes or updates FederationHost options.

### `loadShare`
```typescript
async loadShare<T>(pkgName: string, customShareInfo?: Partial<Shared>): Promise<false | (() => T | undefined)>
```
Loads a shared module asynchronously.

### `loadShareSync`
```typescript
loadShareSync<T>(pkgName: string): () => T | never
```
Synchronously loads a shared module.

### `loadRemote`
```typescript
async loadRemote<T>(id: string, options?: { loadFactory?: boolean }): Promise<T | null>
```
Loads a remote module asynchronously.

### `preloadRemote`
```typescript
async preloadRemote(preloadOptions: Array<PreloadRemoteArgs>): Promise<void>
```
Preloads remote modules based on configurations.

### `initializeSharing`
```typescript
initializeSharing(shareScopeName?: string): boolean | Promise<boolean>
```
Initializes sharing sequences for shared scopes.

## Hooks
`FederationHost` offers various lifecycle hooks for interacting at different stages of the module federation process.

## Plugin System Integration
`FederationHost` utilizes `PluginSystem` for extended capabilities and custom behavior integration, using `FederationRuntimePlugin`.

## Types and Options

### `FederationRuntimePlugin`
- **Properties**:
  - `name`: `string` - Name of the plugin.
  - `version?`: `string` - Optional version of the plugin.
  - `CoreLifeCyclePartial`, `SnapshotLifeCycleCyclePartial`, `ModuleLifeCycleCyclePartial`: Partial lifecycle hooks for `FederationHost`, `SnapshotHandler`, and `Module`.

### `RemoteInfoOptionalVersion`
- **Properties**:
  - `name`: `string` - Name of the remote.
  - `version?`: `string` - Optional version of the remote.

### `PreloadRemoteArgs`
- **Properties**:
  - `nameOrAlias`: `string` - Name or alias of the remote.
  - `exposes?`: `Array<string>` - List of exposed modules.
  - `resourceCategory?`: `'all' | 'sync'` - Category of resources.
  - `share?`: `boolean` - Flag to share the module.
  - `depsRemote?`: `boolean | Array<depsPreloadArg>` - Dependencies of the remote.
  - `filter?`: `(assetUrl: string) => boolean` - Filter function for assets.
