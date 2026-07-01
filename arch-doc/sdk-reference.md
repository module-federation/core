# Module Federation SDK Reference

This document provides a reference for the current `@module-federation/sdk` role in the monorepo. The SDK is the foundation package used by runtime-core, runtime, enhanced/rspack, rsbuild/rspress, metro, manifest, managers, dts-plugin, webpack-bundler-runtime, utilities, devtools, and platform adapters.

## Table of Contents

- [Core Interfaces](#core-interfaces)
- [Plugin Types](#plugin-types)
- [Runtime Types](#runtime-types)
- [SDK Utilities, Manifests, Snapshots, Stats, and Exports](#sdk-utilities-manifests-snapshots-stats-and-exports)

## SDK Ownership

The SDK exports the shared vocabulary for the rest of the architecture:

Use `architecture-overview.md` for the canonical repo-wide package taxonomy. This section only describes SDK-owned contracts and helper surfaces.

| Export area | Source files | Used by |
| --- | --- | --- |
| Constants and common utilities | `constant.ts`, `utils.ts` | Runtime packages, build plugins, managers, utilities, manifests, and tests. |
| Typed contracts | `types/common.ts`, `types/hooks.ts`, `types/manifest.ts`, `types/snapshot.ts`, `types/stats.ts`, `types/plugins/*` | Plugin option schemas, manifest/stat/snapshot data, runtime plugin hooks, container/share plugin contracts. |
| Environment loaders | `env.ts`, `dom.ts`, `node.ts` | Browser and Node remote entry loading, script/link creation, environment detection. |
| Manifest/snapshot helpers | `generateSnapshotFromManifest.ts` | Runtime snapshot loading, manifest consumers, preload and asset decisions. |
| Config normalization helpers | `normalizeOptions.ts`, `createModuleFederationConfig.ts` | User-facing config helpers and build integration normalization. |
| Webpack path normalization | `normalize-webpack-path.ts` | Repo code that needs webpack internals without hard-coded bare webpack paths. |

Architecturally, packages should depend on SDK for shared types and primitives, not on each other for incidental utility code. If a helper is needed by runtime, manifest, and multiple build integrations, it belongs in SDK only when it is stable and not tied to a specific bundler lifecycle.

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
  deleteTsConfig?: boolean;
  afterGenerate?: (
    options: DtsGenerateTypesHookOptions,
  ) => Promise<void> | void;
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

interface DtsGenerateTypesHookOptions {
  zipTypesPath: string;
  apiTypesPath: string;
  zipName: string;
  apiFileName: string;
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

## SDK Utilities, Manifests, Snapshots, Stats, and Exports

Utility functions, manifest/snapshot/stat types, usage examples, best practices, and export inventory live in [sdk-utilities-manifests.md](./sdk-utilities-manifests.md).

## Related Documentation

For implementation guidance and context, see:
- [Architecture Overview](./architecture-overview.md) - System architecture using these interfaces
- [Plugin Architecture](./plugin-architecture.md) - Build-time plugin integration patterns
- [Runtime Architecture](./runtime-architecture.md) - Runtime usage of SDK utilities
- [Implementation Guide](./implementation-guide.md) - Practical SDK usage examples
- [Manifest Specification](./manifest-specification.md) - Manifest-related types and schemas
- [Error Handling Specification](./error-handling-specification.md) - Error types and handling patterns
- [Advanced Topics](./advanced-topics.md) - Production SDK usage patterns
