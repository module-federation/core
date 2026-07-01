# Module Federation Performance Debugging

This document owns performance bottleneck investigation and dynamic federation debugging utilities. Use [testing-debugging-guide.md](./testing-debugging-guide.md) as the index for the full testing and debugging doc set.

## Performance Debugging

### Performance Bottleneck Identification

```javascript
// Performance bottleneck identification for Module Federation
class FederationPerformanceProfiler {
  constructor() {
    this.measurements = {
      remoteLoading: [],
      moduleResolution: [],
      shareScope: [],
      rendering: []
    };
    this.setupProfiling();
  }

  setupProfiling() {
    // Profile remote loading
    this.profileRemoteLoading();

    // Profile module resolution
    this.profileModuleResolution();

    // Profile share scope operations
    this.profileShareScope();

    // Profile rendering performance
    this.profileRendering();
  }

  profileRemoteLoading() {
    // Monitor script loading
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes('remoteEntry.js')) {
          const measurement = {
            name: entry.name,
            startTime: entry.startTime,
            duration: entry.duration,
            transferSize: entry.transferSize,
            decodedBodySize: entry.decodedBodySize,
            timestamp: Date.now()
          };

          this.measurements.remoteLoading.push(measurement);

          // Check for performance issues
          if (entry.duration > 2000) {
            console.warn(`⚠️ Slow remote loading detected: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
          }

          if (entry.transferSize > 500 * 1024) { // > 500KB
            console.warn(`⚠️ Large remote bundle detected: ${entry.name} (${(entry.transferSize / 1024).toFixed(2)}KB)`);
          }
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  profileModuleResolution() {
    // Wrap module resolution calls
    if (window.__webpack_require__) {
      const originalRequire = window.__webpack_require__;
      window.__webpack_require__ = (moduleId) => {
        const startTime = performance.now();

        try {
          const result = originalRequire.call(this, moduleId);
          const duration = performance.now() - startTime;

          if (moduleId.includes('webpack/container') || moduleId.includes('remote')) {
            this.measurements.moduleResolution.push({
              moduleId,
              duration,
              timestamp: Date.now(),
              success: true
            });

            if (duration > 100) {
              console.warn(`⚠️ Slow module resolution: ${moduleId} (${duration.toFixed(2)}ms)`);
            }
          }

          return result;
        } catch (error) {
          const duration = performance.now() - startTime;
          this.measurements.moduleResolution.push({
            moduleId,
            duration,
            timestamp: Date.now(),
            success: false,
            error: error.message
          });
          throw error;
        }
      };
    }
  }

  profileShareScope() {
    // Profile share scope access
    if (window.__webpack_share_scopes__) {
      Object.keys(window.__webpack_share_scopes__).forEach(scopeName => {
        const scope = window.__webpack_share_scopes__[scopeName];

        Object.keys(scope).forEach(moduleName => {
          const moduleVersions = scope[moduleName];

          Object.keys(moduleVersions).forEach(version => {
            const versionInfo = moduleVersions[version];

            if (versionInfo.get) {
              const originalGet = versionInfo.get;
              versionInfo.get = () => {
                const startTime = performance.now();
                const result = originalGet();
                const duration = performance.now() - startTime;

                this.measurements.shareScope.push({
                  scope: scopeName,
                  module: moduleName,
                  version,
                  duration,
                  timestamp: Date.now()
                });

                if (duration > 50) {
                  console.warn(`⚠️ Slow shared module access: ${moduleName}@${version} (${duration.toFixed(2)}ms)`);
                }

                return result;
              };
            }
          });
        });
      });
    }
  }

  profileRendering() {
    // Profile React component rendering if available
    if (typeof React !== 'undefined' && React.Profiler) {
      const originalProfiler = React.Profiler;

      // This would need to be integrated into your React app
      console.log('💡 Tip: Wrap federated components with React.Profiler for detailed rendering metrics');
    }

    // Use Intersection Observer to track when federated components become visible
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.target.dataset.federatedComponent) {
            const renderTime = performance.now();
            this.measurements.rendering.push({
              component: entry.target.dataset.federatedComponent,
              renderTime,
              timestamp: Date.now()
            });
          }
        });
      });

      // Observe federated components (this would need to be implemented in your components)
      document.querySelectorAll('[data-federated-component]').forEach(el => {
        observer.observe(el);
      });
    }
  }

  identifyBottlenecks() {
    console.group('🔍 Performance Bottleneck Analysis');

    const bottlenecks = [];

    // Analyze remote loading
    const slowRemotes = this.measurements.remoteLoading.filter(m => m.duration > 1000);
    if (slowRemotes.length > 0) {
      bottlenecks.push({
        category: 'Remote Loading',
        severity: 'high',
        count: slowRemotes.length,
        details: slowRemotes,
        suggestion: 'Consider optimizing remote bundle size or using a CDN'
      });
    }

    // Analyze module resolution
    const slowResolutions = this.measurements.moduleResolution.filter(m => m.duration > 50);
    if (slowResolutions.length > 0) {
      bottlenecks.push({
        category: 'Module Resolution',
        severity: 'medium',
        count: slowResolutions.length,
        details: slowResolutions,
        suggestion: 'Check for complex dependency chains or inefficient module structure'
      });
    }

    // Analyze share scope
    const slowSharedAccess = this.measurements.shareScope.filter(m => m.duration > 25);
    if (slowSharedAccess.length > 0) {
      bottlenecks.push({
        category: 'Shared Module Access',
        severity: 'medium',
        count: slowSharedAccess.length,
        details: slowSharedAccess,
        suggestion: 'Review shared module configuration and version resolution'
      });
    }

    // Display results
    if (bottlenecks.length === 0) {
      console.log('✅ No significant performance bottlenecks detected');
    } else {
      bottlenecks.forEach(bottleneck => {
        const icon = bottleneck.severity === 'high' ? '🔴' : '🟡';
        console.log(`${icon} ${bottleneck.category}: ${bottleneck.count} slow operations`);
        console.log(`Suggestion: ${bottleneck.suggestion}`);
        console.table(bottleneck.details);
      });
    }

    console.groupEnd();
    return bottlenecks;
  }

  generatePerformanceReport() {
    const report = {
      summary: {
        totalMeasurements: Object.values(this.measurements).reduce((sum, arr) => sum + arr.length, 0),
        categories: Object.keys(this.measurements).map(category => ({
          category,
          count: this.measurements[category].length,
          averageDuration: this.measurements[category].length > 0
            ? this.measurements[category].reduce((sum, m) => sum + (m.duration || 0), 0) / this.measurements[category].length
            : 0
        }))
      },
      bottlenecks: this.identifyBottlenecks(),
      measurements: this.measurements,
      recommendations: this.generateRecommendations()
    };

    console.log('📊 Performance Report:', report);
    return report;
  }

  generateRecommendations() {
    const recommendations = [];

    // Check remote loading performance
    const avgRemoteLoadTime = this.measurements.remoteLoading.reduce((sum, m) => sum + m.duration, 0) / this.measurements.remoteLoading.length;
    if (avgRemoteLoadTime > 1000) {
      recommendations.push({
        category: 'Remote Loading',
        priority: 'high',
        recommendation: 'Consider implementing preloading for critical remotes',
        implementation: 'Add <link rel="preload" href="remoteEntry.js"> in your HTML head'
      });
    }

    // Check bundle sizes
    const largeBundles = this.measurements.remoteLoading.filter(m => m.transferSize > 300 * 1024);
    if (largeBundles.length > 0) {
      recommendations.push({
        category: 'Bundle Size',
        priority: 'medium',
        recommendation: 'Optimize remote bundle sizes',
        implementation: 'Use code splitting, tree shaking, and consider breaking large remotes into smaller ones'
      });
    }

    // Check module resolution patterns
    const failedResolutions = this.measurements.moduleResolution.filter(m => !m.success);
    if (failedResolutions.length > 0) {
      recommendations.push({
        category: 'Module Resolution',
        priority: 'high',
        recommendation: 'Fix module resolution failures',
        implementation: 'Review module paths and ensure all exposed modules are correctly configured'
      });
    }

    return recommendations;
  }

  startRealTimeMonitoring() {
    console.log('🔄 Starting real-time performance monitoring...');

    setInterval(() => {
      const recentBottlenecks = this.identifyBottlenecks();
      if (recentBottlenecks.length > 0) {
        console.warn('⚠️ Performance issues detected:', recentBottlenecks);
      }
    }, 10000); // Check every 10 seconds
  }

  reset() {
    this.measurements = {
      remoteLoading: [],
      moduleResolution: [],
      shareScope: [],
      rendering: []
    };
    console.log('🔄 Performance measurements reset');
  }
}

window.performanceProfiler = new FederationPerformanceProfiler();
```

## Advanced Debugging Techniques

### Dynamic Federation Debugging

```javascript
// Advanced dynamic federation debugging
class DynamicFederationDebugger {
  constructor() {
    this.runtimeManifests = new Map();
    this.loadingStrategies = new Map();
    this.setupDynamicDebugging();
  }

  setupDynamicDebugging() {
    // Intercept manifest loading
    this.interceptManifestLoading();

    // Monitor dynamic remote registration
    this.monitorDynamicRemotes();

    // Track loading strategies
    this.trackLoadingStrategies();
  }

  interceptManifestLoading() {
    const originalFetch = window.fetch;
    window.fetch = async function(resource, options) {
      const url = typeof resource === 'string' ? resource : resource.url;

      if (url.includes('mf-manifest.json')) {
        console.log('📄 Loading manifest:', url);

        try {
          const response = await originalFetch.call(this, resource, options);
          const manifest = await response.clone().json();

          window.dynamicDebugger.runtimeManifests.set(url, {
            manifest,
            loadTime: Date.now(),
            url
          });

          console.log('✅ Manifest loaded:', manifest);
          return response;
        } catch (error) {
          console.error('❌ Manifest loading failed:', error);
          throw error;
        }
      }

      return originalFetch.call(this, resource, options);
    };
  }

  monitorDynamicRemotes() {
    // Monitor when new remotes are registered
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === 'SCRIPT' && node.src && node.src.includes('remoteEntry')) {
            console.log('🔄 Dynamic remote loading:', node.src);

            node.addEventListener('load', () => {
              console.log('✅ Dynamic remote loaded:', node.src);
              this.analyzeNewRemote(node.src);
            });

            node.addEventListener('error', () => {
              console.error('❌ Dynamic remote failed:', node.src);
            });
          }
        });
      });
    });

    observer.observe(document.head, { childList: true });
  }

  analyzeNewRemote(remoteUrl) {
    // Extract remote name from URL or window object
    const remoteName = this.detectRemoteName(remoteUrl);

    if (remoteName && window[remoteName]) {
      console.group(`🔍 Analyzing new remote: ${remoteName}`);

      const container = window[remoteName];
      console.log('Container object:', container);

      // Try to get metadata if available
      if (container.__remoteEntryModule) {
        console.log('Remote entry module:', container.__remoteEntryModule);
      }

      // Test basic functionality
      this.testRemoteBasics(remoteName);

      console.groupEnd();
    }
  }

  detectRemoteName(remoteUrl) {
    // Try to detect remote name from window object changes
    const beforeKeys = new Set(Object.keys(window));

    setTimeout(() => {
      const afterKeys = new Set(Object.keys(window));
      const newKeys = [...afterKeys].filter(key => !beforeKeys.has(key));

      const remoteKey = newKeys.find(key =>
        window[key] && typeof window[key].get === 'function'
      );

      if (remoteKey) {
        console.log(`🎯 Detected remote name: ${remoteKey}`);
        return remoteKey;
      }
    }, 100);

    return null;
  }

  async testRemoteBasics(remoteName) {
    const container = window[remoteName];

    try {
      // Test initialization
      if (typeof container.init === 'function') {
        await container.init(window.__webpack_share_scopes__.default || {});
        console.log('✅ Remote initialized successfully');
      }

      // Try to detect exposed modules
      const commonPaths = ['./App', './Component', './Button'];
      const availableModules = [];

      for (const path of commonPaths) {
        try {
          await container.get(path);
          availableModules.push(path);
        } catch (error) {
          // Module not available
        }
      }

      console.log('Available modules:', availableModules);

    } catch (error) {
      console.error('❌ Remote testing failed:', error);
    }
  }

  trackLoadingStrategies() {
    // Track different loading strategies used
    const strategies = ['dynamic-import', 'script-injection', 'fetch-eval'];

    strategies.forEach(strategy => {
      this.loadingStrategies.set(strategy, {
        attempts: 0,
        successes: 0,
        failures: 0,
        averageTime: 0
      });
    });
  }

  debugManifestResolution(manifestUrl) {
    console.group(`🔍 Debugging manifest resolution: ${manifestUrl}`);

    const manifestData = this.runtimeManifests.get(manifestUrl);

    if (!manifestData) {
      console.error('❌ Manifest not found in cache');
      console.groupEnd();
      return;
    }

    const { manifest } = manifestData;

    // Analyze manifest structure
    console.log('📋 Manifest structure:');
    console.log('ID:', manifest.id);
    console.log('Name:', manifest.name);
    console.log('Version:', manifest.version);
    console.log('Remotes:', Object.keys(manifest.remotes || {}));
    console.log('Shared:', Object.keys(manifest.shared || {}));

    // Validate remote URLs
    if (manifest.remotes) {
      console.log('🔗 Validating remote URLs:');
      Object.entries(manifest.remotes).forEach(([name, config]) => {
        const url = typeof config === 'string' ? config : config.entry;
        console.log(`${name}: ${url}`);

        // Test URL accessibility
        fetch(url, { method: 'HEAD' })
          .then(response => {
            const status = response.ok ? '✅' : '❌';
            console.log(`${status} ${name}: ${response.status}`);
          })
          .catch(error => {
            console.log(`❌ ${name}: ${error.message}`);
          });
      });
    }

    // Check for version conflicts
    if (manifest.shared) {
      console.log('🔄 Checking shared dependencies:');
      Object.entries(manifest.shared).forEach(([name, config]) => {
        const version = config.version || config.requiredVersion;
        console.log(`${name}@${version}`);

        // Check against current share scope
        const shareScope = window.__webpack_share_scopes__.default || {};
        if (shareScope[name]) {
          const availableVersions = Object.keys(shareScope[name]);
          const hasConflict = !availableVersions.includes(version);
          const icon = hasConflict ? '⚠️' : '✅';
          console.log(`${icon} Available versions: ${availableVersions.join(', ')}`);
        }
      });
    }

    console.groupEnd();
  }

  simulateNetworkConditions(condition) {
    console.log(`🌐 Simulating network condition: ${condition}`);

    const conditions = {
      'slow-3g': { delay: 2000, errorRate: 0.1 },
      'fast-3g': { delay: 500, errorRate: 0.05 },
      'offline': { delay: 0, errorRate: 1.0 },
      'normal': { delay: 100, errorRate: 0.01 }
    };

    const config = conditions[condition] || conditions.normal;

    // Override fetch to simulate network conditions
    const originalFetch = window.fetch;
    window.fetch = async function(resource, options) {
      const url = typeof resource === 'string' ? resource : resource.url;

      if (url.includes('remoteEntry') || url.includes('mf-manifest')) {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, config.delay));

        // Simulate errors
        if (Math.random() < config.errorRate) {
          throw new Error(`Simulated network error for ${url}`);
        }
      }

      return originalFetch.call(this, resource, options);
    };

    console.log(`Network simulation active: ${config.delay}ms delay, ${(config.errorRate * 100).toFixed(1)}% error rate`);

    // Auto-restore after 60 seconds
    setTimeout(() => {
      window.fetch = originalFetch;
      console.log('🔄 Network simulation restored to normal');
    }, 60000);
  }

  generateDynamicReport() {
    const report = {
      manifests: Array.from(this.runtimeManifests.entries()).map(([url, data]) => ({
        url,
        manifest: data.manifest,
        loadTime: data.loadTime
      })),
      loadingStrategies: Object.fromEntries(this.loadingStrategies),
      dynamicRemotes: Object.keys(window).filter(key =>
        window[key] &&
        typeof window[key].get === 'function' &&
        !key.startsWith('__')
      ),
      recommendations: this.generateDynamicRecommendations()
    };

    console.log('📊 Dynamic Federation Report:', report);
    return report;
  }

  generateDynamicRecommendations() {
    const recommendations = [];

    // Check manifest loading performance
    const manifestLoadTimes = Array.from(this.runtimeManifests.values())
      .map(data => Date.now() - data.loadTime);

    const avgManifestLoadTime = manifestLoadTimes.reduce((sum, time) => sum + time, 0) / manifestLoadTimes.length;

    if (avgManifestLoadTime > 1000) {
      recommendations.push({
        category: 'Manifest Loading',
        priority: 'medium',
        recommendation: 'Consider caching manifests or using a manifest CDN',
        implementation: 'Implement manifest caching strategy or use HTTP caching headers'
      });
    }

    // Check for unused remotes
    const allRemotes = Object.keys(window).filter(key =>
      window[key] && typeof window[key].get === 'function'
    );

    if (allRemotes.length > 5) {
      recommendations.push({
        category: 'Remote Management',
        priority: 'low',
        recommendation: 'Consider lazy loading for unused remotes',
        implementation: 'Implement on-demand remote loading to reduce initial bundle size'
      });
    }

    return recommendations;
  }
}

window.dynamicDebugger = new DynamicFederationDebugger();
```

---

Use these performance debugging utilities only in development workflows. Remove or disable copied diagnostic code before shipping production bundles.
