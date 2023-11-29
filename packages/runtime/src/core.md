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

Based on your reference, here's how the hooks section can be enhanced with detailed information about the options, nested types, and examples for each hook:

## Hooks in FederationHost

### beforeInit
  - **Type**: `beforeInit(args: BeforeInitArgs): void`
  - **Description**: Executed before the initialization of FederationHost.
  - **BeforeInitArgs**:
    ```typescript
    type BeforeInitArgs = {
      userOptions: UserOptions;
      options: Options;
      origin: FederationHost;
      shareInfo: ShareInfos;
    };

    interface Options {
      id?: string;
      name: string;
      version?: string;
      remotes: Array<Remote>;
      shared: ShareInfos;
      plugins: Array<FederationRuntimePlugin>;
      inBrowser: boolean;
    }

    export type UserOptions = Omit<
      Optional<Options, 'plugins'>,
      'shared' | 'inBrowser'
    > & {
      shared?: {
        [pkgName: string]: ShareArgs;
      };
    };

    type ShareInfos = {
      // Information about shared modules
    };
    ```
  - **Example**:
    ```typescript
    federationHost.hooks.beforeInit.tap('MyPlugin', (args) => {
      // Plugin logic here
    });
    ```

### init
- **Type**: `init(args: InitArgs): void`
- **Description**: Triggered during the initialization of FederationHost.
- **InitArgs**:
  ```typescript
  type InitArgs = {
    options: Options;
    origin: FederationHost;
  };

  type Options = {
    // Finalized options for FederationHost
  };
  ```
- **Example**:
  ```typescript
  federationHost.hooks.init.tap('MyPlugin', (args) => {
    // Initialization logic
  });
  ```

### beforeLoadRemote
- **Type**: `beforeLoadRemote(args: BeforeLoadRemoteArgs): Promise<void>`
- **Description**: Invoked before a remote module is loaded.
- **BeforeLoadRemoteArgs**:
  ```typescript
  type BeforeLoadRemoteArgs = {
    id: string;
    options: Options;
    origin: FederationHost;
  };
  ```
- **Example**:
  ```typescript
  federationHost.hooks.beforeLoadRemote.tapPromise('MyPlugin', async (args) => {
    // Logic before loading a remote module
  });
  ```

### loadRemote
- **Type**: `loadRemote(args: LoadRemoteArgs): void`
- **Description**: Triggered when a remote module is loaded.
- **LoadRemoteArgs**:
  ```typescript
  type LoadRemoteArgs = {
    id: string;
    expose: string;
    pkgNameOrAlias: string;
    remote: Remote;
    options: ModuleOptions;
    origin: FederationHost;
    exposeModule: any;
    exposeModuleFactory: any;
    moduleInstance: Module;
  };

  type ModuleOptions = {
    // Options for the loaded module
  };
  ```
- **Example**:
  ```typescript
  federationHost.hooks.loadRemote.tap('MyPlugin', (args) => {
    // Logic when a remote module is loaded
  });
  ```

### afterPreloadRemote
- **Type**: `afterPreloadRemote(args: AfterPreloadRemoteArgs): void`
- **Description**: Called after remote modules have been preloaded.
- **AfterPreloadRemoteArgs**:
  ```typescript
  type AfterPreloadRemoteArgs = {
    preloadOps: Array<PreloadRemoteArgs>;
    options: Options;
    origin: FederationHost;
  };

  type PreloadRemoteArgs = {
    // Arguments for preloading remote modules
  };
  ```
- **Example**:
  ```typescript
  federationHost.hooks.afterPreloadRemote.tap('MyPlugin', (args) => {
    // Post-preloading logic
  });
  ```
