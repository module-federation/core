# Module Federation Advanced Production Hardening

Use this document for production warnings, performance, security, memory, configuration, compatibility, and launch checklist material. [advanced-topics.md](./advanced-topics.md) is the index for advanced production material.

## Critical Production Warnings

### 🚨 MEMORY LEAKS - WILL CRASH YOUR APP

```typescript
// ❌ MEMORY LEAK - Module cache grows unbounded
class ModuleFederation {
  moduleCache: Map<string, Module> = new Map(); // NEVER CLEARED!

  async loadRemote<T = any>(id: string): Promise<T | null> {
    const cachedModule = this.moduleCache.get(id);
    if (cachedModule) return cachedModule as T;

    const module = await this.remoteHandler.loadRemote<T>(id);
    if (module) {
      this.moduleCache.set(id, module as any); // LEAK: Never evicted!
    }
    return module;
  }
}

// ✅ PRODUCTION FIX - Implement cache eviction
class ProductionModuleFederation {
  moduleCache: Map<string, { module: Module; timestamp: number }> = new Map();
  private readonly MAX_CACHE_SIZE = 100;
  private readonly MAX_CACHE_AGE_MS = 3600000; // 1 hour

  async loadRemote<T = any>(id: string): Promise<T | null> {
    this.evictStaleEntries();

    const cached = this.moduleCache.get(id);
    if (cached && Date.now() - cached.timestamp < this.MAX_CACHE_AGE_MS) {
      return cached.module as T;
    }

    const module = await this.remoteHandler.loadRemote<T>(id);
    if (module) {
      this.addToCache(id, module as any);
    }
    return module;
  }

  private evictStaleEntries() {
    // Remove expired entries
    for (const [key, value] of this.moduleCache.entries()) {
      if (Date.now() - value.timestamp > this.MAX_CACHE_AGE_MS) {
        this.moduleCache.delete(key);
      }
    }

    // Implement LRU eviction if cache is too large
    if (this.moduleCache.size > this.MAX_CACHE_SIZE) {
      const sortedEntries = Array.from(this.moduleCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);

      const entriesToRemove = sortedEntries.slice(0, this.moduleCache.size - this.MAX_CACHE_SIZE);
      entriesToRemove.forEach(([key]) => this.moduleCache.delete(key));
    }
  }

  private addToCache(id: string, module: Module) {
    this.moduleCache.set(id, { module, timestamp: Date.now() });
  }
}
```

### 🚨 SECURITY VULNERABILITIES

```typescript
// ❌ SECURITY VULNERABILITY - XSS through remote loading
const vulnerablePlugin: ModuleFederationRuntimePlugin = {
  name: 'VulnerablePlugin',

  fetch(url, options) {
    // NEVER DO THIS - allows arbitrary code execution
    return fetch(url, options); // No validation!
  }
};

// ✅ PRODUCTION FIX - Validate and sanitize ALL remote URLs
const securePlugin: ModuleFederationRuntimePlugin = {
  name: 'SecurePlugin',

  fetch(url, options) {
    const allowedHosts = [
      'https://cdn.example.com',
      'https://modules.example.com'
    ];

    const urlObj = new URL(url);

    // Validate host
    if (!allowedHosts.some(host => url.startsWith(host))) {
      throw new Error(`Unauthorized remote host: ${urlObj.host}`);
    }

    // Validate protocol
    if (urlObj.protocol !== 'https:') {
      throw new Error('Only HTTPS remotes are allowed');
    }

    // Add security headers
    const secureOptions = {
      ...options,
      headers: {
        ...options?.headers,
        'X-Requested-With': 'ModuleFederation'
      },
      credentials: 'omit' // Never send cookies to remotes
    };

    return fetch(url, secureOptions);
  }
};
```

### 🚨 CORS ERRORS ARE MASKED AS GENERIC NETWORK ERRORS

```typescript
// ❌ NOT ENOUGH ON ITS OWN FOR CORS ERRORS
const brokenErrorHandler: ModuleFederationRuntimePlugin = {
  name: 'BrokenErrorHandler',

  errorLoadRemote(args) {
    // CORS failures reach this hook only as a generic ScriptNetworkError
    // (network failure, 404, CORS, etc.) - the browser masks the cause,
    // so blind retries against a broken remote keep failing.
    return () => 'Fallback';
  }
};

// ✅ PRODUCTION FIX - Implement circuit breaker pattern
class CircuitBreaker {
  private failures = new Map<string, number>();
  private lastFailureTime = new Map<string, number>();
  private circuitOpen = new Map<string, boolean>();

  private readonly FAILURE_THRESHOLD = 3;
  private readonly RESET_TIMEOUT_MS = 60000; // 1 minute

  async tryLoad<T>(
    loader: () => Promise<T>,
    fallback: () => T,
    key: string
  ): Promise<T> {
    // Check if circuit is open
    if (this.isCircuitOpen(key)) {
      console.warn(`Circuit breaker open for ${key}, using fallback`);
      return fallback();
    }

    try {
      const result = await loader();
      this.onSuccess(key);
      return result;
    } catch (error) {
      this.onFailure(key);

      if (this.isCircuitOpen(key)) {
        console.error(`Circuit breaker triggered for ${key} after ${this.failures.get(key)} failures`);
      }

      return fallback();
    }
  }

  private isCircuitOpen(key: string): boolean {
    const isOpen = this.circuitOpen.get(key) || false;
    const lastFailure = this.lastFailureTime.get(key) || 0;

    // Auto-reset circuit after timeout
    if (isOpen && Date.now() - lastFailure > this.RESET_TIMEOUT_MS) {
      this.reset(key);
      return false;
    }

    return isOpen;
  }

  private onSuccess(key: string) {
    this.reset(key);
  }

  private onFailure(key: string) {
    const failures = (this.failures.get(key) || 0) + 1;
    this.failures.set(key, failures);
    this.lastFailureTime.set(key, Date.now());

    if (failures >= this.FAILURE_THRESHOLD) {
      this.circuitOpen.set(key, true);
    }
  }

  private reset(key: string) {
    this.failures.delete(key);
    this.lastFailureTime.delete(key);
    this.circuitOpen.delete(key);
  }
}

// Usage with circuit breaker
const circuitBreaker = new CircuitBreaker();

async function loadWithCircuitBreaker(id: string) {
  return circuitBreaker.tryLoad(
    () => federationInstance.loadRemote(id),
    () => ({ default: () => 'Fallback Component' }),
    id
  );
}
```

### 🚨 PRELOADING CAN BE SLOWER THAN ON-DEMAND

```typescript
// ❌ NAIVE PRELOADING - Makes app SLOWER
await federationInstance.preloadRemote([
  { nameOrAlias: 'app1' },
  { nameOrAlias: 'app2' },
  { nameOrAlias: 'app3' },
  { nameOrAlias: 'app4' },
  { nameOrAlias: 'app5' }
]); // Blocks for ALL remotes!

// ✅ PRODUCTION FIX - Strategic preloading with priorities
class StrategicPreloader {
  private preloadQueue: Array<{ remote: string; priority: number }> = [];
  private isPreloading = false;

  async preloadStrategic(remotes: Array<{ name: string; priority: 'critical' | 'high' | 'low' }>) {
    // Sort by priority
    const priorityMap = { critical: 0, high: 1, low: 2 };
    const sorted = remotes.sort((a, b) => priorityMap[a.priority] - priorityMap[b.priority]);

    // Preload critical immediately
    const critical = sorted.filter(r => r.priority === 'critical');
    if (critical.length > 0) {
      await Promise.all(critical.map(r =>
        federationInstance.preloadRemote([{ nameOrAlias: r.name }])
      ));
    }

    // Queue others for idle time
    const others = sorted.filter(r => r.priority !== 'critical');
    this.queueForIdlePreload(others);
  }

  private queueForIdlePreload(remotes: Array<{ name: string; priority: string }>) {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.preloadNext(remotes);
      }, { timeout: 5000 });
    } else {
      // Fallback for Safari
      setTimeout(() => this.preloadNext(remotes), 1000);
    }
  }

  private async preloadNext(remotes: Array<{ name: string; priority: string }>) {
    if (this.isPreloading || remotes.length === 0) return;

    this.isPreloading = true;
    const next = remotes.shift()!;

    try {
      await federationInstance.preloadRemote([{ nameOrAlias: next.name }]);
    } catch (error) {
      console.warn(`Preload failed for ${next.name}:`, error);
    }

    this.isPreloading = false;

    if (remotes.length > 0) {
      this.queueForIdlePreload(remotes);
    }
  }
}

// Usage
const preloader = new StrategicPreloader();
await preloader.preloadStrategic([
  { name: 'shell', priority: 'critical' }, // Blocks
  { name: 'analytics', priority: 'low' },   // Idle time
  { name: 'chat', priority: 'high' }        // Idle time, but before 'low'
]);
```

## Performance Optimization

⚠️ **CRITICAL**: The default Module Federation setup can have significant performance and memory implications on constrained devices. Measure the relevant app/package fixture and implement production cache, preload, and cleanup policies before launch.

### Mobile Performance Crisis

```typescript
// Example shape for device-class measurement
const mobilePerformance = {
  modernMobile: {
    moduleLoad: 'measure-in-fixture',
    memoryUsage: 'measure-in-fixture',
    stability: 'track-session-errors'
  },
  androidMidRange: {
    moduleLoad: 'measure-in-fixture',
    memoryUsage: 'measure-in-fixture',
    stability: 'track-session-errors'
  },
  older_devices: {
    moduleLoad: 'measure-in-fixture',
    memoryUsage: 'measure-in-fixture',
    stability: 'track-session-errors'
  }
};

// ✅ MOBILE OPTIMIZATION STRATEGY
class MobileOptimizedFederation {
  private isMobile = /Mobile|Android/i.test(navigator.userAgent);
  private deviceMemory = (navigator as any).deviceMemory || 4; // GB

  async loadRemote(id: string) {
    if (this.isMobile && this.deviceMemory < 4) {
      // Use lite versions for low-end devices
      const liteId = id.replace('/full/', '/lite/');
      return this.loadWithTimeout(liteId, 3000);
    }

    return this.loadWithTimeout(id, 5000);
  }

  private async loadWithTimeout(id: string, timeout: number) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const module = await federationInstance.loadRemote(id, {
        loadFactory: true,
        from: 'runtime'
      });
      clearTimeout(timeoutId);
      return module;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error(`Module ${id} timed out after ${timeout}ms`);
        return this.getLiteVersion(id);
      }
      throw error;
    }
  }
}
```

### Module Caching

⚠️ **MEMORY LEAK**: The default module cache grows unbounded and NEVER releases memory!

```typescript
// ❌ DEFAULT IMPLEMENTATION - MEMORY LEAK
class ModuleFederation {
  moduleCache: Map<string, Module> = new Map(); // NEVER CLEARED!

  // Real loadRemote with caching
  async loadRemote<T = any>(
    id: string,
    options?: { loadFactory?: boolean; from?: CallFrom }
  ): Promise<T | null> {
    // Check module cache first
    const cachedModule = this.moduleCache.get(id);
    if (cachedModule) {
      return cachedModule as T;
    }

    // Load and cache the module
    const module = await this.remoteHandler.loadRemote<T>(id, options);
    if (module) {
      this.moduleCache.set(id, module as any);
    }

    return module;
  }
}

// ✅ PRODUCTION FIX - See memory leak prevention section
```

### Share Scope Optimization

```typescript
// Real shared module optimization patterns
const shareOptimizationPlugin: ModuleFederationRuntimePlugin = {
  name: 'ShareOptimizationPlugin',

  beforeLoadShare(args) {
    const { pkgName, shareInfo, shared, origin } = args;

    // Log share scope usage for analysis
    console.log(`Requesting shared: ${pkgName}`, {
      version: shareInfo?.version,
      singleton: shareInfo?.shareConfig?.singleton,
      eager: shareInfo?.shareConfig?.eager
    });

    return args;
  },

  afterResolve(args) {
    const { id, pkgNameOrAlias, remote } = args;

    // Track resolution performance
    performance.mark(`resolve-end-${id}`);

    return args;
  }
};
```

### Asset Preloading Optimization

```typescript
// Real asset optimization from generate-preload-assets plugin
const generatePreloadAssetsPlugin = (): ModuleFederationRuntimePlugin => {
  return {
    name: 'generate-preload-assets-plugin',

    generatePreloadAssets(args) {
      const { remoteInfo, remoteSnapshot } = args;

      // Filter assets based on resource category
      const allAssets = remoteSnapshot.modules || [];
      const syncAssets = allAssets.filter(asset => !asset.async);

      return {
        cssAssets: syncAssets.filter(asset => asset.path.endsWith('.css')),
        jsAssetsWithoutEntry: syncAssets.filter(asset =>
          asset.path.endsWith('.js') && !asset.isEntry
        ),
        entryAssets: syncAssets.filter(asset => asset.isEntry)
      };
    }
  };
};
```

### Performance Monitoring

```typescript
// Real performance monitoring patterns
const performanceMonitorPlugin: ModuleFederationRuntimePlugin = {
  name: 'PerformanceMonitorPlugin',

  beforeRequest(args) {
    const { id } = args;
    // Start timing
    performance.mark(`federation-start-${id}`);
    return args;
  },

  onLoad(args) {
    const { id } = args;
    // End timing
    performance.mark(`federation-end-${id}`);
    performance.measure(
      `federation-load-${id}`,
      `federation-start-${id}`,
      `federation-end-${id}`
    );

    const measure = performance.getEntriesByName(`federation-load-${id}`)[0];
    if (measure.duration > 1000) {
      console.warn(`Slow module load: ${id} took ${measure.duration}ms`);
    }

    return args;
  },

  errorLoadRemote(args) {
    const { id, error, lifecycle } = args;

    // Track errors for monitoring
    console.error(`Module load error: ${id}`, {
      error: error.message,
      lifecycle,
      timestamp: Date.now()
    });

    return null;
  }
};
```

## Security Requirements

### Content Security Policy (CSP)

```typescript
// ✅ REQUIRED CSP Headers for Module Federation
const requiredCSP = {
  'default-src': "'self'",
  'script-src': "'self' https://cdn.example.com https://modules.example.com",
  'connect-src': "'self' https://api.example.com",
  'style-src': "'self' 'unsafe-inline'", // Required for runtime styles
  'object-src': "'none'",
  'base-uri': "'self'",
  'frame-ancestors': "'none'"
};

// Implement in your server
app.use((req, res, next) => {
  const csp = Object.entries(requiredCSP)
    .map(([key, value]) => `${key} ${value}`)
    .join('; ');

  res.setHeader('Content-Security-Policy', csp);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

### Input Sanitization

```typescript
// ✅ REQUIRED: Sanitize ALL dynamic module IDs
function sanitizeModuleId(id: string): string {
  // Whitelist allowed characters
  const sanitized = id.replace(/[^a-zA-Z0-9\-_@/]/g, '');

  // Prevent directory traversal
  if (sanitized.includes('..') || sanitized.includes('//')) {
    throw new Error('Invalid module ID');
  }

  // Limit length to prevent DoS
  if (sanitized.length > 200) {
    throw new Error('Module ID too long');
  }

  return sanitized;
}

// Use in all dynamic loads
async function loadDynamicModule(userInput: string) {
  const safeId = sanitizeModuleId(userInput);
  return federationInstance.loadRemote(safeId);
}
```

## Memory Leak Prevention

### Complete Memory Management Strategy

```typescript
class ProductionFederationHost {
  private moduleCache = new Map<string, CachedModule>();
  private shareScopes = new Map<string, ShareScope>();
  private listeners = new Map<string, Set<Function>>();
  private intervals = new Set<NodeJS.Timer>();

  constructor() {
    // Setup automatic cleanup
    const cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 300000); // Every 5 minutes

    this.intervals.add(cleanupInterval);

    // Monitor memory usage
    if (performance.memory) {
      setInterval(() => {
        const usage = performance.memory.usedJSHeapSize / 1048576;
        if (usage > 500) { // 500MB threshold
          console.warn(`High memory usage: ${usage.toFixed(2)}MB`);
          this.emergencyCleanup();
        }
      }, 60000);
    }
  }

  private performCleanup() {
    // Clean module cache
    const now = Date.now();
    for (const [id, cached] of this.moduleCache.entries()) {
      if (now - cached.lastAccess > 3600000) { // 1 hour
        this.moduleCache.delete(id);
        console.log(`Evicted stale module: ${id}`);
      }
    }

    // Clean share scopes
    for (const [scope, data] of this.shareScopes.entries()) {
      if (data.modules.size === 0) {
        this.shareScopes.delete(scope);
      }
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }

  destroy() {
    // Clean up everything
    this.moduleCache.clear();
    this.shareScopes.clear();
    this.listeners.clear();

    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();

    // Remove this instance from the global registry
    const instances = globalThis.__FEDERATION__?.__INSTANCES__;
    if (instances) {
      const index = instances.findIndex((ins) => ins.name === this.name);
      if (index !== -1) {
        instances.splice(index, 1);
      }
    }
  }
}
```

## Production Configuration

### Complete Production-Ready Setup

```typescript
// ✅ PRODUCTION CONFIGURATION
const productionConfig = {
  name: 'production-app',

  // Security
  remotes: [
    {
      name: 'remote-app',
      entry: 'https://cdn.example.com/remote/remoteEntry.js'
    }
  ],

  // Performance
  shared: {
    react: {
      singleton: true,
      eager: false, // Lazy load in production
      requiredVersion: '^18.0.0',
      strictVersion: true // Prevent version mismatches
    },
    'react-dom': {
      singleton: true,
      eager: false,
      requiredVersion: '^18.0.0',
      strictVersion: true
    }
  },

  // Plugins
  plugins: [
    // Combined production plugin
    {
      name: 'ProductionPlugin',

      // URL validation
      fetch(url, options) {
        const allowed = ['https://cdn.example.com'];
        if (!allowed.some(host => url.startsWith(host))) {
          throw new Error('Unauthorized host');
        }

        return fetch(url, {
          ...options,
          credentials: 'omit',
          headers: {
            ...options?.headers,
            'X-Requested-With': 'ModuleFederation'
          }
        });
      },

      // Error handling with circuit breaker
      errorLoadRemote(args) {
        recordError(args);

        if (shouldOpenCircuit(args.id)) {
          return () => ({ default: () => 'Service Unavailable' });
        }

        return null;
      },

      // Performance monitoring
      onLoad(args) {
        recordMetric('module_load', {
          module: args.id,
          duration: performance.now() - startTime
        });

        return args;
      }
    }
  ]
};
```

## Version Compatibility Matrix

### Breaking Changes Between Versions

```typescript
const compatibilityMatrix = {
  'v1.0.0 -> v1.1.0': {
    breaking: false,
    changes: ['Added new hooks']
  },
  'v1.1.0 -> v2.0.0': {
    breaking: true,
    changes: [
      'Changed plugin interface',
      'Removed deprecated APIs',
      'Modified share scope structure'
    ],
    migration: `
      // v1.x
      plugin.onModuleLoad(args)

      // v2.x
      plugin.onLoad(args)
    `
  },
  'v2.0.0 -> v3.0.0': {
    breaking: true,
    changes: [
      'Async plugin initialization',
      'New error handling model',
      'Changed remote configuration format'
    ],
    migration: `
      // v2.x
      remotes: ['app@http://example.com/remoteEntry.js']

      // v3.x
      remotes: [{
        name: 'app',
        entry: 'http://example.com/remoteEntry.js'
      }]
    `
  }
};

// Version compatibility checker
function checkCompatibility(hostVersion: string, remoteVersion: string): boolean {
  const hostMajor = parseInt(hostVersion.split('.')[0]);
  const remoteMajor = parseInt(remoteVersion.split('.')[0]);

  if (hostMajor !== remoteMajor) {
    console.error(`Incompatible versions: host ${hostVersion}, remote ${remoteVersion}`);
    return false;
  }

  return true;
}
```

## Production Checklist

### Before Going to Production

- [ ] Implement cache eviction strategy
- [ ] Add memory monitoring and limits
- [ ] Configure CSP headers
- [ ] Validate all remote URLs
- [ ] Implement circuit breaker pattern
- [ ] Add timeout to all remote loads
- [ ] Use strategic preloading (not naive)
- [ ] Test on low-end mobile devices
- [ ] Monitor plugin performance impact
- [ ] Implement proper error boundaries
- [ ] Add health checks for remotes
- [ ] Configure monitoring and alerting
- [ ] Test version compatibility
- [ ] Document fallback strategies
- [ ] Load test with expected traffic

Treat these hardening checks as release gates for production federation surfaces, especially when remotes cross deployment or trust boundaries.
