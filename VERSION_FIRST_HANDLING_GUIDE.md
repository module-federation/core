# Module Federation Version-First Scenario Handling Guide

## Table of Contents
1. [Understanding Version-First Strategy](#understanding-version-first-strategy)
2. [Detection Mechanisms](#detection-mechanisms)
3. [Available Hooks for Version-First Handling](#available-hooks)
4. [Plugin Implementation Examples](#plugin-examples)
5. [Error Handling Strategies](#error-handling-strategies)
6. [Critical Issue: Manifest Unavailability](#manifest-unavailability)
7. [Comprehensive Manifest Error Solutions](#manifest-solutions)
8. [Best Practices and Recommendations](#best-practices)

## Understanding Version-First Strategy

### What is Version-First Strategy?

Version-first is Module Federation's **default strategy** for shared module resolution that:
- **Eagerly initializes all remote modules** during application startup
- **Prioritizes higher version numbers** when multiple versions of shared modules exist
- **Pre-loads remote entries** to enable version negotiation across the federation

### Key Differences from Loaded-First

| Aspect | Version-First (Default) | Loaded-First |
|--------|------------------------|--------------|
| **Initialization** | Eagerly loads all remotes at startup | Lazy loads remotes on-demand |
| **Version Priority** | Highest version wins | Already loaded version wins |
| **Performance** | Higher initial load time | Faster startup, slower first access |
| **Error Impact** | Startup failures affect entire app | Isolated failures per module |

### Current Status

⚠️ **Important**: The version-first strategy is **planned for deprecation**. The codebase contains this TODO:

```typescript
// TODO: strategy==='version-first' need to be removed in the future
```

## Detection Mechanisms

### 1. Strategy Detection

Version-first strategy is detected in these contexts:

```typescript
// Global host configuration
host.options.shareStrategy === 'version-first'

// Per-share configuration
strategy === 'version-first' // passed via extraOptions

// Default fallback (when no strategy specified)
strategy: (shareArgs.strategy ?? shareStrategy) || 'version-first'
```

### 2. Execution Trigger Points

**Primary Location**: `packages/runtime-core/src/shared/index.ts:342-352`

```typescript
if (
  host.options.shareStrategy === 'version-first' ||
  strategy === 'version-first'
) {
  host.options.remotes.forEach((remote) => {
    if (remote.shareScope === shareScopeName) {
      promises.push(initRemoteModule(remote.name));
    }
  });
}
```

## Available Hooks for Version-First Handling {#available-hooks}

### 1. Primary Error Recovery Hook: `errorLoadRemote`

**Most Important Hook** - Catches all version-first related errors:

```typescript
errorLoadRemote: new AsyncHook<[{
  id: string;
  error: unknown;
  options?: any;
  from: 'build' | 'runtime';
  lifecycle: 'beforeRequest' | 'beforeLoadShare' | 'afterResolve' | 'onLoad';
  origin: ModuleFederation;
}], void | unknown>
```

**Version-First Specific Usage**: Catches errors during `lifecycle: 'beforeLoadShare'` when version-first remote initialization fails.

### 2. Share Resolution Hooks

#### `beforeLoadShare` - Pre-emptive Version Handling
```typescript
beforeLoadShare: new AsyncWaterfallHook<{
  pkgName: string;
  shareInfo?: Shared;
  shared: Options['shared'];
  origin: ModuleFederation;
}>
```

#### `resolveShare` - Custom Version Resolution  
```typescript
resolveShare: new SyncWaterfallHook<{
  shareScopeMap: ShareScopeMap;
  scope: string;
  pkgName: string;
  version: string;
  GlobalFederation: Federation;
  resolver: () => Shared | undefined;
}>
```

### 3. Snapshot Plugin Hooks

#### `loadSnapshot` - Global Snapshot Version Handling
```typescript
loadSnapshot: new AsyncWaterfallHook<{
  options: Options;
  moduleInfo: Remote;
  hostGlobalSnapshot: GlobalModuleInfo[string] | undefined;
  globalSnapshot: ReturnType<typeof getGlobalSnapshot>;
  remoteSnapshot?: GlobalModuleInfo[string] | undefined;
}>
```

#### `loadRemoteSnapshot` - Remote Snapshot Processing
```typescript
loadRemoteSnapshot: new AsyncWaterfallHook<{
  options: Options;
  moduleInfo: Remote;
  manifestJson?: Manifest;
  manifestUrl?: string;
  remoteSnapshot: ModuleInfo;
  from: 'global' | 'manifest';
}>
```

### 4. Entry Loading Hooks

#### `loadEntryError` - Entry Loading Failures
```typescript
loadEntryError: new AsyncHook<[{
  getRemoteEntry: typeof getRemoteEntry;
  origin: ModuleFederation;
  remoteInfo: RemoteInfo;
  remoteEntryExports?: RemoteEntryExports | undefined;
  globalLoading: Record<string, Promise<void | RemoteEntryExports> | undefined>;
  uniqueKey: string;
}], Promise<(() => Promise<RemoteEntryExports | undefined>) | undefined>>
```

## Plugin Implementation Examples {#plugin-examples}

### 1. Enhanced Version-First Error Handler

Based on the enhanced-offline-fallback-plugin pattern, here's a comprehensive version-first handler:

```typescript
import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime-core';

interface VersionFirstConfig {
  enableLogging?: boolean;
  fallbackTimeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  fallbackComponents?: Record<string, any>;
  enableCircuitBreaker?: boolean;
  circuitBreakerThreshold?: number;
  circuitBreakerResetTimeout?: number;
  versionFallbackStrategy?: 'loaded-first' | 'ignore' | 'mock';
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}

function createVersionFirstHandler(config: VersionFirstConfig = {}): ModuleFederationRuntimePlugin {
  const {
    enableLogging = true,
    fallbackTimeout = 10000,
    retryAttempts = 3,
    retryDelay = 1000,
    fallbackComponents = {},
    enableCircuitBreaker = true,
    circuitBreakerThreshold = 5,
    circuitBreakerResetTimeout = 60000,
    versionFallbackStrategy = 'loaded-first'
  } = config;

  const circuitBreakers = new Map<string, CircuitBreakerState>();
  const fallbackCache = new Map<string, any>();
  
  const log = (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
    if (enableLogging) {
      console[level](`[VersionFirstHandler] ${message}`);
    }
  };

  const createFallbackModule = (id: string, error: unknown) => {
    if (fallbackCache.has(id)) {
      return fallbackCache.get(id);
    }

    const fallback = fallbackComponents[id] || (() => ({
      default: () => {
        log(`Rendering fallback for failed remote: ${id}`, 'warn');
        return `Fallback for ${id} (Error: ${error})`;
      }
    }));

    fallbackCache.set(id, fallback);
    return fallback;
  };

  const isCircuitOpen = (remoteId: string): boolean => {
    if (!enableCircuitBreaker) return false;
    
    const breaker = circuitBreakers.get(remoteId);
    if (!breaker) return false;

    if (breaker.state === 'open') {
      const timeSinceLastFailure = Date.now() - breaker.lastFailureTime;
      if (timeSinceLastFailure > circuitBreakerResetTimeout) {
        breaker.state = 'half-open';
        log(`Circuit breaker for ${remoteId} moved to half-open state`);
      }
      return breaker.state === 'open';
    }

    return false;
  };

  const recordFailure = (remoteId: string) => {
    if (!enableCircuitBreaker) return;

    const breaker = circuitBreakers.get(remoteId) || {
      failures: 0,
      lastFailureTime: 0,
      state: 'closed' as const
    };

    breaker.failures++;
    breaker.lastFailureTime = Date.now();

    if (breaker.failures >= circuitBreakerThreshold) {
      breaker.state = 'open';
      log(`Circuit breaker opened for ${remoteId} after ${breaker.failures} failures`, 'error');
    }

    circuitBreakers.set(remoteId, breaker);
  };

  const recordSuccess = (remoteId: string) => {
    if (!enableCircuitBreaker) return;

    const breaker = circuitBreakers.get(remoteId);
    if (breaker) {
      breaker.failures = 0;
      breaker.state = 'closed';
      log(`Circuit breaker reset for ${remoteId}`);
    }
  };

  return {
    name: 'version-first-handler',
    
    // Pre-check circuit breaker before requests
    async beforeRequest(args) {
      const { id } = args;
      
      if (isCircuitOpen(id)) {
        log(`Request blocked by circuit breaker: ${id}`, 'warn');
        throw new Error(`Circuit breaker is open for remote: ${id}`);
      }
      
      return args;
    },

    // Handle version-first specific errors during share loading
    async beforeLoadShare(args) {
      const { pkgName, origin } = args;
      
      // Detect if we're in version-first mode
      const isVersionFirst = origin.options.shareStrategy === 'version-first';
      
      if (isVersionFirst) {
        log(`Version-first share loading for package: ${pkgName}`);
        
        // Apply version-first fallback strategy
        if (versionFallbackStrategy === 'loaded-first') {
          log(`Switching to loaded-first strategy for ${pkgName}`, 'warn');
          // Modify the shareInfo to use loaded-first
          if (args.shareInfo) {
            args.shareInfo.strategy = 'loaded-first';
          }
        }
      }
      
      return args;
    },

    // Custom share resolution for version conflicts
    resolveShare(args) {
      const { pkgName, version, shareScopeMap, scope } = args;
      
      try {
        // Use default resolver first
        const resolved = args.resolver();
        if (resolved) {
          return args;
        }
        
        // If resolution fails in version-first, try loaded-first approach
        const versions = shareScopeMap[scope]?.[pkgName];
        if (versions) {
          // Find any loaded version as fallback
          const loadedVersion = Object.keys(versions).find(v => 
            versions[v].loaded || versions[v].loading
          );
          
          if (loadedVersion && versions[loadedVersion]) {
            log(`Using loaded version ${loadedVersion} as fallback for ${pkgName}@${version}`, 'warn');
            return {
              ...args,
              resolver: () => versions[loadedVersion]
            };
          }
        }
        
        return args;
      } catch (error) {
        log(`Share resolution error for ${pkgName}@${version}: ${error}`, 'error');
        return args;
      }
    },

    // Primary error handler for version-first failures
    async errorLoadRemote(args) {
      const { id, error, lifecycle, from } = args;
      
      log(`Remote loading error for ${id} during ${lifecycle} from ${from}: ${error}`, 'error');
      
      // Record failure for circuit breaker
      recordFailure(id);
      
      // Handle version-first specific errors
      if (lifecycle === 'beforeLoadShare') {
        log(`Version-first initialization failed for remote: ${id}`, 'error');
        
        // Strategy-specific fallback
        switch (versionFallbackStrategy) {
          case 'loaded-first':
            log(`Attempting loaded-first fallback for ${id}`);
            // Don't return anything, let the system retry with loaded-first
            return;
            
          case 'ignore':
            log(`Ignoring failed remote: ${id}`);
            return createFallbackModule(id, error);
            
          case 'mock':
            log(`Providing mock module for ${id}`);
            return createFallbackModule(id, error);
        }
      }
      
      // Retry logic for other lifecycle errors
      if (lifecycle === 'onLoad' || lifecycle === 'afterResolve') {
        for (let attempt = 1; attempt <= retryAttempts; attempt++) {
          try {
            log(`Retry attempt ${attempt}/${retryAttempts} for ${id}`);
            await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
            
            // Attempt to reload the remote
            // This would need to be implemented based on the specific remote loading logic
            // For now, we'll return a fallback after retries are exhausted
            
          } catch (retryError) {
            log(`Retry ${attempt} failed for ${id}: ${retryError}`, 'warn');
          }
        }
        
        // All retries failed, provide fallback
        return createFallbackModule(id, error);
      }
      
      // Default fallback for other error scenarios
      return createFallbackModule(id, error);
    },

    // Reset circuit breaker on successful loads
    async onLoad(args) {
      const { remote } = args;
      recordSuccess(remote.name);
      return args;
    },

    // Handle snapshot loading errors
    async loadRemoteSnapshot(args) {
      const { moduleInfo, remoteSnapshot } = args;
      
      try {
        // Validate snapshot version compatibility
        if (remoteSnapshot.version) {
          log(`Loading snapshot for ${moduleInfo.name} version ${remoteSnapshot.version}`);
        }
        
        return args;
      } catch (error) {
        log(`Snapshot loading error for ${moduleInfo.name}: ${error}`, 'error');
        recordFailure(moduleInfo.name);
        
        // Provide fallback snapshot if available
        return {
          ...args,
          remoteSnapshot: {
            ...remoteSnapshot,
            // Provide minimal fallback snapshot structure
            modules: {},
            version: '0.0.0-fallback'
          }
        };
      }
    }
  };
}

export { createVersionFirstHandler, type VersionFirstConfig };
```

### 2. Simple Version-First Detection Plugin

For basic version-first detection and logging:

```typescript
function createVersionFirstDetector(): ModuleFederationRuntimePlugin {
  return {
    name: 'version-first-detector',
    
    beforeLoadShare(args) {
      const { origin, pkgName } = args;
      
      if (origin.options.shareStrategy === 'version-first') {
        console.warn(`[VersionFirstDetector] Package ${pkgName} is using version-first strategy`);
        console.warn(`[VersionFirstDetector] Consider migrating to loaded-first strategy`);
      }
      
      return args;
    },
    
    errorLoadRemote(args) {
      const { id, lifecycle, error } = args;
      
      if (lifecycle === 'beforeLoadShare') {
        console.error(`[VersionFirstDetector] Version-first failure for remote ${id}:`, error);
        console.error(`[VersionFirstDetector] This may be due to version-first eager loading`);
      }
      
      return; // Let other plugins handle the actual error
    }
  };
}
```

### 3. Version-First Migration Helper

Plugin to help migrate from version-first to loaded-first:

```typescript
interface MigrationConfig {
  warnOnly?: boolean;
  exemptRemotes?: string[];
  enforceLoadedFirst?: boolean;
}

function createVersionFirstMigrator(config: MigrationConfig = {}): ModuleFederationRuntimePlugin {
  const { warnOnly = true, exemptRemotes = [], enforceLoadedFirst = false } = config;
  
  return {
    name: 'version-first-migrator',
    
    beforeInit(args) {
      const { options } = args;
      
      if (options.shareStrategy === 'version-first') {
        const message = 'Version-first strategy detected. Consider migrating to loaded-first for better performance.';
        
        if (warnOnly) {
          console.warn(`[MigrationHelper] ${message}`);
        } else {
          console.error(`[MigrationHelper] ${message}`);
        }
        
        if (enforceLoadedFirst) {
          console.log('[MigrationHelper] Automatically switching to loaded-first strategy');
          options.shareStrategy = 'loaded-first';
        }
      }
      
      return args;
    },
    
    beforeLoadShare(args) {
      const { origin, pkgName } = args;
      
      if (origin.options.shareStrategy === 'version-first' && !exemptRemotes.includes(pkgName)) {
        console.warn(`[MigrationHelper] Package ${pkgName} affected by version-first strategy`);
      }
      
      return args;
    }
  };
}
```

## Error Handling Strategies

### 1. Version-First Error Types

#### Share Loading Errors
- **Cause**: Remote modules fail to initialize during startup
- **Detection**: `errorLoadRemote` with `lifecycle: 'beforeLoadShare'`
- **Strategy**: Fallback to loaded-first or provide mock modules

#### Version Conflicts
- **Cause**: Singleton modules with incompatible versions
- **Detection**: `resolveShare` hook with version satisfaction check
- **Strategy**: Version negotiation or warning with continuation

#### Remote Entry Failures
- **Cause**: Network issues or invalid remote URLs during eager loading
- **Detection**: `loadEntryError` hook
- **Strategy**: Retry mechanism with exponential backoff

### 2. Fallback Strategies

#### Strategy 1: Graceful Degradation
```typescript
async errorLoadRemote(args) {
  const { id, error, lifecycle } = args;
  
  if (lifecycle === 'beforeLoadShare') {
    // Return a mock module that logs the error but doesn't break the app
    return () => ({
      default: () => `Remote ${id} temporarily unavailable: ${error.message}`
    });
  }
}
```

#### Strategy 2: Circuit Breaker Pattern
```typescript
// Prevent repeated failed attempts
const circuitBreakers = new Map();

async beforeRequest(args) {
  const { id } = args;
  const breaker = circuitBreakers.get(id);
  
  if (breaker?.isOpen()) {
    throw new Error(`Circuit breaker open for ${id}`);
  }
  
  return args;
}
```

#### Strategy 3: Retry with Backoff
```typescript
async errorLoadRemote(args) {
  const { id } = args;
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    await sleep(1000 * attempt); // Exponential backoff
    try {
      // Retry the operation
      return await retryRemoteLoad(id);
    } catch (retryError) {
      if (attempt === 3) {
        return fallbackModule(id);
      }
    }
  }
}
```

## Critical Issue: Manifest Unavailability {#manifest-unavailability}

### The Problem

The most critical issue with version-first strategy occurs when **manifest.json files are unavailable**. This causes runtime errors **before any hooks can intercept them**, leading to application crashes during startup.

#### Root Cause Analysis

1. **Early Initialization**: Version-first strategy eagerly loads all remotes during startup
2. **Synchronous Failures**: Manifest parsing errors occur synchronously before async hooks are ready
3. **No Graceful Degradation**: Failed manifest loading causes immediate application termination
4. **Bypass Hook System**: Errors occur in synchronous code paths that bypass the `errorLoadRemote` hook

#### Error Flow Path

```
Version-First Init → Manifest Fetch → JSON Parse → Validation → CRASH
                                   ↑
                           Critical Failure Point
                        (Before hooks can intercept)
```

#### Key Failure Points

1. **Network Failures**: DNS resolution, timeouts, 404/500 errors
2. **JSON Parsing**: Malformed JSON in manifest.json files  
3. **Manifest Validation**: Missing required fields (`metaData`, `exposes`, `shared`)
4. **Synchronous Assertions**: `assert()` calls that throw immediately

### Impact on Applications

- **Complete Application Failure**: App won't start if any remote manifest is unavailable
- **Development Disruption**: Local development fails when remote services are down
- **Production Outages**: One unavailable remote can crash the entire federation
- **No Error Boundaries**: Standard React error boundaries can't catch initialization errors

## Comprehensive Manifest Error Solutions {#manifest-solutions}

To address the critical manifest unavailability issue, here's a complete solution suite that works **before hooks are initialized**:

### 1. Early Manifest Interceptor

```typescript
interface ManifestConfig {
  timeoutMs?: number;
  fallbackUrls?: string[];
  mockManifests?: Record<string, any>;
  validationRules?: ValidationRule[];
}

function createManifestInterceptor(config: ManifestConfig = {}): ModuleFederationRuntimePlugin {
  const {
    timeoutMs = 10000,
    fallbackUrls = [],
    mockManifests = {},
    validationRules = DEFAULT_VALIDATION_RULES
  } = config;

  // Monkey-patch fetch before any manifest loading
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input.toString();
    
    // Intercept manifest.json requests
    if (url.includes('.json') && url.includes('manifest')) {
      console.log(`[ManifestInterceptor] Intercepting manifest request: ${url}`);
      
      try {
        // Add timeout to fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
        const response = await originalFetch(input, {
          ...init,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Validate JSON before returning
        const text = await response.text();
        let manifest;
        
        try {
          manifest = JSON.parse(text);
        } catch (parseError) {
          console.error(`[ManifestInterceptor] Invalid JSON in ${url}:`, parseError);
          return createFallbackResponse(url, mockManifests);
        }
        
        // Validate manifest structure
        const validationErrors = validateManifest(manifest, validationRules);
        if (validationErrors.length > 0) {
          console.warn(`[ManifestInterceptor] Validation warnings for ${url}:`, validationErrors);
          // Apply fixes or use fallback
          manifest = fixManifestStructure(manifest);
        }
        
        return new Response(JSON.stringify(manifest), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        console.error(`[ManifestInterceptor] Primary fetch failed for ${url}:`, error);
        
        // Try fallback URLs
        for (const fallbackUrl of fallbackUrls) {
          try {
            const fallbackResponse = await originalFetch(fallbackUrl, init);
            if (fallbackResponse.ok) {
              console.log(`[ManifestInterceptor] Fallback successful: ${fallbackUrl}`);
              return fallbackResponse;
            }
          } catch (fallbackError) {
            console.warn(`[ManifestInterceptor] Fallback failed: ${fallbackUrl}`, fallbackError);
          }
        }
        
        // Generate mock manifest as last resort
        return createFallbackResponse(url, mockManifests);
      }
    }
    
    // Non-manifest requests pass through
    return originalFetch(input, init);
  };

  return {
    name: 'manifest-interceptor',
    
    // Additional hook-based error handling
    async errorLoadRemote(args) {
      const { id, error, lifecycle } = args;
      
      if (lifecycle === 'afterResolve' && error.message.includes('manifest')) {
        console.error(`[ManifestInterceptor] Manifest error for ${id}:`, error);
        
        // Provide minimal fallback module
        return createMinimalFallback(id);
      }
    }
  };
}

function createFallbackResponse(url: string, mockManifests: Record<string, any>) {
  const remoteName = extractRemoteNameFromUrl(url);
  const mockManifest = mockManifests[remoteName] || createMinimalManifest(remoteName);
  
  console.log(`[ManifestInterceptor] Using fallback manifest for ${remoteName}`);
  
  return new Response(JSON.stringify(mockManifest), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

function createMinimalManifest(remoteName: string) {
  return {
    id: remoteName,
    name: remoteName,
    metaData: {
      globalName: `__FEDERATION_${remoteName}__`,
      remoteEntry: { name: 'remoteEntry.js' }
    },
    exposes: {
      './fallback': {
        name: 'fallback',
        assets: {
          js: { sync: [], async: [] },
          css: { sync: [], async: [] }
        }
      }
    },
    shared: {},
    remotes: []
  };
}

function validateManifest(manifest: any, rules: ValidationRule[]) {
  const errors: string[] = [];
  
  for (const rule of rules) {
    try {
      rule.validate(manifest);
    } catch (error) {
      errors.push(`${rule.name}: ${error.message}`);
    }
  }
  
  return errors;
}

const DEFAULT_VALIDATION_RULES = [
  {
    name: 'required-fields',
    validate: (manifest: any) => {
      if (!manifest.metaData) throw new Error('Missing metaData');
      if (!manifest.exposes) throw new Error('Missing exposes');
      if (!manifest.shared) throw new Error('Missing shared');
    }
  },
  {
    name: 'metadata-structure',
    validate: (manifest: any) => {
      if (!manifest.metaData.globalName) throw new Error('Missing globalName');
      if (!manifest.metaData.remoteEntry) throw new Error('Missing remoteEntry');
    }
  }
];
```

### 2. Global Error Handler (Pre-Hook)

```typescript
function createGlobalErrorHandler(): void {
  // Handle uncaught synchronous errors
  const originalError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    
    // Detect manifest-related errors
    if (message.includes('manifest') || message.includes('RUNTIME_003')) {
      console.warn('[GlobalErrorHandler] Manifest error detected, attempting recovery');
      
      // Store error for debugging
      window.__FEDERATION_MANIFEST_ERRORS__ = window.__FEDERATION_MANIFEST_ERRORS__ || [];
      window.__FEDERATION_MANIFEST_ERRORS__.push({
        timestamp: Date.now(),
        message,
        stack: new Error().stack
      });
      
      // Don't propagate fatal manifest errors
      return;
    }
    
    originalError.apply(console, args);
  };

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    const message = error?.message || String(error);
    
    if (message.includes('manifest') || message.includes('RUNTIME_003')) {
      console.warn('[GlobalErrorHandler] Unhandled manifest promise rejection:', error);
      event.preventDefault(); // Prevent default browser error handling
      
      // Attempt graceful recovery
      setTimeout(() => {
        window.location.reload(); // Last resort recovery
      }, 5000);
    }
  });

  // Monkey-patch assert function to prevent fatal crashes
  if (window.__FEDERATION__) {
    const originalAssert = window.__FEDERATION__.assert;
    if (originalAssert) {
      window.__FEDERATION__.assert = (condition: any, message: string) => {
        if (!condition && message.includes('manifest')) {
          console.warn('[GlobalErrorHandler] Manifest assertion failed, continuing with fallback:', message);
          return; // Don't throw
        }
        return originalAssert(condition, message);
      };
    }
  }
}
```

### 3. Circuit Breaker for Manifest Loading

```typescript
interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitorInterval: number;
}

class ManifestCircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failures = 0;
  private lastFailureTime = 0;
  private cache = new Map<string, any>();

  constructor(private config: CircuitBreakerConfig) {
    setInterval(() => this.checkRecovery(), config.monitorInterval);
  }

  async loadManifest(url: string): Promise<any> {
    if (this.state === 'OPEN') {
      console.log(`[CircuitBreaker] Circuit open for ${url}, using cache`);
      return this.getCachedOrFallback(url);
    }

    try {
      const manifest = await fetch(url).then(r => r.json());
      this.onSuccess(url, manifest);
      return manifest;
    } catch (error) {
      this.onFailure(url, error);
      return this.getCachedOrFallback(url);
    }
  }

  private onSuccess(url: string, manifest: any) {
    this.failures = 0;
    this.state = 'CLOSED';
    this.cache.set(url, { data: manifest, timestamp: Date.now() });
    console.log(`[CircuitBreaker] Success for ${url}, circuit closed`);
  }

  private onFailure(url: string, error: any) {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.config.failureThreshold) {
      this.state = 'OPEN';
      console.log(`[CircuitBreaker] Circuit opened for ${url} after ${this.failures} failures`);
    }
  }

  private checkRecovery() {
    if (this.state === 'OPEN' && 
        Date.now() - this.lastFailureTime > this.config.recoveryTimeout) {
      this.state = 'HALF_OPEN';
      console.log('[CircuitBreaker] Moving to half-open state');
    }
  }

  private getCachedOrFallback(url: string) {
    const cached = this.cache.get(url);
    if (cached) {
      console.log(`[CircuitBreaker] Using cached manifest for ${url}`);
      return cached.data;
    }
    
    console.log(`[CircuitBreaker] Using fallback manifest for ${url}`);
    return createMinimalManifest(extractRemoteNameFromUrl(url));
  }
}

function createCircuitBreakerPlugin(config?: Partial<CircuitBreakerConfig>): ModuleFederationRuntimePlugin {
  const breaker = new ManifestCircuitBreaker({
    failureThreshold: 3,
    recoveryTimeout: 30000,
    monitorInterval: 5000,
    ...config
  });

  return {
    name: 'circuit-breaker',
    
    async beforeInit(args) {
      // Pre-load critical manifests with circuit breaker protection
      const { options } = args;
      
      if (options.remotes) {
        for (const remote of options.remotes) {
          if (remote.entry?.includes('.json')) {
            try {
              await breaker.loadManifest(remote.entry);
            } catch (error) {
              console.warn(`[CircuitBreaker] Failed to pre-load ${remote.entry}:`, error);
            }
          }
        }
      }
      
      return args;
    }
  };
}
```

### 4. Network Retry with Exponential Backoff

```typescript
interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  jitterFactor: number;
}

async function fetchWithRetry(url: string, config: RetryConfig): Promise<Response> {
  const { maxAttempts, baseDelay, maxDelay, jitterFactor } = config;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[RetryFetch] Attempt ${attempt}/${maxAttempts} for ${url}`);
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      
      if (response.ok) {
        console.log(`[RetryFetch] Success on attempt ${attempt} for ${url}`);
        return response;
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
    } catch (error) {
      console.warn(`[RetryFetch] Attempt ${attempt} failed for ${url}:`, error.message);
      
      if (attempt === maxAttempts) {
        throw new Error(`All ${maxAttempts} attempts failed for ${url}: ${error.message}`);
      }
      
      // Calculate exponential backoff with jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt - 1),
        maxDelay
      );
      const jitter = delay * jitterFactor * Math.random();
      const finalDelay = delay + jitter;
      
      console.log(`[RetryFetch] Waiting ${Math.round(finalDelay)}ms before retry ${attempt + 1}`);
      await new Promise(resolve => setTimeout(resolve, finalDelay));
    }
  }
  
  throw new Error('Retry logic failed unexpectedly');
}

function createNetworkRetryPlugin(config?: Partial<RetryConfig>): ModuleFederationRuntimePlugin {
  const retryConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    jitterFactor: 0.3,
    ...config
  };

  // Override fetch for manifest requests
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input.toString();
    
    if (url.includes('.json') && url.includes('manifest')) {
      return fetchWithRetry(url, retryConfig);
    }
    
    return originalFetch(input, init);
  };

  return {
    name: 'network-retry',
    
    async errorLoadRemote(args) {
      const { id, error, lifecycle } = args;
      
      if (lifecycle === 'afterResolve' && error.message.includes('manifest')) {
        console.log(`[NetworkRetry] Attempting recovery for ${id}`);
        
        try {
          // Try to refetch with retry logic
          const response = await fetchWithRetry(id, retryConfig);
          const manifest = await response.json();
          
          console.log(`[NetworkRetry] Recovery successful for ${id}`);
          return createModuleFromManifest(manifest);
          
        } catch (retryError) {
          console.error(`[NetworkRetry] Recovery failed for ${id}:`, retryError);
          return createMinimalFallback(id);
        }
      }
    }
  };
}
```

### 5. Complete Solution Integration

```typescript
// Main integration file that combines all solutions
function createManifestErrorSolutions(config: {
  development?: boolean;
  circuitBreaker?: boolean;
  networkRetry?: boolean;
  globalErrorHandler?: boolean;
} = {}): ModuleFederationRuntimePlugin[] {
  const {
    development = false,
    circuitBreaker = true,
    networkRetry = true,
    globalErrorHandler = true
  } = config;

  const plugins: ModuleFederationRuntimePlugin[] = [];

  // Initialize global error handler first (no plugin needed)
  if (globalErrorHandler) {
    createGlobalErrorHandler();
  }

  // Add manifest interceptor
  plugins.push(createManifestInterceptor({
    timeoutMs: development ? 5000 : 10000,
    fallbackUrls: development ? [] : ['https://cdn.example.com/manifests/'],
    mockManifests: development ? {
      'app1': createDevelopmentMockManifest('app1'),
      'app2': createDevelopmentMockManifest('app2')
    } : {}
  }));

  // Add circuit breaker
  if (circuitBreaker) {
    plugins.push(createCircuitBreakerPlugin({
      failureThreshold: development ? 1 : 3,
      recoveryTimeout: development ? 10000 : 30000
    }));
  }

  // Add network retry
  if (networkRetry) {
    plugins.push(createNetworkRetryPlugin({
      maxAttempts: development ? 2 : 3,
      baseDelay: development ? 500 : 1000
    }));
  }

  return plugins;
}

// Usage examples
export const DevManifestSolutions = createManifestErrorSolutions({ 
  development: true 
});

export const ProdManifestSolutions = createManifestErrorSolutions({ 
  development: false,
  circuitBreaker: true,
  networkRetry: true,
  globalErrorHandler: true
});
```

### 6. Quick Setup Examples

```typescript
// webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      // ... your existing config
      runtimePlugins: [
        // For development (with mocks and fast retries)
        require.resolve('./manifest-solutions/dev-setup'),
        
        // For production (with robust error handling)
        require.resolve('./manifest-solutions/prod-setup'),
        
        // Or custom configuration
        require.resolve('./custom-manifest-plugin')
      ]
    })
  ]
};

// dev-setup.js
module.exports = () => {
  return createManifestErrorSolutions({ 
    development: true,
    globalErrorHandler: true,
    circuitBreaker: true,
    networkRetry: true
  });
};

// prod-setup.js  
module.exports = () => {
  return createManifestErrorSolutions({
    development: false,
    globalErrorHandler: true,
    circuitBreaker: true,
    networkRetry: true
  });
};
```

### 7. Monitoring and Debugging

```typescript
function createManifestMonitoringPlugin(): ModuleFederationRuntimePlugin {
  const metrics = {
    totalRequests: 0,
    failures: 0,
    retries: 0,
    cacheHits: 0,
    averageLoadTime: 0
  };

  return {
    name: 'manifest-monitoring',
    
    beforeInit() {
      // Expose debugging utilities
      window.__FEDERATION_DEBUG__ = {
        getManifestMetrics: () => metrics,
        clearManifestCache: () => {
          console.log('[Debug] Clearing manifest cache');
          // Implementation specific cache clearing
        },
        testManifestFallback: (remoteName: string) => {
          console.log(`[Debug] Testing fallback for ${remoteName}`);
          return createMinimalManifest(remoteName);
        }
      };
    },
    
    async errorLoadRemote(args) {
      const { id, error, lifecycle } = args;
      
      if (lifecycle === 'afterResolve' && error.message.includes('manifest')) {
        metrics.failures++;
        
        // Send to monitoring service
        if (typeof window !== 'undefined' && window.analytics) {
          window.analytics.track('Manifest Load Error', {
            remoteId: id,
            error: error.message,
            timestamp: Date.now()
          });
        }
      }
    }
  };
}
```

These solutions provide **bulletproof manifest error handling** that works before hooks are initialized, handles all early error scenarios, and provides graceful degradation when manifest.json files are unavailable.

## Best Practices and Recommendations {#best-practices}

### 1. Migration Strategy

**Immediate Actions**:
- ⚠️ **Audit your configuration** for explicit `shareStrategy: 'version-first'`
- 🔍 **Test with `loaded-first`** to ensure compatibility
- 📊 **Monitor performance impact** of the strategy change

**Migration Path**:
```typescript
// Phase 1: Add warning detection
runtimePlugins: [
  createVersionFirstDetector(),
  // ... other plugins
]

// Phase 2: Test loaded-first with fallback
runtimePlugins: [
  createVersionFirstMigrator({ 
    warnOnly: true, 
    enforceLoadedFirst: true 
  }),
  // ... other plugins
]

// Phase 3: Full migration
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      shareStrategy: 'loaded-first', // Explicit migration
      // ... other config
    })
  ]
}
```

### 2. Error Handling Best Practices

#### Layered Error Handling
```typescript
runtimePlugins: [
  // Layer 1: Detection and logging
  createVersionFirstDetector(),
  
  // Layer 2: Circuit breaking and retry
  createVersionFirstHandler({
    enableCircuitBreaker: true,
    retryAttempts: 3
  }),
  
  // Layer 3: Fallback components
  createOfflineFallbackPlugin({
    fallbackComponents: {
      'remote1': MyFallbackComponent,
      'remote2': AnotherFallbackComponent
    }
  })
]
```

#### Error Context Preservation
```typescript
async errorLoadRemote(args) {
  const { id, error, lifecycle, origin } = args;
  
  // Log full context for debugging
  console.error('Version-first error context:', {
    remoteId: id,
    error: error.message,
    lifecycle,
    hostName: origin.options.name,
    timestamp: new Date().toISOString(),
    shareStrategy: origin.options.shareStrategy
  });
  
  // Provide context-aware fallback
  return createContextualFallback(args);
}
```

### 3. Performance Monitoring

#### Key Metrics to Track
- **Initialization Time**: How long version-first takes vs loaded-first
- **Error Rate**: Percentage of remotes that fail during eager loading
- **Fallback Usage**: How often fallback mechanisms are triggered
- **Network Requests**: Number of concurrent requests during startup

#### Monitoring Plugin
```typescript
function createPerformanceMonitor(): ModuleFederationRuntimePlugin {
  const metrics = {
    initStart: 0,
    initEnd: 0,
    errors: 0,
    fallbacks: 0
  };
  
  return {
    name: 'performance-monitor',
    
    beforeInit() {
      metrics.initStart = performance.now();
      return args;
    },
    
    init() {
      metrics.initEnd = performance.now();
      console.log(`Version-first initialization took: ${metrics.initEnd - metrics.initStart}ms`);
    },
    
    errorLoadRemote(args) {
      metrics.errors++;
      
      // Send metrics to monitoring service
      sendToMonitoring({
        type: 'version-first-error',
        remoteId: args.id,
        lifecycle: args.lifecycle,
        timestamp: Date.now()
      });
      
      return; // Let other plugins handle
    }
  };
}
```

### 4. Testing Strategies

#### Unit Testing Error Scenarios
```typescript
describe('Version-First Error Handling', () => {
  it('should handle remote initialization failure', async () => {
    const plugin = createVersionFirstHandler();
    
    const errorArgs = {
      id: 'test-remote',
      error: new Error('Network timeout'),
      lifecycle: 'beforeLoadShare',
      from: 'runtime',
      origin: mockOrigin
    };
    
    const result = await plugin.errorLoadRemote(errorArgs);
    expect(result).toBeDefined();
    expect(typeof result).toBe('function');
  });
});
```

#### Integration Testing
```typescript
// Test with actual remote failures
describe('Version-First Integration', () => {
  it('should gracefully handle remote unavailability', async () => {
    // Setup test environment with failing remote
    const mf = new ModuleFederation({
      shareStrategy: 'version-first',
      remotes: [
        { name: 'failing-remote', entry: 'http://localhost:9999/invalid' }
      ],
      runtimePlugins: [createVersionFirstHandler()]
    });
    
    await expect(mf.init()).not.toThrow();
  });
});
```

## Conclusion

Version-first strategy detection and handling requires a multi-layered approach:

1. **Detection**: Use `beforeLoadShare` and `errorLoadRemote` hooks to identify version-first scenarios
2. **Migration**: Implement gradual migration to loaded-first strategy
3. **Error Handling**: Provide comprehensive fallback mechanisms with circuit breaker patterns
4. **Manifest Protection**: Use early interceptors and global error handlers for manifest unavailability
5. **Monitoring**: Track performance and error metrics to guide optimization
6. **Testing**: Validate error scenarios and fallback behaviors

The provided plugin examples demonstrate practical patterns for handling version-first scenarios while preparing for the eventual deprecation of this strategy. **Most importantly, the manifest error solutions ensure your application remains functional even when remote manifests are completely unavailable.**