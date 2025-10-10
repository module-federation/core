# Module Federation SDK Reference

This document provides a comprehensive reference for the Module Federation SDK, including all interfaces, types, and utilities needed to implement Module Federation in your bundler.

## Table of Contents
- [Core Interfaces](#core-interfaces)
- [Plugin Types](#plugin-types)
- [Runtime Types](#runtime-types)
- [SDK Utility Functions](#sdk-utility-functions)
- [Manifest Types](#manifest-types)
- [Snapshot Types](#snapshot-types)
- [Stats Types](#stats-types)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [SDK Exports](#sdk-exports)

## Core Interfaces

### ModuleFederationPluginOptions

The main configuration interface for Module Federation:

```typescript
interface ModuleFederationPluginOptions {
  /**
   * Modules that should be exposed by this container. When provided, property name is used as public name, otherwise public name is automatically inferred from request.
   */
  exposes?: Exposes;
  /**
   * The filename of the container as relative path inside the `output.path` directory.
   */
  filename?: string;
  /**
   * Options for library.
   */
  library?: LibraryOptions;
  /**
   * The name of the container.
   */
  name?: string;
  /**
   * The external type of the remote containers.
   */
  remoteType?: ExternalsType;
  /**
   * Container locations and request scopes from which modules should be resolved and loaded at runtime. When provided, property name is used as request scope, otherwise request scope is automatically inferred from container location.
   */
  remotes?: Remotes;
  /**
   * The name of the runtime chunk. If set a runtime chunk with this name is created or an existing entrypoint is used as runtime.
   */
  runtime?: EntryRuntime;
  /**
   * Share scope name used for all shared modules (defaults to 'default').
   */
  shareScope?: string | string[];
  /**
   * load shared strategy(defaults to 'version-first').
   */
  shareStrategy?: SharedStrategy;
  /**
   * Modules that should be shared in the share scope. When provided, property names are used to match requested modules in this compilation.
   */
  shared?: Shared;
  /**
   * Runtime plugin file paths or package name.
   */
  runtimePlugins?: Array<string | [string, Record<string, unknown>]>;
  /**
   * Custom public path function
   */
  getPublicPath?: string;
  /**
   * Bundler runtime path
   */
  implementation?: string;
  /**
   * Manifest generation options.
   */
  manifest?: boolean | PluginManifestOptions;
  /**
   * Development mode options.
   */
  dev?: boolean | PluginDevOptions;
  /**
   * TypeScript declaration generation options.
   */
  dts?: boolean | PluginDtsOptions;
  /**
   * Enable Data Prefetch
   */
  dataPrefetch?: DataPrefetch;
  /**
   * Virtual runtime entry configuration.
   */
  virtualRuntimeEntry?: boolean;
  /**
   * Experimental features configuration.
   */
  experiments?: {
    externalRuntime?: boolean;
    provideExternalRuntime?: boolean;
    asyncStartup?: boolean;
    /**
     * Options related to build optimizations.
     */
    optimization?: {
      /**
       * Enable optimization to skip snapshot plugin
       */
      disableSnapshot?: boolean;
      /**
       * Target environment for the build
       */
      target?: 'web' | 'node';
    };
  };
  /**
   * Bridge configuration.
   */
  bridge?: {
    /**
     * Disables the default alias setting in the bridge.
     * When true, users must manually handle basename through root component props.
     * @default false
     */
    disableAlias?: boolean;
  };
  /**
   * Configuration for async boundary plugin
   */
  async?: boolean | AsyncBoundaryOptions;
}
```

### ExposesConfig

Advanced configuration for modules that should be exposed by this container:

```typescript
interface ExposesConfig {
  /**
   * Request to a module that should be exposed by this container.
   */
  import: ExposesItem | ExposesItems;
  /**
   * Custom chunk name for the exposed module.
   */
  name?: string;
}

/**
 * Module that should be exposed by this container.
 */
type ExposesItem = string;

/**
 * Modules that should be exposed by this container.
 */
type ExposesItems = ExposesItem[];

/**
 * Modules that should be exposed by this container. When provided, property name is used as public name, otherwise public name is automatically inferred from request.
 */
type Exposes = (ExposesItem | ExposesObject)[] | ExposesObject;

/**
 * Modules that should be exposed by this container. Property names are used as public paths.
 */
interface ExposesObject {
  /**
   * Modules that should be exposed by this container.
   */
  [k: string]: ExposesConfig | ExposesItem | ExposesItems;
}
```

### RemotesConfig

Advanced configuration for container locations from which modules should be resolved and loaded at runtime:

```typescript
interface RemotesConfig {
  /**
   * Container locations from which modules should be resolved and loaded at runtime.
   */
  external: RemotesItem | RemotesItems;
  /**
   * The name of the share scope shared with this remote.
   */
  shareScope?: string | string[];
}

/**
 * Container location from which modules should be resolved and loaded at runtime.
 */
type RemotesItem = string;

/**
 * Container locations from which modules should be resolved and loaded at runtime.
 */
type RemotesItems = RemotesItem[];

/**
 * Container locations and request scopes from which modules should be resolved and loaded at runtime. When provided, property name is used as request scope, otherwise request scope is automatically inferred from container location.
 */
type Remotes = (RemotesItem | RemotesObject)[] | RemotesObject;

/**
 * Container locations from which modules should be resolved and loaded at runtime. Property names are used as request scopes.
 */
interface RemotesObject {
  /**
   * Container locations from which modules should be resolved and loaded at runtime.
   */
  [k: string]: RemotesConfig | RemotesItem | RemotesItems;
}

/**
 * Specifies the default type of externals ('amd*', 'umd*', 'system' and 'jsonp' depend on output.libraryTarget set to the same value).
 */
type ExternalsType =
  | 'var'
  | 'module'
  | 'assign'
  | 'this'
  | 'window'
  | 'self'
  | 'global'
  | 'commonjs'
  | 'commonjs2'
  | 'commonjs-module'
  | 'commonjs-static'
  | 'amd'
  | 'amd-require'
  | 'umd'
  | 'umd2'
  | 'jsonp'
  | 'system'
  | 'promise'
  | 'import'
  | 'module-import'
  | 'script'
  | 'node-commonjs';
```

### SharedConfig

Configuration for shared modules:

```typescript
/**
 * Modules that should be shared in the share scope. When provided, property names are used to match requested modules in this compilation.
 */
type Shared = (SharedItem | SharedObject)[] | SharedObject;

/**
 * A module that should be shared in the share scope.
 */
type SharedItem = string;

/**
 * Modules that should be shared in the share scope. Property names are used to match requested modules in this compilation. Relative requests are resolved, module requests are matched unresolved, absolute paths will match resolved requests. A trailing slash will match all requests with this prefix. In this case shareKey must also have a trailing slash.
 */
interface SharedObject {
  /**
   * Modules that should be shared in the share scope.
   */
  [k: string]: SharedConfig | SharedItem;
}

type SharedStrategy = 'version-first' | 'loaded-first';

/**
 * Advanced configuration for modules that should be shared in the share scope.
 */
interface SharedConfig {
  /**
   * Include the provided and fallback module directly instead behind an async request. This allows to use this shared module in initial load too. All possible shared modules need to be eager too.
   */
  eager?: boolean;
  /**
   * Provided module that should be provided to share scope. Also acts as fallback module if no shared module is found in share scope or version isn't valid. Defaults to the property name.
   */
  import?: false | SharedItem;
  /**
   * Layer in which the shared module should be placed.
   */
  layer?: string;
  /**
   * Layer of the issuer.
   */
  issuerLayer?: string;
  /**
   * Import request to match on
   */
  request?: string;
  /**
   * Package name to determine required version from description file. This is only needed when package name can't be automatically determined from request.
   */
  packageName?: string;
  /**
   * Version requirement from module in share scope.
   */
  requiredVersion?: false | string;
  /**
   * Module is looked up under this key from the share scope.
   */
  shareKey?: string;
  /**
   * Share scope name.
   */
  shareScope?: string | string[];
  /**
   * load shared strategy(defaults to 'version-first').
   */
  shareStrategy?: SharedStrategy;
  /**
   * Allow only a single version of the shared module in share scope (disabled by default).
   */
  singleton?: boolean;
  /**
   * Do not accept shared module if version is not valid (defaults to yes, if local fallback module is available and shared module is not a singleton, otherwise no, has no effect if there is no required version specified).
   */
  strictVersion?: boolean;
  /**
   * Version of the provided module. Will replace lower matching versions, but not higher.
   */
  version?: false | string;
}
```

### LibraryOptions

Configuration for container library output:

```typescript
/**
 * Options for library.
 */
interface LibraryOptions {
  /**
   * Add a container for define/require functions in the AMD module.
   */
  amdContainer?: string;
  /**
   * Add a comment in the UMD wrapper.
   */
  auxiliaryComment?: string | LibraryCustomUmdCommentObject;
  /**
   * Specify which export should be exposed as library.
   */
  export?: string[] | string;
  /**
   * The name of the library (some types allow unnamed libraries too).
   */
  name?: string[] | string | LibraryCustomUmdObject;
  /**
   * Type of library (types included by default are 'var', 'module', 'assign', 'assign-properties', 'this', 'window', 'self', 'global', 'commonjs', 'commonjs2', 'commonjs-module', 'commonjs-static', 'amd', 'amd-require', 'umd', 'umd2', 'jsonp', 'system', but others might be added by plugins).
   */
  type: LibraryType;
  /**
   * If `output.libraryTarget` is set to umd and `output.library` is set, setting this to true will name the AMD module.
   */
  umdNamedDefine?: boolean;
}

/**
 * Set explicit comments for `commonjs`, `commonjs2`, `amd`, and `root`.
 */
interface LibraryCustomUmdCommentObject {
  /**
   * Set comment for `amd` section in UMD.
   */
  amd?: string;
  /**
   * Set comment for `commonjs` (exports) section in UMD.
   */
  commonjs?: string;
  /**
   * Set comment for `commonjs2` (module.exports) section in UMD.
   */
  commonjs2?: string;
  /**
   * Set comment for `root` (global variable) section in UMD.
   */
  root?: string;
}

/**
 * Description object for all UMD variants of the library name.
 */
interface LibraryCustomUmdObject {
  /**
   * Name of the exposed AMD library in the UMD.
   */
  amd?: string;
  /**
   * Name of the exposed commonjs export in the UMD.
   */
  commonjs?: string;
  /**
   * Name of the property exposed globally by a UMD library.
   */
  root?: string[] | string;
}

/**
 * Type of library (types included by default are 'var', 'module', 'assign', 'assign-properties', 'this', 'window', 'self', 'global', 'commonjs', 'commonjs2', 'commonjs-module', 'commonjs-static', 'amd', 'amd-require', 'umd', 'umd2', 'jsonp', 'system', but others might be added by plugins).
 */
type LibraryType =
  | (
      | 'var'
      | 'module'
      | 'assign'
      | 'assign-properties'
      | 'this'
      | 'window'
      | 'self'
      | 'global'
      | 'commonjs'
      | 'commonjs2'
      | 'commonjs-module'
      | 'commonjs-static'
      | 'amd'
      | 'amd-require'
      | 'umd'
      | 'umd2'
      | 'jsonp'
      | 'system'
    )
  | string;
```

## Plugin Types

### PluginDtsOptions

TypeScript declaration generation options:

```typescript
interface PluginDtsOptions {
  /**
   * Generate types for exposed modules or consume types from remotes.
   */
  generateTypes?: boolean | DtsRemoteOptions;
  /**
   * Consume types from remotes.
   */
  consumeTypes?: boolean | DtsHostOptions;
  /**
   * Path to tsconfig.json.
   */
  tsConfigPath?: string;
  /**
   * Extra options.
   */
  extraOptions?: Record<string, any>;
  /**
   * DTS plugin implementation.
   */
  implementation?: string;
  /**
   * Current working directory.
   */
  cwd?: string;
  /**
   * Display errors in terminal.
   */
  displayErrorInTerminal?: boolean;
}

interface DtsRemoteOptions {
  tsConfigPath?: string;
  typesFolder?: string;
  compiledTypesFolder?: string;
  deleteTypesFolder?: boolean;
  additionalFilesToCompile?: string[];
  compileInChildProcess?: boolean;
  compilerInstance?: 'tsc' | 'vue-tsc' | 'tspc' | string;
  generateAPITypes?: boolean;
  extractThirdParty?:
    | boolean
    | {
        exclude?: Array<string | RegExp>;
      };
  extractRemoteTypes?: boolean;
  abortOnError?: boolean;
}

interface DtsHostOptions {
  typesFolder?: string;
  abortOnError?: boolean;
  remoteTypesFolder?: string;
  deleteTypesFolder?: boolean;
  maxRetries?: number;
  consumeAPITypes?: boolean;
  runtimePkgs?: string[];
  remoteTypeUrls?: (() => Promise<RemoteTypeUrls>) | RemoteTypeUrls;
  timeout?: number;
  typesOnBuild?: boolean;
}

interface RemoteTypeUrls {
  [remoteName: string]: {
    alias?: string;
    api: string;
    zip: string;
  };
}
```

### PluginDevOptions

Development mode options:

```typescript
interface PluginDevOptions {
  /**
   * Disable live reload functionality.
   */
  disableLiveReload?: boolean;
  /**
   * Disable hot types reload.
   */
  disableHotTypesReload?: boolean;
  /**
   * Disable dynamic remote type hints.
   */
  disableDynamicRemoteTypeHints?: boolean;
}
```

### PluginManifestOptions

Manifest generation options:

```typescript
interface PluginManifestOptions {
  /**
   * File path for the manifest.
   */
  filePath?: string;
  /**
   * Disable assets analysis.
   */
  disableAssetsAnalyze?: boolean;
  /**
   * Manifest filename.
   */
  fileName?: string;
  /**
   * Additional data function.
   */
  additionalData?: (
    options: AdditionalDataOptions,
  ) => Promise<Stats | void> | Stats | void;
}

interface AdditionalDataOptions {
  stats: Stats;
  manifest?: Manifest;
  pluginOptions: ModuleFederationPluginOptions;
  compiler: any; // webpack.Compiler
  compilation: any; // webpack.Compilation
  bundler: 'webpack' | 'rspack';
}

/**
 * Enable Data Prefetch
 */
type DataPrefetch = boolean;

/**
 * Async boundary options
 */
type AsyncBoundaryOptions = {
  eager?: RegExp | ((module: any) => boolean);
  excludeChunk?: (chunk: any) => boolean;
};
```

### Module Federation Types

Core types used throughout the Module Federation system:

```typescript
/**
 * The name of the runtime chunk. If set a runtime chunk with this name is created or an existing entrypoint is used as runtime.
 */
type EntryRuntime = false | string;
```

## Runtime Types

### UserOptions

Runtime initialization options:

```typescript
interface UserOptions {
  /**
   * Container name.
   */
  name: string;
  /**
   * Container version.
   */
  version?: string;
  /**
   * Remote configurations.
   */
  remotes: Array<Remote>;
  /**
   * Shared module configurations.
   */
  shared?: {
    [pkgName: string]: ShareArgs | ShareArgs[];
  };
  /**
   * Runtime plugins.
   */
  plugins?: Array<ModuleFederationRuntimePlugin>;
  /**
   * Share strategy.
   */
  shareStrategy?: SharedStrategy;
}
```

### Remote

Remote configuration:

```typescript
type Remote = (RemoteWithEntry | RemoteWithVersion) & RemoteInfoCommon;

interface RemoteWithEntry {
  name: string;
  entry: string;
}

interface RemoteWithVersion {
  name: string;
  version: string;
}

interface RemoteInfoCommon {
  alias?: string;
  shareScope?: string | string[];
  type?: RemoteEntryType;
  entryGlobalName?: string;
}

/**
 * Remote entry type supporting various module formats.
 */
type RemoteEntryType =
  | 'var'
  | 'module'
  | 'assign'
  | 'assign-properties'
  | 'this'
  | 'window'
  | 'self'
  | 'global'
  | 'commonjs'
  | 'commonjs2'
  | 'commonjs-module'
  | 'commonjs-static'
  | 'amd'
  | 'amd-require'
  | 'umd'
  | 'umd2'
  | 'jsonp'
  | 'system'
  | string;
```

### ShareArgs

Shared module configuration:

```typescript
type ShareArgs =
  | (SharedBaseArgs & { get: SharedGetter })
  | (SharedBaseArgs & { lib: () => Module })
  | SharedBaseArgs;

type SharedBaseArgs = {
  version?: string;
  shareConfig?: SharedConfig;
  scope?: string | Array<string>;
  deps?: Array<string>;
  strategy?: 'version-first' | 'loaded-first';
  loaded?: boolean;
};

type SharedGetter = (() => () => Module) | (() => Promise<() => Module>);
```

### ModuleFederationRuntimePlugin

Runtime plugin interface that extends multiple lifecycle partials:

```typescript
type ModuleFederationRuntimePlugin = CoreLifeCyclePartial &
  SnapshotLifeCyclePartial &
  SharedLifeCyclePartial &
  RemoteLifeCyclePartial &
  ModuleLifeCyclePartial &
  ModuleBridgeLifeCyclePartial & {
    name: string;
    version?: string;
    apply?: (instance: ModuleFederation) => void;
  };

type CoreLifeCyclePartial = Partial<{
  [k in keyof CoreLifeCycle]: Parameters<CoreLifeCycle[k]['on']>[0];
}>;

// Similar partial types exist for:
// - SnapshotLifeCyclePartial
// - SharedLifeCyclePartial  
// - RemoteLifeCyclePartial
// - ModuleLifeCyclePartial
// - ModuleBridgeLifeCyclePartial
```

## SDK Utility Functions

The Module Federation SDK provides these utility functions:

### generateSnapshotFromManifest

Generate snapshot data from manifest information:

```typescript
function generateSnapshotFromManifest(
  manifest: Manifest,
  options?: GenerateSnapshotOptions
): ModuleInfo | ProviderModuleInfo;
```

### isManifestProvider

Check if a module info is a manifest provider:

```typescript
function isManifestProvider(
  moduleInfo: ModuleInfo
): moduleInfo is ManifestProvider;
```

### simpleJoinRemoteEntry

Join remote entry path and name with proper handling:

```typescript
function simpleJoinRemoteEntry(
  rPath: string,
  rName: string
): string;
```

### inferAutoPublicPath

Infer public path automatically:

```typescript
function inferAutoPublicPath(
  remoteEntry: string
): string;
```

### parseEntry

Parse entry string into remote info:

```typescript
function parseEntry(
  str: string,
  devVerOrUrl?: string,
  separator?: string
): RemoteEntryInfo;

type RemoteEntryInfo = RemoteWithEntry | RemoteWithVersion;

interface RemoteWithEntry {
  name: string;
  entry: string;
}

interface RemoteWithVersion {
  name: string;
  version: string;
}
```

### createLogger

Create a logger instance:

```typescript
function createLogger(
  prefix: string
): Logger;

interface Logger {
  prefix: string;
  setPrefix: (prefix: string) => void;
  log: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  success: (...args: any[]) => void;
  info: (...args: any[]) => void;
  ready: (...args: any[]) => void;
  debug: (...args: any[]) => void;
}
```

### createModuleFederationConfig

Create normalized Module Federation configuration:

```typescript  
function createModuleFederationConfig(
  options: ModuleFederationPluginOptions
): ModuleFederationPluginOptions;
```

## Manifest Types

Manifest types from the actual SDK:

```typescript
interface Manifest<
  T = BasicStatsMetaData,
  K = ManifestRemoteCommonInfo,
> {
  id: string;
  name: string;
  metaData: StatsMetaData<T>;
  shared: ManifestShared[];
  remotes: ManifestRemote<K>[];
  exposes: ManifestExpose[];
}

interface ManifestShared {
  id: string;
  name: string;
  version: string;
  singleton: boolean;
  requiredVersion: string;
  hash: string;
  assets: StatsAssets;
}

interface ManifestRemoteCommonInfo {
  federationContainerName: string;
  moduleName: string;
  alias: string;
}

type ManifestRemote<T = ManifestRemoteCommonInfo> =
  | (Omit<RemoteWithEntry, 'name'> & T)
  | (Omit<RemoteWithVersion, 'name'> & T);

type ManifestExpose = Pick<
  StatsExpose,
  'assets' | 'id' | 'name' | 'path'
>;
```

## Snapshot Types

Snapshot types from the actual SDK:

```typescript
interface BasicProviderModuleInfo {
  version: string;
  buildVersion: string;
  remoteTypes: string;
  remoteTypesZip: string;
  remoteTypesAPI?: string;
  remotesInfo: Record<string, { matchedVersion: string }>;
  shared: Array<{
    sharedName: string;
    version?: string;
    assets: StatsAssets;
  }>;
  remoteEntry: string;
  remoteEntryType: RemoteEntryType;
  ssrRemoteEntry?: string;
  ssrRemoteEntryType?: RemoteEntryType;
  globalName: string;
  modules: Array<{
    moduleName: string;
    modulePath?: string;
    assets: StatsAssets;
  }>;
  prefetchInterface?: boolean;
}

type ProviderModuleInfo =
  | (BasicProviderModuleInfo & { publicPath: string; ssrPublicPath?: string })
  | (BasicProviderModuleInfo & { getPublicPath: string });

type ModuleInfo =
  | ConsumerModuleInfo
  | PureConsumerModuleInfo
  | ProviderModuleInfo;

type GlobalModuleInfo = {
  [key: string]: ModuleInfo | ManifestProvider | PureEntryProvider | undefined;
};
```

## Stats Types

Statistics and assets types:

```typescript
/**
 * Webpack/bundler statistics object
 */
interface Stats {
  [key: string]: any;
}

/**
 * JavaScript module object
 */
interface Module {
  [key: string]: any;
}

/**
 * Core lifecycle interfaces (implementation details)
 */
interface CoreLifeCycle {
  [key: string]: {
    on: (callback: (...args: any[]) => void) => void;
  };
}

/**
 * Module Federation runtime instance
 */
interface ModuleFederation {
  [key: string]: any;
}

/**
 * Generation options for snapshots
 */
interface GenerateSnapshotOptions {
  [key: string]: any;
}

/**
 * Consumer module information
 */
interface ConsumerModuleInfo {
  [key: string]: any;
}

/**
 * Pure consumer module information
 */
interface PureConsumerModuleInfo {
  [key: string]: any;
}

/**
 * Manifest provider type
 */
interface ManifestProvider {
  [key: string]: any;
}

/**
 * Pure entry provider
 */
interface PureEntryProvider {
  [key: string]: any;
}
```

```typescript
type StatsAssets = {
  js: {
    sync: string[];
    async: string[];
  };
  css: {
    sync: string[];
    async: string[];
  };
};

interface StatsExpose {
  id: string;
  name: string;
  path: string;
  assets: StatsAssets;
}

interface BasicStatsMetaData {
  [key: string]: any;
}

interface StatsMetaData<T = BasicStatsMetaData> {
  version: string;
  buildVersion: string;
  name: string;
  remoteTypesAPI?: string;
  buildHash?: string;
  types?: T;
}
```

## Usage Examples

### Basic Configuration

```typescript
import { ModuleFederationPluginOptions } from '@module-federation/sdk';

const config: ModuleFederationPluginOptions = {
  name: 'host-app',
  remotes: {
    mf1: 'mf1@http://localhost:3001/mf-manifest.json'
  },
  shared: {
    react: {
      singleton: true,
      requiredVersion: '^18.0.0'
    }
  }
};
```

### Runtime Usage

```typescript
import { init, loadRemote } from '@module-federation/runtime';

// Initialize federation
const federation = init({
  name: 'host',
  remotes: [
    {
      name: 'remote1',
      entry: 'http://localhost:3001/remoteEntry.js'
    }
  ]
});

// Load a remote module
const RemoteComponent = await loadRemote<React.ComponentType>('remote1/Component');
```

## Best Practices

1. **Type Safety**: Always use TypeScript interfaces for configuration
2. **Version Management**: Use specific version ranges for shared modules  
3. **Error Handling**: Implement comprehensive error handling with try-catch
4. **Manifest Usage**: Prefer manifest-based remotes for better reliability
5. **Documentation**: Document custom types and extensions

## SDK Exports

The Module Federation SDK exports these key utilities:

- `generateSnapshotFromManifest` - Generate snapshot from manifest
- `isManifestProvider` - Check if module info is manifest provider
- `simpleJoinRemoteEntry` - Join remote entry URLs
- `inferAutoPublicPath` - Auto infer public path
- `parseEntry` - Parse entry strings
- `createLogger` - Create logger instances
- `createModuleFederationConfig` - Create normalized config

## Related Documentation

For implementation guidance and context, see:
- [Architecture Overview](./architecture-overview.md) - System architecture using these interfaces
- [Plugin Architecture](./plugin-architecture.md) - Build-time plugin integration patterns
- [Runtime Architecture](./runtime-architecture.md) - Runtime usage of SDK utilities
- [Implementation Guide](./implementation-guide.md) - Practical SDK usage examples
- [Manifest Specification](./manifest-specification.md) - Manifest-related types and schemas
- [Error Handling Specification](./error-handling-specification.md) - Error types and handling patterns
- [Advanced Topics](./advanced-topics.md) - Production SDK usage patterns
