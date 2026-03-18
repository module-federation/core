# MFE Lifecycle Management Solution Summary

## Core Architecture Decisions

Our solution is based on the following key design decisions:

### 1. Cache Bundles Only, Not Manifests

- **Manifest is a runtime contract** (shared negotiation, expose mapping). Zephyr tag URLs are dynamic pointers - caching would lead to stale metadata
- **Bundle URLs are immutable** (each version has a unique URL containing username, buildId, content hash), naturally suitable as cache keys
- **Manifest always fetched from network**, handled by existing `SnapshotHandler`, flow remains unchanged

### 2. Native Layer Closed Loop

- In production mode, `@expo/metro-runtime`'s `buildUrlForBundle` only accepts `http://`/`https://` protocols - `file://` throws exceptions
- Download, storage, verification, and execution all sink to RN native module (`NativeMFECache`)
- `downloadFile(url, destPath)` → native layer uses `NSURLSession`/`OkHttp` to download while streaming SHA-256 calculation
- `evaluateJavaScript(filePath)` → native layer reads disk file and executes directly via JSI `runtime.evaluateJavaScript()`

### 3. Cache Layer Insertion Point: `asyncRequire.ts`'s `buildLoadBundleAsyncWrapper`

- Remote build artifacts include container bundle + exposed module bundle, both need caching
- Both go through `asyncRequire.ts`'s `buildLoadBundleAsyncWrapper` → inner `loadBundleAsync`
- `loadEntry` hook only intercepts container bundle, cannot cover exposed module bundles
- Cache layer placed inside wrapper, uses `isUrl(bundlePath)` to distinguish remote bundles (full URL) from host split bundles (relative path)

### 4. Package Structure Division

- **`metro-core`**: Pure JS/TS, MF Runtime integration layer, zero native dependencies
- **`metro-cache`**: RN native module package, contains native code (iOS Objective-C++ + Android Kotlin) + JS business logic (CacheManager, VersionPoller, EjectionManager)
- `metro-core` dynamically loads `metro-cache` via peer dependency (optional)

### 5. JS Layer Business Logic in `metro-cache` Package

- CacheManager, VersionPoller, FallbackChain, EjectionManager and other business logic all in JS layer (`metro-cache` package)
- Reasons: Need to access MF Runtime state, integrate with React lifecycle, business logic flexibility
- Native layer only provides low-level capabilities: file system, HTTP download, SHA-256, JS execution

## Complete Flow

### Build Side

```
Build all bundles (container + exposed + shared)
    ↓
Calculate SHA-256 for each bundle → store in bundleHashMap
    ↓
Update hash fields in manifest (metaData.buildInfo.bundleHash)
    ↓
Write final manifest → upload to Zephyr
```

### Runtime Three Paths

**1. Fallback Mode**: `__DEV__` / `metro-cache` not installed / host split bundle → use original `loadBundleAsync`

**2. Path A (Cache Hit)**:
```
getCachedBundle(bundleUrl) hits
    ↓
evaluateJavaScript(filePath) executes from disk
    ↓
Zero network requests, return immediately
```

**3. Path B (Cache Miss)**:
```
downloadFile(bundleUrl, destPath) download + write + streaming SHA-256
    ↓
Checksum verification (compare with bundleHash in manifest)
    ↓
saveBundleToCache() write MMKV metadata
    ↓
evaluateJavaScript(destPath) execute from disk
```

### Auxiliary Capabilities

- **VersionPoller**: Background polling manifest → detect bundleUrl changes → silent download marked as pendingUpdate → activate on cold start
- **FallbackChain**: errorLoadRemote → markBroken → three-tier fallback (previous → network → error)
- **EjectionManager**: Cleanup expired versions on startup + retry broken versions
- **hostBuildHash**: Clear all remote caches when host updates

## Key Technical Points

### 1. Independent Hash for Each Bundle

- Container bundle: `metaData.buildInfo.bundleHash`
- Exposed modules: `exposes[].hash` (future extension)
- Shared modules: `shared[].hash` (future extension)

### 2. Version Retention Strategy

- Fixed retention of current + previous two versions
- When new version activates: previous = current, current = new, delete older versions

### 3. Broken Version Retry Mechanism

- `retryDelayHours` (default 24 hours) + `maxRetryAttempts` (default 1 time)
- Check on startup if broken versions meet retry conditions, reset to active if eligible

### 4. Host Build Change Detection

- Calculate `hostBuildHash` at build time based on `shared` and `remotes` config
- Inject into host bundle via serializer's virtual module (`globalThis.__MF_HOST_BUILD_HASH__`)
- Compare on startup, clear all remote caches if mismatch

### 5. `loadBundleAsync` Return Value Compatibility

- `@expo/metro-runtime` type definition: `type AsyncRequire = (path: string) => Promise<void>`
- `result` is always `undefined`
- Our `evaluateJavaScript` also returns `Promise<void>`, fully compatible

## Data Model

### BundleMetadata

```typescript
type BundleStatus = 'active' | 'pendingUpdate' | 'broken' | 'pendingCleanup';

interface BundleMetadata {
  remoteName: string;        // MFE name, e.g. "miniApp"
  bundleHash: string;        // SHA-256 hash (written by build side, used for runtime verification)
  buildVersion: string;      // Version label in manifest (human-readable, non-unique)
  filePath: string;          // Absolute path on disk
  bundleUrl: string;         // Bundle download URL (immutable, used as cache key)
  downloadedAt: number;      // Download timestamp (ms)
  lastUsedAt: number;        // Last used timestamp (ms)
  status: BundleStatus;      // Current status
  // Broken retry related
  retryCount: number;        // Retry count, initially 0
  lastRetryAt: number | null; // Last retry timestamp (ms), null means never retried
}
```

### MMKV Storage Structure

```
# Bundle metadata (high-frequency reads, scanned on app startup)
mfe:bundle:{remoteName}:{bundleUrl_hash}  → BundleMetadata JSON
# Note: bundleUrl_hash is short hash of bundleUrl (e.g. first 16 chars of SHA-256)

# Current active version's bundleUrl pointer
mfe:active:{remoteName}                   → bundleUrl string

# Previous version's bundleUrl pointer
mfe:previous:{remoteName}                 → bundleUrl string

# Host build hash (used to detect host updates and clear cache)
mfe:hostBuildHash                         → hostBuildHash string
```

### Memory Index Structure

```typescript
// Internal memory index maintained by CacheManager (restored from MMKV)
interface MemoryIndex {
  // bundleUrl -> BundleMetadata (fast cache hit lookup)
  urlIndex: Map<string, BundleMetadata>;
  // remoteName -> currently active BundleMetadata
  activeVersions: Map<string, BundleMetadata>;
  // remoteName -> previous version BundleMetadata (may be null)
  previousVersions: Map<string, BundleMetadata | null>;
}
```

## Component Interfaces

### NativeMFECache Bridge (metro-cache package)

```typescript
export interface NativeMFECacheSpec {
  // File system operations
  writeFile(path: string, content: string, encoding: 'utf8' | 'base64'): Promise<void>;
  readFile(path: string, encoding: 'utf8' | 'base64'): Promise<string>;
  deleteFile(path: string): Promise<void>;
  fileExists(path: string): Promise<boolean>;
  getDocumentDirectory(): Promise<string>;

  // SHA-256 hash calculation
  sha256File(filePath: string): Promise<string>;
  sha256String(content: string): Promise<string>;

  // HTTP download (native layer closed loop: download + write + streaming SHA-256)
  downloadFile(url: string, destPath: string): Promise<{ sha256: string; bytesWritten: number }>;

  // JS execution (native layer closed loop: read disk file + JSI evaluateJavaScript)
  evaluateJavaScript(filePath: string): Promise<void>;
}
```

### CacheManager (metro-cache package)

```typescript
interface CacheManager {
  // Initialize, restore memory index from MMKV
  initialize(): Promise<void>;

  // Query cache: use bundleUrl as key (immutable URL)
  getCachedBundle(bundleUrl: string): Promise<CachedBundleResult | null>;

  // Generate destination path for bundle file (for downloadFile use)
  getBundleDestPath(remoteName: string, bundleUrl: string): Promise<string>;

  // Save downloaded bundle metadata (bundle file already written to destPath by downloadFile)
  // Auto rotation: new → current, current → previous, delete older versions
  saveBundleToCache(
    remoteName: string,
    filePath: string,
    metadata: Omit<BundleMetadata, 'remoteName' | 'filePath' | 'downloadedAt' | 'lastUsedAt' | 'status' | 'retryCount' | 'lastRetryAt'>
  ): Promise<BundleMetadata>;

  // Save PendingUpdate bundle metadata (bundle file already written to tempPath by downloadFile)
  savePendingUpdate(
    remoteName: string,
    filePath: string,
    metadata: Omit<BundleMetadata, 'remoteName' | 'filePath' | 'downloadedAt' | 'lastUsedAt' | 'status' | 'retryCount' | 'lastRetryAt'>
  ): Promise<BundleMetadata>;

  // Activate PendingUpdate (called on cold start, triggers version rotation)
  activatePendingUpdate(remoteName: string): Promise<BundleMetadata | null>;

  // Mark as BrokenVersion (identified by bundleUrl)
  markBroken(remoteName: string, bundleUrl: string): Promise<void>;

  // Get previous version (non-broken)
  getPreviousValidVersion(remoteName: string): Promise<BundleMetadata | null>;

  // Get currently active version's bundleUrl
  getCurrentBundleUrl(remoteName: string): string | null;

  // Update lastUsedAt
  updateLastUsedAt(remoteName: string): Promise<void>;

  // Get all metadata (for EjectionManager use)
  getAllMetadata(): BundleMetadata[];

  // Delete all caches for specified remoteName
  removeAll(remoteName: string): Promise<void>;

  // Clear all remote caches (called when host build changes)
  invalidateAllCaches(): Promise<void>;
}
```

### VersionPoller (metro-cache package)

```typescript
interface VersionPoller {
  register(remoteName: string, manifestUrl: string): void;
  unregister(remoteName: string): void;
  start(): void;
  stop(): void;
  on(event: 'newVersionAvailable', listener: (info: VersionUpdateInfo) => void): void;
  off(event: 'newVersionAvailable', listener: (info: VersionUpdateInfo) => void): void;
}

interface VersionUpdateInfo {
  remoteName: string;
  currentBundleUrl: string;    // Current active version's bundle URL
  newBundleUrl: string;        // New bundle's download URL (from manifest's publicPath + remoteEntry)
  newBundleHash: string;       // New version's bundleHash in manifest (for checksum verification)
  newBuildVersion: string;     // New version's buildVersion (human-readable)
  manifestUrl: string;
}
```

Version detection logic:
- Directly call native `fetch(manifestUrl)`, ensuring latest manifest from network each time
- Construct bundle URL from manifest (`publicPath + remoteEntry`), compare with `cacheManager.getCurrentBundleUrl()`
- Bundle URL different → new version available, emit `newVersionAvailable`
- Bundle URL same → no update needed

### EjectionManager (metro-cache package)

```typescript
interface EjectionManager {
  // Execute periodic cleanup check on app startup, also handle broken version retry
  runStartupCleanup(): Promise<void>;

  // Extend removeRemote, add disk cleanup
  ejectRemote(remoteName: string): Promise<void>;

  // Clean remotes exceeding unused days
  pruneUnusedRemotes(): Promise<void>;

  // Check if broken versions meet retry conditions (exceeds retryDelayHours since last retry and retryCount < maxRetryAttempts)
  // If eligible, reset status to active, allowing next startup to retry loading
  retryBrokenVersionsIfEligible(): Promise<void>;
}
```

## Error Handling Boundaries

### What We Cover

- ✅ Transmission corruption → Checksum verification
- ✅ Eval failure → errorLoadRemote → FallbackChain
- ✅ Shared negotiation failure → errorLoadRemote → FallbackChain

### What Application Layer Handles

- ❌ Runtime business logic errors → React ErrorBoundary
- ❌ Runtime crash detection → Optional enhancement (not in current spec scope)
- ❌ Bundled version fallback → Optional enhancement (not in current spec scope)

## Implementation Order

Recommended sequence: **c (persistent cache) → a (checksum verification) → b (version detection) → e (fallback chain) → d (hot update) → f (cleanup)**

All design decisions have been synchronized to documentation and are ready for implementation.
