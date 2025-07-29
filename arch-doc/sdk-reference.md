# Module Federation SDK Reference

This document provides a comprehensive reference for the Module Federation SDK, including all interfaces, types, and utilities needed to implement Module Federation in your bundler.

## Table of Contents
- [Core Interfaces](#core-interfaces)
- [Plugin Types](#plugin-types)
- [Runtime Types](#runtime-types)
- [Utility Functions](#utility-functions)
- [Normalization Utilities](#normalization-utilities)
- [Manifest Types](#manifest-types)
- [Advanced Types](#advanced-types)

## Core Interfaces

### ModuleFederationPluginOptions

The main configuration interface for Module Federation:

```typescript
interface ModuleFederationPluginOptions {
  /**
   * A unique name for the container. 
   * This name will be used as the global variable for the container.
   */
  name: string;
  
  /**
   * The filename of the container entry.
   * @default "remoteEntry.js"
   */
  filename?: string;
  
  /**
   * Modules to expose from this container.
   * Key is the exposed name, value is the module path.
   */
  exposes?: Record<string, string | ExposeConfig>;
  
  /**
   * Remote containers to consume.
   * Key is the local name, value is the remote configuration.
   */
  remotes?: Record<string, string | RemoteConfig>;
  
  /**
   * Shared modules configuration.
   */
  shared?: SharedConfig;
  
  /**
   * Library configuration for how the container is exposed.
   */
  library?: LibraryOptions;
  
  /**
   * Runtime implementation path.
   * Used to override the default runtime.
   */
  implementation?: string;
  
  /**
   * Runtime plugins to load.
   * Array of paths to runtime plugin modules.
   */
  runtimePlugins?: string[];
  
  /**
   * Dynamic public path configuration.
   */
  getPublicPath?: string;
  
  /**
   * TypeScript declaration generation options.
   */
  dts?: PluginDtsOptions;
  
  /**
   * Development mode options.
   */
  dev?: PluginDevOptions;
  
  /**
   * Manifest generation options.
   */
  manifest?: PluginManifestOptions;
  
  /**
   * Strategy for loading shared modules.
   * @default "version-first"
   */
  shareStrategy?: 'version-first' | 'loaded-first';
  
  /**
   * Default share scope name.
   * @default "default"
   */
  shareScope?: string;
  
  /**
   * Experimental features configuration.
   */
  experiments?: ExperimentalOptions;
}
```

### ExposeConfig

Advanced configuration for exposed modules:

```typescript
interface ExposeConfig {
  /**
   * The internal module path to expose.
   */
  import: string;
  
  /**
   * A custom name for the exposed module.
   */
  name?: string;
  
  /**
   * Override the default sharing scope.
   */
  shareScope?: string;
}
```

### RemoteConfig

Configuration for remote containers:

```typescript
interface RemoteConfig {
  /**
   * External URL or global variable for the remote.
   */
  external: string | string[];
  
  /**
   * Override the default share scope.
   */
  shareScope?: string;
  
  /**
   * Type of external.
   * @default "var"
   */
  externalType?: ExternalType;
}

type ExternalType = 
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
  | 'amd'
  | 'amd-require'
  | 'umd'
  | 'umd2'
  | 'jsonp'
  | 'system'
  | 'promise'
  | 'import'
  | 'script';
```

### SharedConfig

Configuration for shared modules:

```typescript
type SharedConfig = (string | SharedObject)[] | Record<string, string | SharedObject>;

interface SharedObject {
  /**
   * Load the module eagerly on startup.
   * @default false
   */
  eager?: boolean;
  
  /**
   * Fallback module to use if sharing fails.
   * Set to false to disable fallback.
   * @default module name
   */
  import?: string | false;
  
  /**
   * Package name for version detection.
   * @default module name
   */
  packageName?: string;
  
  /**
   * Required version range (semver).
   * @default "*"
   */
  requiredVersion?: string | false;
  
  /**
   * Share key in the share scope.
   * @default package name
   */
  shareKey?: string;
  
  /**
   * Override default share scope.
   * @default "default"
   */
  shareScope?: string;
  
  /**
   * Only allow one instance across all containers.
   * @default false
   */
  singleton?: boolean;
  
  /**
   * Require exact version match (no semver ranges).
   * @default false
   */
  strictVersion?: boolean;
  
  /**
   * Version to provide.
   * @default version from package.json
   */
  version?: string | false;
  
  /**
   * Enable node_modules path reconstruction.
   * @default true
   */
  nodeModulesReconstructedLookup?: boolean;
}
```

### LibraryOptions

Configuration for container library output:

```typescript
interface LibraryOptions {
  /**
   * Library type.
   */
  type: LibraryType;
  
  /**
   * Library name.
   */
  name?: string | string[] | {
    amd?: string;
    commonjs?: string;
    root?: string | string[];
  };
  
  /**
   * Library export type.
   */
  export?: string | string[];
  
  /**
   * Use auxiliary comments.
   */
  auxiliaryComment?: string | {
    root?: string;
    commonjs?: string;
    commonjs2?: string;
    amd?: string;
  };
  
  /**
   * Add UMD wrapper.
   */
  umdNamedDefine?: boolean;
}

type LibraryType = 
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
  | 'amd'
  | 'amd-require'
  | 'umd'
  | 'umd2'
  | 'jsonp'
  | 'system';
```

## Plugin Types

### PluginDtsOptions

TypeScript declaration generation options:

```typescript
interface PluginDtsOptions {
  /**
   * Generate TypeScript declarations.
   * @default true
   */
  generateTypes?: boolean;
  
  /**
   * Path to tsconfig.json.
   * @default "./tsconfig.json"
   */
  tsConfigPath?: string;
  
  /**
   * Output directory for generated types.
   * @default "@types"
   */
  typesOutputDir?: string;
  
  /**
   * Compile only exposed modules.
   * @default true
   */
  compileInChildProcess?: boolean;
  
  /**
   * Additional files to include.
   */
  additionalFilesToCompile?: string[];
  
  /**
   * Override consumer types generation path.
   */
  consumeTypesPrompt?: string;
  
  /**
   * Disable runtime types generation.
   * @default false
   */
  disableRuntimeTypesGeneration?: boolean;
}
```

### PluginDevOptions

Development mode options:

```typescript
interface PluginDevOptions {
  /**
   * Enable hot module replacement for types.
   * @default true
   */
  enableHotTypesReload?: boolean;
  
  /**
   * Disable live types reload.
   * @default false
   */
  disableLiveTypesReload?: boolean;
}
```

### PluginManifestOptions

Manifest generation options:

```typescript
interface PluginManifestOptions {
  /**
   * Generate manifest file.
   * @default true
   */
  generate?: boolean;
  
  /**
   * Manifest filename.
   * @default "mf-manifest.json"
   */
  filename?: string;
  
  /**
   * Include exposed modules in manifest.
   * @default true
   */
  exposes?: boolean;
  
  /**
   * Include remotes in manifest.
   * @default true
   */
  remotes?: boolean;
  
  /**
   * Include shared modules in manifest.
   * @default true
   */
  shared?: boolean;
  
  /**
   * Additional metadata to include.
   */
  metadata?: Record<string, any>;
}
```

### ExperimentalOptions

Experimental features configuration:

```typescript
interface ExperimentalOptions {
  /**
   * Enable async startup for all entry points.
   * @default false
   */
  asyncStartup?: boolean;
  
  /**
   * Use external runtime.
   * @default false
   */
  externalRuntime?: boolean;
  
  /**
   * Provide external runtime for consumers.
   * @default false
   */
  provideExternalRuntime?: boolean;
  
  /**
   * Optimization options.
   */
  optimization?: {
    /**
     * Disable snapshot generation.
     * @default false
     */
    disableSnapshot?: boolean;
    
    /**
     * Target environment for optimization.
     * @default "web"
     */
    target?: 'web' | 'node';
  };
}
```

## Runtime Types

### FederationRuntimeOptions

Runtime initialization options:

```typescript
interface FederationRuntimeOptions {
  /**
   * Container name.
   */
  name: string;
  
  /**
   * Remote configurations.
   */
  remotes?: RemoteInfo[];
  
  /**
   * Shared module configurations.
   */
  shared?: SharedInfo[];
  
  /**
   * Runtime plugins.
   */
  plugins?: RuntimePlugin[];
  
  /**
   * Snapshot configuration.
   */
  snapshot?: SnapshotOptions;
  
  /**
   * Custom logger.
   */
  logger?: Logger;
}
```

### RemoteInfo

Runtime remote configuration:

```typescript
interface RemoteInfo {
  /**
   * Remote name.
   */
  name: string;
  
  /**
   * Remote entry URL.
   */
  entry: string;
  
  /**
   * Entry type.
   * @default "script"
   */
  type?: 'script' | 'module';
  
  /**
   * Share scope name.
   * @default "default"
   */
  shareScope?: string;
  
  /**
   * Custom entry loading function.
   */
  customLoader?: (url: string) => Promise<void>;
}
```

### SharedInfo

Runtime shared module configuration:

```typescript
interface SharedInfo {
  /**
   * Package name.
   */
  name: string;
  
  /**
   * Version.
   */
  version: string;
  
  /**
   * Share scope.
   * @default "default"
   */
  scope?: string;
  
  /**
   * Module getter function.
   */
  get: () => Promise<Module> | Module;
  
  /**
   * Eager loading.
   * @default false
   */
  eager?: boolean;
  
  /**
   * Singleton constraint.
   * @default false
   */
  singleton?: boolean;
  
  /**
   * Required version range.
   */
  requiredVersion?: string;
  
  /**
   * Strict version matching.
   * @default false
   */
  strictVersion?: boolean;
}
```

### RuntimePlugin

Runtime plugin interface:

```typescript
interface RuntimePlugin {
  /**
   * Plugin name.
   */
  name: string;
  
  /**
   * Apply plugin to federation instance.
   */
  apply(federation: FederationInstance): void;
}

interface FederationInstance {
  /**
   * Hook system.
   */
  hooks: FederationHooks;
  
  /**
   * Load remote module.
   */
  loadRemote(id: string): Promise<Module>;
  
  /**
   * Load shared module.
   */
  loadShare(name: string, version?: string): Promise<Module>;
  
  /**
   * Register remote.
   */
  registerRemote(remote: RemoteInfo): void;
  
  /**
   * Register shared module.
   */
  registerShared(shared: SharedInfo): void;
  
  /**
   * Get snapshot.
   */
  getSnapshot(): Snapshot;
}
```

### FederationHooks

Hook system interface:

```typescript
interface FederationHooks {
  /**
   * Before initialization.
   */
  beforeInit: SyncHook<[FederationRuntimeOptions]>;
  
  /**
   * After initialization.
   */
  init: AsyncHook<[FederationRuntimeOptions, FederationContext]>;
  
  /**
   * Before loading remote.
   */
  beforeLoadRemote: AsyncWaterfallHook<[string, LoadRemoteOptions]>;
  
  /**
   * After loading remote.
   */
  loadRemote: AsyncHook<[string, Module, RemoteMetadata]>;
  
  /**
   * Before loading shared module.
   */
  beforeLoadShare: AsyncWaterfallHook<[string, string, LoadShareOptions]>;
  
  /**
   * After loading shared module.
   */
  loadShare: AsyncHook<[string, Module, ShareMetadata]>;
  
  /**
   * Error handling.
   */
  error: AsyncHook<[Error, ErrorContext]>;
}
```

## Utility Functions

### normalizeFederationOptions

Normalize plugin options:

```typescript
function normalizeFederationOptions(
  options: ModuleFederationPluginOptions
): NormalizedModuleFederationOptions {
  return {
    name: options.name,
    filename: options.filename || 'remoteEntry.js',
    exposes: normalizeExposes(options.exposes),
    remotes: normalizeRemotes(options.remotes),
    shared: normalizeShared(options.shared),
    shareScope: options.shareScope || 'default',
    library: normalizeLibrary(options.library),
    runtime: options.implementation,
    runtimePlugins: options.runtimePlugins || [],
    experiments: normalizeExperiments(options.experiments)
  };
}
```

### normalizeShared

Normalize shared configuration:

```typescript
function normalizeShared(
  shared?: SharedConfig
): Record<string, NormalizedSharedConfig> {
  if (!shared) return {};
  
  const result: Record<string, NormalizedSharedConfig> = {};
  
  if (Array.isArray(shared)) {
    for (const item of shared) {
      if (typeof item === 'string') {
        result[item] = createDefaultSharedConfig(item);
      } else {
        const name = item.packageName || item.shareKey;
        result[name] = normalizeSharedObject(name, item);
      }
    }
  } else {
    for (const [key, value] of Object.entries(shared)) {
      if (typeof value === 'string') {
        result[key] = createDefaultSharedConfig(value);
      } else {
        result[key] = normalizeSharedObject(key, value);
      }
    }
  }
  
  return result;
}

interface NormalizedSharedConfig {
  eager: boolean;
  import: string | false;
  packageName: string;
  requiredVersion: string;
  shareKey: string;
  shareScope: string;
  singleton: boolean;
  strictVersion: boolean;
  version: string;
}
```

### parseRemoteUrl

Parse remote URL configuration:

```typescript
function parseRemoteUrl(remote: string): ParsedRemote {
  // Handle various formats:
  // "app@http://localhost:3000/remoteEntry.js"
  // "app@[window.app, 'http://localhost:3000/remoteEntry.js']"
  // "promise new Promise(...)"
  
  if (remote.startsWith('promise ')) {
    return {
      type: 'promise',
      expression: remote.slice(8)
    };
  }
  
  const [name, ...urlParts] = remote.split('@');
  const url = urlParts.join('@');
  
  if (url.startsWith('[') && url.endsWith(']')) {
    // Handle array format
    const parsed = parseArrayFormat(url);
    return {
      type: 'array',
      name,
      fallbacks: parsed
    };
  }
  
  return {
    type: 'string',
    name,
    url
  };
}

interface ParsedRemote {
  type: 'string' | 'array' | 'promise';
  name?: string;
  url?: string;
  fallbacks?: string[];
  expression?: string;
}
```

## Normalization Utilities

### Version Utilities

```typescript
/**
 * Check if a version satisfies a requirement.
 */
function satisfies(version: string, requirement: string): boolean {
  if (requirement === '*' || requirement === '' || !requirement) {
    return true;
  }
  
  return semverSatisfies(version, requirement);
}

/**
 * Find the best matching version from available versions.
 */
function findBestMatch(
  availableVersions: string[],
  requirement: string
): string | null {
  const compatible = availableVersions
    .filter(v => satisfies(v, requirement))
    .sort(semverCompare)
    .reverse();
    
  return compatible[0] || null;
}

/**
 * Parse version from package.json content.
 */
function parseVersionFromPackage(content: string): string {
  try {
    const pkg = JSON.parse(content);
    return pkg.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}
```

### Path Utilities

```typescript
/**
 * Resolve expose path.
 */
function resolveExposePathWithContext(
  expose: string,
  context: string
): string {
  if (path.isAbsolute(expose)) {
    return expose;
  }
  
  // Handle relative paths
  if (expose.startsWith('.')) {
    return path.resolve(context, expose);
  }
  
  // Handle module paths
  return expose;
}

/**
 * Create public path expression.
 */
function createPublicPathExpression(
  getPublicPath?: string
): string | undefined {
  if (!getPublicPath) return undefined;
  
  // Ensure it's a valid expression
  if (getPublicPath.includes('(') && getPublicPath.includes(')')) {
    return getPublicPath;
  }
  
  // Wrap in IIFE
  return `(function() { return ${getPublicPath}; })()`;
}
```

## Manifest Types

### Manifest Structure

```typescript
interface ModuleFederationManifest {
  /**
   * Manifest version.
   */
  version: string;
  
  /**
   * Container name.
   */
  name: string;
  
  /**
   * Build timestamp.
   */
  timestamp: number;
  
  /**
   * Build metadata.
   */
  metadata?: {
    version?: string;
    author?: string;
    description?: string;
    [key: string]: any;
  };
  
  /**
   * Exposed modules.
   */
  exposes?: Record<string, ExposeManifest>;
  
  /**
   * Remote containers.
   */
  remotes?: Record<string, RemoteManifest>;
  
  /**
   * Shared modules.
   */
  shared?: Record<string, SharedManifest>;
}

interface ExposeManifest {
  /**
   * Chunk IDs for this exposed module.
   */
  chunks: string[];
  
  /**
   * Assets for this module.
   */
  assets: string[];
  
  /**
   * Module ID.
   */
  id: string;
}

interface RemoteManifest {
  /**
   * Remote entry URL.
   */
  entry: string;
  
  /**
   * Remote type.
   */
  type: string;
}

interface SharedManifest {
  /**
   * Version provided.
   */
  version: string;
  
  /**
   * Is singleton.
   */
  singleton: boolean;
  
  /**
   * Is eager.
   */
  eager: boolean;
  
  /**
   * Required version range.
   */
  requiredVersion?: string;
}
```

## Advanced Types

### Snapshot Types

```typescript
interface Snapshot {
  /**
   * Snapshot version.
   */
  version: string;
  
  /**
   * Build hash.
   */
  buildHash: string;
  
  /**
   * Remote snapshots.
   */
  remotes: Record<string, RemoteSnapshot>;
  
  /**
   * Exposed modules snapshot.
   */
  exposes: Record<string, ExposeSnapshot>;
  
  /**
   * Shared modules snapshot.
   */
  shared: Record<string, SharedSnapshot>;
}

interface RemoteSnapshot {
  /**
   * Remote URL.
   */
  url: string;
  
  /**
   * Build hash of remote.
   */
  buildHash?: string;
  
  /**
   * Available modules.
   */
  modules?: string[];
}

interface ExposeSnapshot {
  /**
   * Module hash.
   */
  hash: string;
  
  /**
   * Dependencies.
   */
  deps: string[];
  
  /**
   * Size in bytes.
   */
  size: number;
}

interface SharedSnapshot {
  /**
   * Version.
   */
  version: string;
  
  /**
   * Hash.
   */
  hash: string;
  
  /**
   * Dependencies.
   */
  deps: string[];
}
```

### Error Types

```typescript
class ModuleFederationError extends Error {
  code: ErrorCode;
  context?: ErrorContext;
  
  constructor(message: string, code: ErrorCode, context?: ErrorContext) {
    super(message);
    this.name = 'ModuleFederationError';
    this.code = code;
    this.context = context;
  }
}

enum ErrorCode {
  REMOTE_NOT_FOUND = 'REMOTE_NOT_FOUND',
  REMOTE_LOAD_ERROR = 'REMOTE_LOAD_ERROR',
  SHARED_VERSION_CONFLICT = 'SHARED_VERSION_CONFLICT',
  SINGLETON_CONFLICT = 'SINGLETON_CONFLICT',
  MISSING_SHARED_MODULE = 'MISSING_SHARED_MODULE',
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION',
  RUNTIME_ERROR = 'RUNTIME_ERROR'
}

interface ErrorContext {
  /**
   * Module or remote ID.
   */
  id?: string;
  
  /**
   * Required version.
   */
  requiredVersion?: string;
  
  /**
   * Available versions.
   */
  availableVersions?: string[];
  
  /**
   * Stack trace.
   */
  stack?: string;
  
  /**
   * Additional context.
   */
  [key: string]: any;
}
```

## Helper Types

### Module Types

```typescript
/**
 * Generic module type.
 */
type Module = any;

/**
 * Module factory function.
 */
type ModuleFactory = () => Module | Promise<Module>;

/**
 * Container interface.
 */
interface Container {
  /**
   * Initialize container with share scope.
   */
  init(shareScope: ShareScope): void | Promise<void>;
  
  /**
   * Get module from container.
   */
  get(module: string): Promise<ModuleFactory>;
}

/**
 * Share scope structure.
 */
interface ShareScope {
  [packageName: string]: {
    [version: string]: {
      get: () => Promise<Module>;
      loaded?: boolean;
      loading?: Promise<void>;
      from: string;
      eager?: boolean;
    };
  };
}
```

### Compilation Types

These types are needed for bundler integration:

```typescript
interface CompilationContext {
  /**
   * Compilation instance.
   */
  compilation: any;
  
  /**
   * Compiler instance.
   */
  compiler: any;
  
  /**
   * Module factory.
   */
  normalModuleFactory?: any;
}

interface ModuleFactoryContext {
  /**
   * Request string.
   */
  request: string;
  
  /**
   * Context directory.
   */
  context: string;
  
  /**
   * Dependencies.
   */
  dependencies: any[];
  
  /**
   * Resolve data.
   */
  resolveData?: any;
}
```

## Usage Examples

### Basic Configuration

```typescript
import { ModuleFederationPluginOptions } from '@module-federation/sdk';

const config: ModuleFederationPluginOptions = {
  name: 'app',
  filename: 'remoteEntry.js',
  exposes: {
    './Button': './src/components/Button',
    './Header': './src/components/Header'
  },
  remotes: {
    utils: 'utils@http://localhost:3001/remoteEntry.js'
  },
  shared: {
    react: {
      singleton: true,
      requiredVersion: '^18.0.0'
    },
    'react-dom': {
      singleton: true,
      requiredVersion: '^18.0.0'
    }
  }
};
```

### Runtime Plugin Example

```typescript
import { RuntimePlugin, FederationInstance } from '@module-federation/sdk';

class MyCustomPlugin implements RuntimePlugin {
  name = 'MyCustomPlugin';
  
  apply(federation: FederationInstance) {
    // Hook into initialization
    federation.hooks.init.tapAsync(this.name, async (options, context) => {
      console.log('Federation initialized with:', options);
    });
    
    // Modify remote loading
    federation.hooks.beforeLoadRemote.tapAsync(this.name, async (id, options) => {
      console.log(`Loading remote: ${id}`);
      
      // Add custom headers
      if (options.customLoader) {
        const originalLoader = options.customLoader;
        options.customLoader = async (url) => {
          console.log(`Custom loading: ${url}`);
          return originalLoader(url);
        };
      }
      
      return [id, options];
    });
    
    // Handle errors
    federation.hooks.error.tapAsync(this.name, async (error, context) => {
      console.error('Federation error:', error);
      // Send to monitoring service
    });
  }
}
```

## Best Practices

1. **Type Safety**: Always use TypeScript interfaces for configuration
2. **Version Management**: Use specific version ranges for shared modules
3. **Error Handling**: Implement comprehensive error handling
4. **Validation**: Validate configuration before applying
5. **Documentation**: Document custom types and extensions

## Next Steps

- See [Implementation Guide](./implementation-guide.md) for using these types
- Review [Advanced Topics](./advanced-topics.md) for complex scenarios
- Check [Architecture Overview](./architecture-overview.md) for system context