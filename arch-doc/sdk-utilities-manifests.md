# Module Federation SDK Utilities, Manifest, Snapshot, and Stats Reference

This document owns SDK utilities, manifest/snapshot/stat types, usage examples, best practices, and export inventory. Use [sdk-reference.md](./sdk-reference.md) as the SDK reference index.

## SDK Utility Functions

The Module Federation SDK provides these utility functions:

### generateSnapshotFromManifest

Generate snapshot data from manifest information:

```typescript
function generateSnapshotFromManifest(
  manifest: Manifest,
  options?: {
    remotes?: Record<string, string>;
    overrides?: Record<string, string>;
    version?: string;
  }
): ProviderModuleInfo;
```

### isManifestProvider

Check if a module info is a manifest provider:

```typescript
function isManifestProvider(
  moduleInfo: ModuleInfo | ManifestProvider
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
  url: string
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
  fallback?: string;
  fallbackName?: string;
  fallbackType?: RemoteEntryType;
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
 * Build stats emitted alongside the manifest (mf-stats.json)
 */
interface Stats<T = BasicStatsMetaData, K = StatsRemoteVal> {
  id: string;
  name: string;
  metaData: StatsMetaData<T>;
  shared: StatsShared[];
  remotes: StatsRemote<K>[];
  exposes: StatsExpose[];
}

/**
 * JavaScript module object
 */
type Module = any;

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
 * Consumer module information (provider fields plus a consumer list,
 * with either publicPath or getPublicPath)
 */
type ConsumerModuleInfo =
  | (BasicProviderModuleInfo & {
      consumerList: Array<string>;
      publicPath: string;
      ssrPublicPath?: string;
    })
  | (BasicProviderModuleInfo & {
      consumerList: Array<string>;
      getPublicPath: string;
    });

/**
 * Pure consumer module information (consumer fields without remoteTypes)
 */
type PureConsumerModuleInfo = {
  version: string;
  buildVersion: string;
  remoteTypesZip: string;
  remoteTypesAPI?: string;
  remotesInfo: Record<string, { matchedVersion: string }>;
  shared: Array<{
    sharedName: string;
    version?: string;
    assets: StatsAssets;
  }>;
  consumerList: Array<string>;
};

/**
 * Manifest provider type
 */
interface ManifestProvider {
  remoteEntry: string;
  ssrRemoteEntry?: string;
  version?: string;
}

/**
 * Pure entry provider
 */
interface PureEntryProvider extends ManifestProvider {
  globalName: string;
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
  path?: string;
  file: string;
  requires: string[];
  assets: StatsAssets;
  hash?: string;
}

interface StatsShared {
  id: string;
  name: string;
  version: string;
  singleton: boolean;
  requiredVersion: string;
  hash: string;
  assets: StatsAssets;
  deps: string[];
  usedIn: string[];
  usedExports: string[];
  fallback: string;
  fallbackName: string;
  fallbackType: RemoteEntryType;
}

interface StatsRemoteVal {
  moduleName: string;
  federationContainerName: string;
  consumingFederationContainerName: string;
  alias: string;
  usedIn: string[];
}

type StatsRemote<T = StatsRemoteVal> =
  | (T & Omit<RemoteWithEntry, 'name'>)
  | (T & Omit<RemoteWithVersion, 'name'>);

interface StatsBuildInfo {
  buildVersion: string;
  buildName: string;
  hash?: string;
}

interface ResourceInfo {
  path: string;
  name: string;
  type: RemoteEntryType;
}

interface MetaDataTypes {
  path: string;
  name: string;
  api: string;
  zip: string;
}

interface BasicStatsMetaData {
  name: string;
  globalName: string;
  buildInfo: StatsBuildInfo;
  remoteEntry: ResourceInfo;
  ssrRemoteEntry?: ResourceInfo;
  types?: MetaDataTypes;
  type: string;
  pluginVersion?: string;
}

type StatsMetaData<T = BasicStatsMetaData> =
  | (T & { getPublicPath: string })
  | (T & { publicPath: string; ssrPublicPath?: string });
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
