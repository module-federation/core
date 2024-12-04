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

### `registerRemotes`
```typescript
registerRemotes(remotes: Remote[], options?: { force?: boolean }): void
```
Register remotes after init.

## Hooks
`FederationHost` offers various lifecycle hooks for interacting at different stages of the module federation process. These hooks include:

- **`beforeInit`**: `SyncWaterfallHook<{ userOptions: UserOptions; options: Options; origin: FederationHost; shareInfo: ShareInfos; }>`
  - Updates Federation Host configurations before the initialization process of remote containers.
- **`init`**: `SyncHook<[{ options: Options; origin: FederationHost; }], void>`
  - Called during the initialization of remote containers.
- **`beforeRequest`**: `AsyncWaterfallHook<{ id: string; options: Options; origin: FederationHost; }>`
  - Invoked before resolving a remote container, useful for injecting the container or updating something ahead of the lookup.
- **`afterResolve`**: `AsyncWaterfallHook<LoadRemoteMatch>`
  - Called after resolving a container, allowing redirection or modification of resolved information.
- **`beforeInitContainer`**: `AsyncWaterfallHook<{shareScope: ShareScopeMap[string];initScope: InitScope;remoteEntryInitOptions: RemoteEntryInitOptions;origin: FederationHost;}>`
  - Get the init parameters and use them before the remote container init method is called.
- **`initContainer`**: `AsyncWaterfallHook<{shareScope: ShareScopeMap[string];initScope: InitScope;remoteEntryInitOptions: RemoteEntryInitOptions;remoteEntryExports: RemoteEntryExports;origin: FederationHost;}>`
  - Invoked after container.init is called
- **`onLoad`**: `AsyncHook<[{ id: string; expose: string; pkgNameOrAlias: string; remote: Remote; options: ModuleOptions; origin: FederationHost; exposeModule: any; exposeModuleFactory: any; moduleInstance: Module; }], void>`
  - Triggered once a federated module is loaded, allowing access and modification to the exports of the loaded file.
- **`handlePreloadModule`**: `SyncHook<{ id: string; name: string; remoteSnapshot: ModuleInfo; preloadConfig: PreloadRemoteArgs; }, void>`
  - Handles preloading logic for federated modules.
- **`errorLoadRemote`**: `AsyncHook<[{ id: string; error: unknown; }], void | unknown>`
  - Invoked if loading a federated module fails, enabling custom error handling.
- **`beforeLoadShare`**: `AsyncWaterfallHook<{ pkgName: string; shareInfo?: Shared;

 shared: Options['shared']; origin: FederationHost; }>`
  - Called before attempting to load or negotiate shared modules between federated apps.
- **`loadShare`**: `AsyncHook<[FederationHost, string, ShareInfos]>`
  - Similar to `onLoad`, but for shared modules.
- **`resolveShare`**: `SyncHook<[{ shareScopeMap: ShareScopeMap; scope: string; pkgName: string; version: string; GlobalFederation: Federation; resolver: () => Shared; }], void>`
  - Allows manual resolution of shared module requests.
- **`beforePreloadRemote`**: `AsyncHook<{ preloadOps: Array<PreloadRemoteArgs>; options: Options; origin: FederationHost; }>`
  - Invoked before any preload logic is executed by the preload handler.
- **`generatePreloadAssets`**: `AsyncHook<[{ origin: FederationHost; preloadOptions: PreloadOptions[number]; remote: Remote; remoteInfo: RemoteInfo; remoteSnapshot: ModuleInfo; globalSnapshot: GlobalModuleInfo; }], Promise<PreloadAssets>>`
  - Called for generating preload assets based on configurations.
- **`afterPreloadRemote`**: `AsyncHook<{ preloadOps: Array<PreloadRemoteArgs>; options: Options; origin: FederationHost; }>`
  - Invoked after the remote modules are preloaded.

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
