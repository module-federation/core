# Module Federation Development Tools Debugging

This document owns browser devtools, custom debugging utilities, profiling tools, and extension-oriented workflows for Module Federation debugging. Use [testing-debugging-guide.md](./testing-debugging-guide.md) as the index for the full testing and debugging doc set.

## Development Tools Integration

### Browser Dev Tools Usage for Federation

#### 1. Chrome DevTools Integration

```javascript
// Chrome DevTools integration for Module Federation
class ChromeDevToolsIntegration {
  constructor() {
    this.setupConsoleCommands();
    this.setupNetworkPanel();
    this.setupSourceMaps();
  }

  setupConsoleCommands() {
    // Add federation debugging commands to console
    window.mf = {
      // List all remotes
      remotes: () => {
        const remotes = Object.keys(window).filter(key =>
          window[key] && typeof window[key].get === 'function'
        );
        console.table(remotes.map(name => ({
          name,
          type: 'remote',
          available: !!window[name]
        })));
        return remotes;
      },

      // Inspect specific remote
      inspect: (remoteName) => {
        const remote = window[remoteName];
        if (!remote) {
          console.error(`Remote '${remoteName}' not found`);
          return;
        }

        console.group(`🔍 Remote: ${remoteName}`);
        console.log('Remote object:', remote);

        // Try to get manifest if available
        if (remote.manifest) {
          console.log('Manifest:', remote.manifest);
        }

        console.groupEnd();
      },

      // Test remote module loading
      test: async (remoteName, modulePath) => {
        try {
          console.log(`🧪 Testing ${remoteName}${modulePath}`);
          const factory = await window[remoteName].get(modulePath);
          const module = factory();
          console.log('✅ Module loaded successfully:', module);
          return module;
        } catch (error) {
          console.error('❌ Module loading failed:', error);
          throw error;
        }
      },

      // Performance metrics
      perf: () => {
        const federationEntries = performance.getEntriesByType('resource').filter(
          entry => entry.name.includes('remoteEntry.js')
        );

        console.table(federationEntries.map(entry => ({
          url: entry.name,
          duration: `${entry.duration.toFixed(2)}ms`,
          size: `${(entry.transferSize / 1024).toFixed(2)}KB`
        })));
      }
    };

    console.log('🛠️ Chrome DevTools integration loaded. Use window.mf for debugging commands.');
  }

  setupNetworkPanel() {
    // Add federation context to network requests
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0];
      if (typeof url === 'string' && url.includes('remoteEntry.js')) {
        // Add federation context to the request
        console.trace('Federation network request:', url);
      }
      return originalFetch.apply(this, args);
    };
  }

  setupSourceMaps() {
    // Help with source map debugging for federated modules
    const originalConsoleError = console.error;
    console.error = function(...args) {
      const errorString = args.join(' ');
      if (errorString.includes('Module Federation') || errorString.includes('remoteEntry')) {
        console.group('🐛 Federation Error Debug Info');
        console.log('Federation remotes:', Object.keys(window).filter(k =>
          window[k] && typeof window[k].get === 'function'
        ));
        console.log('Share scopes:', Object.keys(window.__webpack_share_scopes__ || {}));
        console.groupEnd();
      }
      return originalConsoleError.apply(this, args);
    };
  }
}

new ChromeDevToolsIntegration();
```

#### 2. React DevTools Integration

```javascript
// React DevTools integration for federation
if (typeof window !== 'undefined' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = (function(original) {
    return function(id, root, ...args) {
      // Track federated components
      const federatedComponents = [];

      function findFederatedComponents(fiber) {
        if (fiber.type && fiber.type.displayName && fiber.type.displayName.includes('Federation')) {
          federatedComponents.push({
            name: fiber.type.displayName,
            props: fiber.memoizedProps
          });
        }

        if (fiber.child) findFederatedComponents(fiber.child);
        if (fiber.sibling) findFederatedComponents(fiber.sibling);
      }

      findFederatedComponents(root.current);

      if (federatedComponents.length > 0) {
        console.log('🔧 Federated components in render:', federatedComponents);
      }

      return original ? original.call(this, id, root, ...args) : undefined;
    };
  })(window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot);
}
```

### Custom Debugging Utilities

#### 1. Federation Debug Panel

```javascript
// Custom debug panel for Module Federation
class FederationDebugPanel {
  constructor() {
    this.panel = null;
    this.isVisible = false;
    this.createPanel();
    this.bindKeyboardShortcut();
  }

  createPanel() {
    this.panel = document.createElement('div');
    this.panel.id = 'federation-debug-panel';
    this.panel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 400px;
      height: 600px;
      background: #1e1e1e;
      color: #fff;
      font-family: monospace;
      font-size: 12px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10000;
      display: none;
      overflow: auto;
      padding: 16px;
    `;

    this.updatePanelContent();
    document.body.appendChild(this.panel);
  }

  updatePanelContent() {
    const shareScopes = window.__webpack_share_scopes__ || {};
    const remotes = Object.keys(window).filter(key =>
      window[key] && typeof window[key].get === 'function'
    );

    this.panel.innerHTML = `
      <h3 style="margin: 0 0 16px 0; color: #61dafb;">🔧 Federation Debug Panel</h3>

      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #ffd700;">📦 Loaded Remotes (${remotes.length})</h4>
        ${remotes.map(name => `
          <div style="margin: 4px 0; padding: 4px 8px; background: #2d2d2d; border-radius: 4px;">
            ${name}
          </div>
        `).join('')}
      </div>

      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #ffd700;">🔄 Share Scopes</h4>
        ${Object.entries(shareScopes).map(([scopeName, scope]) => `
          <div style="margin: 8px 0;">
            <strong>${scopeName}</strong> (${Object.keys(scope).length} modules)
            ${Object.entries(scope).map(([moduleName, versions]) => `
              <div style="margin: 2px 0 2px 16px; font-size: 11px;">
                ${moduleName}: ${Object.keys(versions).join(', ')}
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>

      <div>
        <button onclick="window.debugPanel.refresh()" style="
          background: #61dafb;
          color: #000;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 8px;
        ">Refresh</button>

        <button onclick="window.debugPanel.exportLog()" style="
          background: #ffd700;
          color: #000;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        ">Export Log</button>
      </div>
    `;
  }

  toggle() {
    this.isVisible = !this.isVisible;
    this.panel.style.display = this.isVisible ? 'block' : 'none';
    if (this.isVisible) {
      this.updatePanelContent();
    }
  }

  refresh() {
    this.updatePanelContent();
  }

  exportLog() {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      remotes: Object.keys(window).filter(key =>
        window[key] && typeof window[key].get === 'function'
      ),
      shareScopes: window.__webpack_share_scopes__ || {},
      performance: performance.getEntriesByType('resource').filter(
        entry => entry.name.includes('remoteEntry.js')
      )
    };

    const blob = new Blob([JSON.stringify(debugInfo, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `federation-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  bindKeyboardShortcut() {
    document.addEventListener('keydown', (event) => {
      // Ctrl+Shift+F to toggle debug panel
      if (event.ctrlKey && event.shiftKey && event.key === 'F') {
        event.preventDefault();
        this.toggle();
      }
    });
  }
}

window.debugPanel = new FederationDebugPanel();
console.log('🔧 Federation Debug Panel loaded. Press Ctrl+Shift+F to toggle.');
```

#### 2. Module Loading Visualizer

```javascript
// Visual module loading tracker
class ModuleLoadingVisualizer {
  constructor() {
    this.loadingTimeline = [];
    this.visualization = null;
    this.setupInterception();
  }

  setupInterception() {
    // Intercept dynamic imports
    const originalImport = window.__webpack_require__;
    if (originalImport) {
      window.__webpack_require__ = (moduleId) => {
        const startTime = performance.now();
        this.addLoadingEvent('start', moduleId, startTime);

        return originalImport(moduleId).then(
          (module) => {
            const endTime = performance.now();
            this.addLoadingEvent('success', moduleId, endTime, endTime - startTime);
            return module;
          },
          (error) => {
            const endTime = performance.now();
            this.addLoadingEvent('error', moduleId, endTime, endTime - startTime, error);
            throw error;
          }
        );
      };
    }
  }

  addLoadingEvent(type, moduleId, timestamp, duration = 0, error = null) {
    this.loadingTimeline.push({
      type,
      moduleId,
      timestamp,
      duration,
      error
    });

    if (this.visualization) {
      this.updateVisualization();
    }
  }

  createVisualization() {
    this.visualization = document.createElement('div');
    this.visualization.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 600px;
      height: 200px;
      background: rgba(0,0,0,0.9);
      color: white;
      font-family: monospace;
      font-size: 11px;
      border-radius: 8px;
      padding: 16px;
      z-index: 9999;
      overflow-y: auto;
    `;

    document.body.appendChild(this.visualization);
    this.updateVisualization();
  }

  updateVisualization() {
    const recentEvents = this.loadingTimeline.slice(-20);

    this.visualization.innerHTML = `
      <h4 style="margin: 0 0 12px 0;">📊 Module Loading Timeline</h4>
      ${recentEvents.map(event => `
        <div style="
          margin: 2px 0;
          padding: 2px 4px;
          background: ${event.type === 'success' ? '#2d5a2d' : event.type === 'error' ? '#5a2d2d' : '#2d4a5a'};
          border-radius: 2px;
        ">
          <span style="color: ${event.type === 'success' ? '#90EE90' : event.type === 'error' ? '#FF6B6B' : '#87CEEB'}">
            ${event.type.toUpperCase()}
          </span>
          ${event.moduleId}
          ${event.duration > 0 ? `(${event.duration.toFixed(2)}ms)` : ''}
          ${event.error ? `- ${event.error.message}` : ''}
        </div>
      `).join('')}
    `;
  }

  showVisualization() {
    if (!this.visualization) {
      this.createVisualization();
    } else {
      this.visualization.style.display = 'block';
      this.updateVisualization();
    }
  }

  hideVisualization() {
    if (this.visualization) {
      this.visualization.style.display = 'none';
    }
  }

  exportTimeline() {
    return {
      timeline: this.loadingTimeline,
      summary: {
        totalLoads: this.loadingTimeline.filter(e => e.type === 'start').length,
        successfulLoads: this.loadingTimeline.filter(e => e.type === 'success').length,
        failedLoads: this.loadingTimeline.filter(e => e.type === 'error').length,
        averageLoadTime: this.loadingTimeline
          .filter(e => e.type === 'success' && e.duration > 0)
          .reduce((sum, e, _, arr) => sum + e.duration / arr.length, 0)
      }
    };
  }
}

window.moduleVisualizer = new ModuleLoadingVisualizer();
```

### Performance Profiling Tools

#### 1. Federation Performance Monitor

```javascript
// Performance monitoring for Module Federation
class FederationPerformanceMonitor {
  constructor() {
    this.metrics = {
      remoteLoading: [],
      shareResolution: [],
      moduleInitialization: []
    };
    this.setupMonitoring();
  }

  setupMonitoring() {
    // Monitor remote loading performance
    this.monitorRemoteLoading();

    // Monitor share scope resolution
    this.monitorShareResolution();

    // Monitor module initialization
    this.monitorModuleInitialization();
  }

  monitorRemoteLoading() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes('remoteEntry.js')) {
          this.metrics.remoteLoading.push({
            name: entry.name,
            duration: entry.duration,
            transferSize: entry.transferSize,
            decodedBodySize: entry.decodedBodySize,
            timestamp: entry.startTime
          });
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  monitorShareResolution() {
    // Wrap share scope access
    const originalGetSharedModule = window.__webpack_require__?.cache?.get;
    if (originalGetSharedModule) {
      window.__webpack_require__.cache.get = function(moduleId) {
        const startTime = performance.now();
        const result = originalGetSharedModule.call(this, moduleId);
        const duration = performance.now() - startTime;

        if (moduleId.includes('shared') || moduleId.includes('singleton')) {
          window.perfMonitor.metrics.shareResolution.push({
            moduleId,
            duration,
            timestamp: startTime
          });
        }

        return result;
      };
    }
  }

  monitorModuleInitialization() {
    // Monitor module factory execution time
    const originalRequire = window.__webpack_require__;
    if (originalRequire) {
      window.__webpack_require__ = function(moduleId) {
        if (typeof moduleId === 'string' && moduleId.includes('webpack/container')) {
          const startTime = performance.now();
          const result = originalRequire.call(this, moduleId);
          const duration = performance.now() - startTime;

          window.perfMonitor.metrics.moduleInitialization.push({
            moduleId,
            duration,
            timestamp: startTime
          });

          return result;
        }

        return originalRequire.call(this, moduleId);
      };
    }
  }

  getReport() {
    const report = {
      remoteLoading: {
        count: this.metrics.remoteLoading.length,
        averageDuration: this.calculateAverage(this.metrics.remoteLoading, 'duration'),
        totalSize: this.metrics.remoteLoading.reduce((sum, m) => sum + (m.transferSize || 0), 0),
        entries: this.metrics.remoteLoading
      },
      shareResolution: {
        count: this.metrics.shareResolution.length,
        averageDuration: this.calculateAverage(this.metrics.shareResolution, 'duration'),
        entries: this.metrics.shareResolution
      },
      moduleInitialization: {
        count: this.metrics.moduleInitialization.length,
        averageDuration: this.calculateAverage(this.metrics.moduleInitialization, 'duration'),
        entries: this.metrics.moduleInitialization
      }
    };

    console.group('📊 Federation Performance Report');
    console.table(report.remoteLoading.entries);
    console.log('Share Resolution:', report.shareResolution);
    console.log('Module Initialization:', report.moduleInitialization);
    console.groupEnd();

    return report;
  }

  calculateAverage(array, property) {
    if (array.length === 0) return 0;
    return array.reduce((sum, item) => sum + item[property], 0) / array.length;
  }

  exportReport() {
    const report = this.getReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `federation-performance-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  reset() {
    this.metrics = {
      remoteLoading: [],
      shareResolution: [],
      moduleInitialization: []
    };
    console.log('🔄 Performance metrics reset');
  }
}

window.perfMonitor = new FederationPerformanceMonitor();
```

#### 2. Bundle Analysis Tools

```javascript
// Bundle analysis for federated modules
class FederationBundleAnalyzer {
  constructor() {
    this.bundleData = {};
    this.setupAnalysis();
  }

  setupAnalysis() {
    // Analyze webpack chunks
    if (window.__webpack_require__) {
      this.analyzeWebpackChunks();
    }

    // Monitor dynamic imports
    this.monitorDynamicImports();
  }

  analyzeWebpackChunks() {
    const webpackRequire = window.__webpack_require__;
    const cache = webpackRequire.cache || {};
    const chunks = Object.keys(cache);

    console.group('📦 Webpack Bundle Analysis');
    console.log(`Total cached modules: ${chunks.length}`);

    // Categorize modules
    const categories = {
      federation: chunks.filter(id => id.includes('container') || id.includes('shared')),
      vendor: chunks.filter(id => id.includes('node_modules')),
      app: chunks.filter(id => !id.includes('node_modules') && !id.includes('container') && !id.includes('shared'))
    };

    Object.entries(categories).forEach(([category, modules]) => {
      console.log(`${category}: ${modules.length} modules`);
    });

    console.groupEnd();

    this.bundleData.webpack = {
      totalModules: chunks.length,
      categories
    };
  }

  monitorDynamicImports() {
    const originalImport = window.import || (() => {});

    window.import = async function(specifier) {
      const startTime = performance.now();

      try {
        const module = await originalImport.call(this, specifier);
        const loadTime = performance.now() - startTime;

        console.log(`📥 Dynamic import: ${specifier} (${loadTime.toFixed(2)}ms)`);

        return module;
      } catch (error) {
        console.error(`❌ Dynamic import failed: ${specifier}`, error);
        throw error;
      }
    };
  }

  analyzeBundleSize() {
    // Use Resource Timing API to get bundle sizes
    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter(r => r.name.endsWith('.js'));

    const analysis = {
      totalJSSize: jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
      federationBundles: jsResources.filter(r => r.name.includes('remoteEntry')),
      largestBundles: jsResources
        .sort((a, b) => (b.transferSize || 0) - (a.transferSize || 0))
        .slice(0, 10)
    };

    console.group('📊 Bundle Size Analysis');
    console.log(`Total JS size: ${(analysis.totalJSSize / 1024 / 1024).toFixed(2)} MB`);
    console.table(analysis.largestBundles.map(r => ({
      name: r.name.split('/').pop(),
      size: `${((r.transferSize || 0) / 1024).toFixed(2)} KB`,
      duration: `${r.duration.toFixed(2)}ms`
    })));
    console.groupEnd();

    return analysis;
  }

  checkForDuplicates() {
    // Check for potential duplicate dependencies
    const shareScopes = window.__webpack_share_scopes__ || {};
    const duplicates = [];

    Object.entries(shareScopes).forEach(([scopeName, scope]) => {
      Object.entries(scope).forEach(([moduleName, versions]) => {
        const versionCount = Object.keys(versions).length;
        if (versionCount > 1) {
          duplicates.push({
            scope: scopeName,
            module: moduleName,
            versions: Object.keys(versions)
          });
        }
      });
    });

    if (duplicates.length > 0) {
      console.warn('🔍 Potential duplicate dependencies:', duplicates);
    } else {
      console.log('✅ No duplicate dependencies detected');
    }

    return duplicates;
  }

  generateOptimizationSuggestions() {
    const suggestions = [];

    // Check bundle size
    const bundleAnalysis = this.analyzeBundleSize();
    if (bundleAnalysis.totalJSSize > 1024 * 1024) { // > 1MB
      suggestions.push({
        type: 'bundle-size',
        message: 'Total JavaScript bundle size is large. Consider code splitting.',
        impact: 'high'
      });
    }

    // Check duplicates
    const duplicates = this.checkForDuplicates();
    if (duplicates.length > 0) {
      suggestions.push({
        type: 'duplicates',
        message: `Found ${duplicates.length} potential duplicate dependencies.`,
        impact: 'medium',
        details: duplicates
      });
    }

    // Check remote loading performance
    const federationEntries = performance.getEntriesByType('resource')
      .filter(r => r.name.includes('remoteEntry'));

    const slowRemotes = federationEntries.filter(r => r.duration > 1000);
    if (slowRemotes.length > 0) {
      suggestions.push({
        type: 'slow-remotes',
        message: `${slowRemotes.length} remotes are loading slowly (>1s).`,
        impact: 'high',
        details: slowRemotes.map(r => r.name)
      });
    }

    console.group('💡 Optimization Suggestions');
    suggestions.forEach(suggestion => {
      console.log(`${suggestion.impact === 'high' ? '🔴' : '🟡'} ${suggestion.message}`);
      if (suggestion.details) {
        console.log('Details:', suggestion.details);
      }
    });
    console.groupEnd();

    return suggestions;
  }
}

window.bundleAnalyzer = new FederationBundleAnalyzer();
```

### Federation-Specific Debugging Extensions

#### 1. Browser Extension Helper

```javascript
// Helper functions for browser extension development
window.federationDevtools = {
  // Export state for browser extension
  exportState() {
    return {
      remotes: Object.keys(window).filter(key =>
        window[key] && typeof window[key].get === 'function'
      ).reduce((acc, key) => {
        acc[key] = {
          available: true,
          type: 'remote'
        };
        return acc;
      }, {}),

      shareScopes: window.__webpack_share_scopes__ || {},

      performance: {
        resources: performance.getEntriesByType('resource')
          .filter(r => r.name.includes('remoteEntry') || r.name.includes('mf-manifest')),
        timing: performance.timing
      },

      errors: this.getRecentErrors()
    };
  },

  // Get recent federation-related errors
  getRecentErrors() {
    // This would typically be populated by error monitoring
    return window.federationErrors || [];
  },

  // Send state to browser extension
  sendToExtension(data) {
    window.postMessage({
      type: 'FEDERATION_DEVTOOLS_STATE',
      payload: data
    }, '*');
  },

  // Setup communication with browser extension
  setupExtensionCommunication() {
    window.addEventListener('message', (event) => {
      if (event.data.type === 'FEDERATION_DEVTOOLS_REQUEST') {
        const state = this.exportState();
        this.sendToExtension(state);
      }
    });
  },

  // Inject debugging capabilities
  inject() {
    this.setupExtensionCommunication();

    // Add global error handler for federation errors
    window.addEventListener('error', (event) => {
      if (event.error && (
        event.error.message.includes('Module Federation') ||
        event.error.message.includes('remoteEntry') ||
        event.error.message.includes('shared module')
      )) {
        if (!window.federationErrors) {
          window.federationErrors = [];
        }

        window.federationErrors.push({
          message: event.error.message,
          stack: event.error.stack,
          timestamp: Date.now(),
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });

        // Limit stored errors
        if (window.federationErrors.length > 50) {
          window.federationErrors = window.federationErrors.slice(-25);
        }
      }
    });

    console.log('🔧 Federation DevTools injected');
  }
};

// Auto-inject if in development
if (process.env.NODE_ENV === 'development') {
  window.federationDevtools.inject();
}
```
