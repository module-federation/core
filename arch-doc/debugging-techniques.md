# Module Federation Debugging Techniques

This document owns runtime, network, share-scope, and common issue investigation patterns. Use [testing-debugging-guide.md](./testing-debugging-guide.md) as the index for the full testing and debugging doc set.

## Debugging Techniques

### Runtime Debugging Tools and Techniques

#### 1. Federation State Inspection

```javascript
// Debug utilities for federation state
window.debugFederation = {
  // Inspect share scopes
  inspectShareScopes() {
    console.group('🔍 Share Scopes');
    Object.keys(window.__webpack_share_scopes__ || {}).forEach(scopeName => {
      console.group(`Scope: ${scopeName}`);
      const scope = window.__webpack_share_scopes__[scopeName];
      Object.keys(scope).forEach(moduleName => {
        console.group(`Module: ${moduleName}`);
        Object.keys(scope[moduleName]).forEach(version => {
          const versionInfo = scope[moduleName][version];
          console.log(`Version ${version}:`, {
            loaded: versionInfo.loaded,
            eager: versionInfo.eager,
            from: versionInfo.from
          });
        });
        console.groupEnd();
      });
      console.groupEnd();
    });
    console.groupEnd();
  },

  // Inspect loaded remotes
  inspectRemotes() {
    console.group('📦 Loaded Remotes');
    Object.keys(window).forEach(key => {
      if (window[key] && typeof window[key].get === 'function') {
        console.log(`Remote: ${key}`, window[key]);
      }
    });
    console.groupEnd();
  },

  // Monitor federation loading
  monitorLoading() {
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0];
      if (typeof url === 'string' && url.includes('remoteEntry.js')) {
        console.log('🚀 Loading remote entry:', url);
      }
      return originalFetch.apply(this, args);
    };
  },

  // Check version conflicts
  checkVersionConflicts() {
    const conflicts = [];
    const shareScopes = window.__webpack_share_scopes__ || {};

    Object.keys(shareScopes).forEach(scopeName => {
      const scope = shareScopes[scopeName];
      Object.keys(scope).forEach(moduleName => {
        const versions = Object.keys(scope[moduleName]);
        if (versions.length > 1) {
          conflicts.push({
            scope: scopeName,
            module: moduleName,
            versions: versions
          });
        }
      });
    });

    if (conflicts.length > 0) {
      console.warn('⚠️ Version conflicts detected:', conflicts);
    } else {
      console.log('✅ No version conflicts found');
    }

    return conflicts;
  }
};
```

#### 2. Runtime Hook Debugging

```javascript
// Debug federation hooks
const originalInit = window.__webpack_init_sharing__;
window.__webpack_init_sharing__ = function(shareScope) {
  console.log('🔄 Initializing share scope:', shareScope);
  return originalInit?.call(this, shareScope);
};

// Monitor remote loading
const RemoteLoadingMonitor = {
  loadedRemotes: new Set(),
  failedRemotes: new Set(),

  wrapRemoteLoading() {
    const originalCreateScript = document.createElement;
    document.createElement = function(tagName) {
      const element = originalCreateScript.call(this, tagName);

      if (tagName.toLowerCase() === 'script') {
        element.addEventListener('load', (event) => {
          const src = event.target.src;
          if (src && src.includes('remoteEntry.js')) {
            console.log('✅ Remote loaded successfully:', src);
            RemoteLoadingMonitor.loadedRemotes.add(src);
          }
        });

        element.addEventListener('error', (event) => {
          const src = event.target.src;
          if (src && src.includes('remoteEntry.js')) {
            console.error('❌ Remote failed to load:', src);
            RemoteLoadingMonitor.failedRemotes.add(src);
          }
        });
      }

      return element;
    };
  },

  getStatus() {
    return {
      loaded: Array.from(this.loadedRemotes),
      failed: Array.from(this.failedRemotes)
    };
  }
};

RemoteLoadingMonitor.wrapRemoteLoading();
```

### Network Debugging for Remote Loading

#### 1. Network Request Monitoring

```javascript
// Network debugging utilities
class FederationNetworkDebugger {
  constructor() {
    this.requests = [];
    this.setupInterception();
  }

  setupInterception() {
    // Intercept XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      if (url.includes('remoteEntry.js') || url.includes('mf-manifest.json')) {
        console.log('🌐 Federation network request:', { method, url });
      }
      return originalXHROpen.call(this, method, url, ...args);
    };

    // Intercept fetch
    const originalFetch = window.fetch;
    window.fetch = async function(resource, options = {}) {
      const url = typeof resource === 'string' ? resource : resource.url;

      if (url.includes('remoteEntry.js') || url.includes('mf-manifest.json')) {
        console.log('🌐 Fetch federation resource:', { url, options });

        try {
          const response = await originalFetch.call(this, resource, options);
          console.log('✅ Federation resource loaded:', { url, status: response.status });
          return response;
        } catch (error) {
          console.error('❌ Federation resource failed:', { url, error });
          throw error;
        }
      }

      return originalFetch.call(this, resource, options);
    };
  }

  logNetworkTiming() {
    if (window.performance && window.performance.getEntriesByType) {
      const entries = window.performance.getEntriesByType('navigation');
      const resourceEntries = window.performance.getEntriesByType('resource');

      const federationEntries = resourceEntries.filter(entry =>
        entry.name.includes('remoteEntry.js') || entry.name.includes('mf-manifest.json')
      );

      console.table(federationEntries.map(entry => ({
        name: entry.name,
        duration: entry.duration,
        transferSize: entry.transferSize,
        decodedBodySize: entry.decodedBodySize
      })));
    }
  }
}

const networkDebugger = new FederationNetworkDebugger();
```

#### 2. CORS and Security Debugging

```javascript
// CORS debugging for federation
const CORSDebugger = {
  checkCORSHeaders(url) {
    return fetch(url, { method: 'HEAD' })
      .then(response => {
        console.log(`CORS headers for ${url}:`, {
          'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
          'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
          'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        });
        return response;
      })
      .catch(error => {
        console.error(`CORS check failed for ${url}:`, error);
      });
  },

  validateRemoteOrigins(remoteConfig) {
    Object.entries(remoteConfig).forEach(([name, url]) => {
      try {
        const remoteOrigin = new URL(url).origin;
        const currentOrigin = window.location.origin;

        if (remoteOrigin !== currentOrigin) {
          console.warn(`🔒 Cross-origin remote detected: ${name} (${remoteOrigin})`);
          this.checkCORSHeaders(url);
        }
      } catch (error) {
        console.error(`Invalid remote URL for ${name}:`, url);
      }
    });
  }
};
```

### Share Scope Inspection Methods

#### 1. Advanced Share Scope Analysis

```javascript
// Advanced share scope debugging
class ShareScopeAnalyzer {
  constructor() {
    this.shareScopes = window.__webpack_share_scopes__ || {};
  }

  analyzeScope(scopeName = 'default') {
    const scope = this.shareScopes[scopeName];
    if (!scope) {
      console.warn(`Share scope '${scopeName}' not found`);
      return;
    }

    console.group(`📊 Share Scope Analysis: ${scopeName}`);

    const analysis = {
      totalModules: 0,
      versionConflicts: [],
      singletonViolations: [],
      unusedModules: [],
      loadedModules: []
    };

    Object.entries(scope).forEach(([moduleName, versions]) => {
      analysis.totalModules++;

      const versionEntries = Object.entries(versions);

      // Check for version conflicts
      if (versionEntries.length > 1) {
        analysis.versionConflicts.push({
          module: moduleName,
          versions: versionEntries.map(([v, info]) => ({
            version: v,
            loaded: info.loaded,
            from: info.from
          }))
        });
      }

      // Check for singleton violations (singleton lives on shareConfig)
      versionEntries.forEach(([version, info]) => {
        if (info.shareConfig?.singleton && versionEntries.length > 1) {
          analysis.singletonViolations.push({
            module: moduleName,
            version,
            totalVersions: versionEntries.length
          });
        }

        if (info.loaded) {
          analysis.loadedModules.push({ module: moduleName, version });
        } else {
          analysis.unusedModules.push({ module: moduleName, version });
        }
      });
    });

    console.log('📈 Analysis Results:', analysis);

    if (analysis.versionConflicts.length > 0) {
      console.warn('⚠️ Version conflicts:', analysis.versionConflicts);
    }

    if (analysis.singletonViolations.length > 0) {
      console.error('🚨 Singleton violations:', analysis.singletonViolations);
    }

    console.groupEnd();
    return analysis;
  }

  compareVersions(version1, version2) {
    // Semantic version comparison
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;

      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    }

    return 0;
  }

  optimizeShareScope(scopeName = 'default') {
    const scope = this.shareScopes[scopeName];
    if (!scope) return;

    console.group(`🔧 Share Scope Optimization: ${scopeName}`);

    Object.entries(scope).forEach(([moduleName, versions]) => {
      const versionEntries = Object.entries(versions);

      if (versionEntries.length > 1) {
        // Find highest version
        const highestVersion = versionEntries.reduce((highest, [version]) => {
          return this.compareVersions(version, highest) > 0 ? version : highest;
        }, versionEntries[0][0]);

        console.log(`Recommended version for ${moduleName}: ${highestVersion}`);
      }
    });

    console.groupEnd();
  }
}

window.shareAnalyzer = new ShareScopeAnalyzer();
```

#### 2. Real-time Share Scope Monitoring

```javascript
// Real-time share scope monitoring
class ShareScopeMonitor {
  constructor() {
    this.observers = [];
    this.setupProxies();
  }

  setupProxies() {
    if (!window.__webpack_share_scopes__) {
      window.__webpack_share_scopes__ = {};
    }

    // Proxy the share scopes object to monitor changes
    window.__webpack_share_scopes__ = new Proxy(window.__webpack_share_scopes__, {
      set: (target, scopeName, value) => {
        console.log(`🔄 Share scope updated: ${scopeName}`);
        this.notifyObservers('scope-updated', { scopeName, value });
        return Reflect.set(target, scopeName, value);
      }
    });
  }

  addObserver(callback) {
    this.observers.push(callback);
  }

  notifyObservers(event, data) {
    this.observers.forEach(callback => callback(event, data));
  }

  startMonitoring() {
    console.log('🔍 Starting share scope monitoring...');

    setInterval(() => {
      const scopes = Object.keys(window.__webpack_share_scopes__ || {});
      scopes.forEach(scopeName => {
        const scope = window.__webpack_share_scopes__[scopeName];
        const moduleCount = Object.keys(scope).length;
        console.log(`📊 Scope ${scopeName}: ${moduleCount} modules`);
      });
    }, 5000);
  }
}

const scopeMonitor = new ShareScopeMonitor();
```

## Common Issues and Solutions

Common issue diagnosis and error investigation methodologies live in [troubleshooting-debugging.md](./troubleshooting-debugging.md).
