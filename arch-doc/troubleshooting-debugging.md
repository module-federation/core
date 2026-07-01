# Module Federation Troubleshooting and Error Investigation

This document owns common issue diagnosis and error investigation methodologies. Use [testing-debugging-guide.md](./testing-debugging-guide.md) as the testing/debugging index.

## Common Issues and Solutions

### Troubleshooting Guide for Typical Federation Problems

#### 1. Remote Loading Failures

```javascript
// Comprehensive remote loading diagnostics
class RemoteLoadingDiagnostics {
  static async diagnoseRemoteFailure(remoteName, remoteUrl) {
    console.group(`🔍 Diagnosing remote loading failure: ${remoteName}`);

    const diagnostics = {
      networkReachability: false,
      corsIssues: false,
      scriptLoading: false,
      containerInitialization: false,
      moduleAvailability: false
    };

    try {
      // 1. Test network reachability
      console.log('1️⃣ Testing network reachability...');
      const response = await fetch(remoteUrl, { method: 'HEAD' });
      diagnostics.networkReachability = response.ok;
      console.log(`Network reachable: ${diagnostics.networkReachability}`);

      if (!diagnostics.networkReachability) {
        console.error(`❌ Remote URL not reachable: ${response.status}`);
        console.groupEnd();
        return diagnostics;
      }

      // 2. Check CORS headers
      console.log('2️⃣ Checking CORS configuration...');
      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods')
      };

      const currentOrigin = window.location.origin;
      const remoteOrigin = new URL(remoteUrl).origin;

      if (currentOrigin !== remoteOrigin) {
        const allowedOrigin = corsHeaders['Access-Control-Allow-Origin'];
        diagnostics.corsIssues = allowedOrigin !== '*' && allowedOrigin !== currentOrigin;
        console.log(`CORS configured correctly: ${!diagnostics.corsIssues}`);

        if (diagnostics.corsIssues) {
          console.warn(`⚠️ CORS issue detected. Origin: ${currentOrigin}, Allowed: ${allowedOrigin}`);
        }
      }

      // 3. Test script loading
      console.log('3️⃣ Testing script loading...');
      const scriptLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = remoteUrl;
        script.onload = () => resolve(true);
        script.onerror = () => reject(false);
        document.head.appendChild(script);

        // Cleanup
        setTimeout(() => {
          document.head.removeChild(script);
        }, 100);
      });

      try {
        diagnostics.scriptLoading = await scriptLoadPromise;
        console.log(`Script loading: ${diagnostics.scriptLoading}`);
      } catch {
        diagnostics.scriptLoading = false;
        console.error('❌ Script failed to load');
      }

      // 4. Check container initialization
      console.log('4️⃣ Checking container initialization...');
      if (window[remoteName]) {
        diagnostics.containerInitialization = typeof window[remoteName].init === 'function';
        console.log(`Container initialized: ${diagnostics.containerInitialization}`);

        if (diagnostics.containerInitialization) {
          // 5. Test module availability
          console.log('5️⃣ Testing module availability...');
          try {
            const testModule = await window[remoteName].get('./test');
            diagnostics.moduleAvailability = true;
            console.log('✅ Test module loading successful');
          } catch (error) {
            console.log('ℹ️ Test module not available (this may be normal)');
            diagnostics.moduleAvailability = 'unknown';
          }
        }
      } else {
        console.error('❌ Container not found in window object');
      }

    } catch (error) {
      console.error('❌ Diagnostic error:', error);
    }

    console.log('📊 Diagnostic Summary:', diagnostics);
    console.groupEnd();

    return diagnostics;
  }

  static getRemoteLoadingChecklist() {
    return [
      '✅ Remote URL is accessible',
      '✅ CORS headers are configured correctly',
      '✅ RemoteEntry.js loads without errors',
      '✅ Container object is available in window',
      '✅ Container.init() function exists',
      '✅ Exposed modules are available via container.get()',
      '✅ Share scope is properly initialized'
    ];
  }

  static async autoFix(remoteName, remoteUrl) {
    console.log(`🔧 Attempting auto-fix for ${remoteName}...`);

    // Try different loading strategies
    const strategies = [
      // Strategy 1: Retry with cache busting
      () => this.loadWithCacheBusting(remoteUrl),

      // Strategy 2: Load with different script attributes
      () => this.loadWithDifferentAttributes(remoteUrl),

      // Strategy 3: Use fetch and eval approach
      () => this.loadWithFetchAndEval(remoteUrl)
    ];

    for (const [index, strategy] of strategies.entries()) {
      try {
        console.log(`Trying strategy ${index + 1}...`);
        await strategy();

        if (window[remoteName] && typeof window[remoteName].get === 'function') {
          console.log(`✅ Strategy ${index + 1} successful`);
          return true;
        }
      } catch (error) {
        console.log(`❌ Strategy ${index + 1} failed:`, error.message);
      }
    }

    console.log('❌ All auto-fix strategies failed');
    return false;
  }

  static loadWithCacheBusting(url) {
    return new Promise((resolve, reject) => {
      const cacheBustedUrl = `${url}?cb=${Date.now()}`;
      const script = document.createElement('script');
      script.src = cacheBustedUrl;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  static loadWithDifferentAttributes(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.crossOrigin = 'anonymous';
      script.async = false;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  static async loadWithFetchAndEval(url) {
    const response = await fetch(url);
    const code = await response.text();
    eval(code);
  }
}

// Make available globally
window.RemoteLoadingDiagnostics = RemoteLoadingDiagnostics;
```

#### 2. Share Scope Resolution Issues

```javascript
// Share scope resolution debugging
class ShareScopeResolver {
  static diagnoseShareIssues() {
    console.group('🔍 Share Scope Diagnostics');
    const shareScopes = window.__webpack_share_scopes__ || {};
    const issues = [];

    // Check if share scopes exist
    if (Object.keys(shareScopes).length === 0) {
      issues.push({
        type: 'no-share-scopes',
        severity: 'high',
        message: 'No share scopes found. Ensure __webpack_init_sharing__ is called.'
      });
    }

    // Check for version conflicts
    Object.entries(shareScopes).forEach(([scopeName, scope]) => {
      Object.entries(scope).forEach(([moduleName, versions]) => {
        const versionEntries = Object.entries(versions);

        if (versionEntries.length > 1) {
          const loadedVersions = versionEntries.filter(([, info]) => info.loaded);
          const singletonVersions = versionEntries.filter(([, info]) => info.singleton);

          if (singletonVersions.length > 0 && loadedVersions.length > 1) {
            issues.push({
              type: 'singleton-violation',
              severity: 'high',
              message: `Singleton violation for ${moduleName} in ${scopeName}`,
              details: { loadedVersions: loadedVersions.map(([v]) => v) }
            });
          }

          if (versionEntries.length > 2) {
            issues.push({
              type: 'multiple-versions',
              severity: 'medium',
              message: `Multiple versions of ${moduleName} in ${scopeName}`,
              details: { versions: versionEntries.map(([v]) => v) }
            });
          }
        }
      });
    });

    // Display issues
    issues.forEach(issue => {
      const icon = issue.severity === 'high' ? '🔴' : '🟡';
      console.log(`${icon} ${issue.message}`);
      if (issue.details) {
        console.log('Details:', issue.details);
      }
    });

    if (issues.length === 0) {
      console.log('✅ No share scope issues detected');
    }

    console.groupEnd();
    return issues;
  }

  static resolveVersionConflict(moduleName, preferredVersion) {
    const shareScopes = window.__webpack_share_scopes__ || {};
    let resolved = false;

    Object.entries(shareScopes).forEach(([scopeName, scope]) => {
      if (scope[moduleName] && scope[moduleName][preferredVersion]) {
        // Mark preferred version as loaded
        scope[moduleName][preferredVersion].loaded = true;

        // Unload other versions
        Object.keys(scope[moduleName]).forEach(version => {
          if (version !== preferredVersion) {
            scope[moduleName][version].loaded = false;
          }
        });

        console.log(`✅ Resolved ${moduleName} to version ${preferredVersion} in ${scopeName}`);
        resolved = true;
      }
    });

    if (!resolved) {
      console.error(`❌ Could not resolve ${moduleName} to version ${preferredVersion}`);
    }

    return resolved;
  }

  static fixShareScopeInitialization() {
    console.log('🔧 Attempting to fix share scope initialization...');

    if (!window.__webpack_share_scopes__) {
      window.__webpack_share_scopes__ = { default: {} };
      console.log('✅ Created missing share scopes');
    }

    if (typeof window.__webpack_init_sharing__ !== 'function') {
      window.__webpack_init_sharing__ = function(shareScope) {
        console.log(`Initializing share scope: ${shareScope}`);
        if (!window.__webpack_share_scopes__[shareScope]) {
          window.__webpack_share_scopes__[shareScope] = {};
        }
        return Promise.resolve();
      };
      console.log('✅ Created missing __webpack_init_sharing__ function');
    }

    return true;
  }
}

window.ShareScopeResolver = ShareScopeResolver;
```

#### 3. Module Resolution Problems

```javascript
// Module resolution debugging utilities
class ModuleResolutionDebugger {
  static async testModuleResolution(remoteName, modulePath) {
    console.group(`🔍 Testing module resolution: ${remoteName}${modulePath}`);

    const steps = {
      remoteAvailable: false,
      containerInitialized: false,
      moduleExists: false,
      moduleLoadable: false,
      moduleExecutable: false
    };

    try {
      // Step 1: Check if remote is available
      steps.remoteAvailable = !!window[remoteName];
      console.log(`1️⃣ Remote available: ${steps.remoteAvailable}`);

      if (!steps.remoteAvailable) {
        console.error('❌ Remote not found. Check if remoteEntry.js loaded correctly.');
        console.groupEnd();
        return steps;
      }

      // Step 2: Check container initialization
      const container = window[remoteName];
      steps.containerInitialized = typeof container.get === 'function' && typeof container.init === 'function';
      console.log(`2️⃣ Container initialized: ${steps.containerInitialized}`);

      if (!steps.containerInitialized) {
        console.error('❌ Container not properly initialized.');

        // Try to initialize
        if (typeof container.init === 'function') {
          try {
            await container.init(window.__webpack_share_scopes__.default || {});
            console.log('✅ Container initialized successfully');
            steps.containerInitialized = true;
          } catch (error) {
            console.error('❌ Container initialization failed:', error);
          }
        }
      }

      if (!steps.containerInitialized) {
        console.groupEnd();
        return steps;
      }

      // Step 3: Check if module exists
      try {
        const factory = await container.get(modulePath);
        steps.moduleExists = !!factory;
        console.log(`3️⃣ Module exists: ${steps.moduleExists}`);

        if (steps.moduleExists) {
          // Step 4: Check if module is loadable
          try {
            const module = factory();
            steps.moduleLoadable = !!module;
            console.log(`4️⃣ Module loadable: ${steps.moduleLoadable}`);

            if (steps.moduleLoadable) {
              // Step 5: Check if module is executable
              if (typeof module.default === 'function' || typeof module.default === 'object') {
                steps.moduleExecutable = true;
                console.log(`5️⃣ Module executable: ${steps.moduleExecutable}`);
                console.log('Module content:', module);
              }
            }
          } catch (error) {
            console.error('❌ Module loading failed:', error);
          }
        }
      } catch (error) {
        console.error('❌ Module does not exist or failed to load:', error);
      }

    } catch (error) {
      console.error('❌ Resolution test failed:', error);
    }

    console.log('📊 Resolution Summary:', steps);
    console.groupEnd();
    return steps;
  }

  static listAvailableModules(remoteName) {
    console.group(`📦 Available modules in ${remoteName}`);

    const container = window[remoteName];
    if (!container) {
      console.error(`❌ Remote ${remoteName} not found`);
      console.groupEnd();
      return [];
    }

    // This is a heuristic approach since containers don't expose a module list
    const commonModulePaths = [
      './App',
      './Component',
      './Button',
      './Header',
      './Footer',
      './Navigation',
      './Layout',
      './utils',
      './constants',
      './hooks',
      './services'
    ];

    const availableModules = [];

    Promise.all(
      commonModulePaths.map(async (path) => {
        try {
          const factory = await container.get(path);
          if (factory) {
            availableModules.push(path);
            console.log(`✅ ${path}`);
          }
        } catch (error) {
          console.log(`❌ ${path} - Not available`);
        }
      })
    ).then(() => {
      console.log(`Found ${availableModules.length} available modules`);
      console.groupEnd();
    });

    return availableModules;
  }

  static generateModuleTest(remoteName, modulePath) {
    const testCode = `
// Auto-generated test for ${remoteName}${modulePath}
describe('${remoteName}${modulePath}', () => {
  let remoteModule;

  beforeAll(async () => {
    // Ensure container is available
    expect(window.${remoteName}).toBeDefined();
    expect(typeof window.${remoteName}.get).toBe('function');

    // Initialize container if needed
    if (typeof window.${remoteName}.init === 'function') {
      await window.${remoteName}.init(window.__webpack_share_scopes__.default || {});
    }
  });

  it('should load the module', async () => {
    const factory = await window.${remoteName}.get('${modulePath}');
    expect(factory).toBeDefined();
    expect(typeof factory).toBe('function');

    remoteModule = factory();
    expect(remoteModule).toBeDefined();
  });

  it('should have expected exports', () => {
    expect(remoteModule.default).toBeDefined();
    // Add more specific assertions based on your module
  });

  it('should render without errors', () => {
    // If it's a React component
    if (typeof remoteModule.default === 'function') {
      expect(() => {
        const element = React.createElement(remoteModule.default);
        // You can add actual rendering tests here
      }).not.toThrow();
    }
  });
});
    `;

    console.log('📝 Generated test code:');
    console.log(testCode);

    // Copy to clipboard if available
    if (navigator.clipboard) {
      navigator.clipboard.writeText(testCode).then(() => {
        console.log('✅ Test code copied to clipboard');
      });
    }

    return testCode;
  }
}

window.ModuleResolutionDebugger = ModuleResolutionDebugger;
```

### Error Investigation Methodologies

#### 1. Systematic Error Analysis

```javascript
// Systematic approach to federation error analysis
class FederationErrorAnalyzer {
  constructor() {
    this.errorPatterns = {
      'ChunkLoadError': {
        description: 'Failed to load a chunk/module',
        commonCauses: [
          'Network connectivity issues',
          'Incorrect remote URL',
          'CORS configuration problems',
          'Remote service unavailable'
        ],
        investigation: [
          'Check network tab for failed requests',
          'Verify remote URL accessibility',
          'Check CORS headers',
          'Test remote service availability'
        ]
      },
      'MODULE_NOT_FOUND': {
        description: 'Requested module not found in remote',
        commonCauses: [
          'Module path mismatch',
          'Module not exposed by remote',
          'Remote not properly initialized',
          'Version mismatch'
        ],
        investigation: [
          'Verify exposed modules in remote webpack config',
          'Check module path spelling',
          'Ensure remote container is initialized',
          'Verify share scope configuration'
        ]
      },
      'CONTAINER_INIT_ERROR': {
        description: 'Container initialization failed',
        commonCauses: [
          'Share scope conflicts',
          'Missing dependencies',
          'Version incompatibilities',
          'Circular dependencies'
        ],
        investigation: [
          'Check share scope configuration',
          'Verify all required dependencies are available',
          'Check for version conflicts',
          'Review dependency graph'
        ]
      }
    };

    this.setupErrorCapture();
  }

  setupErrorCapture() {
    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.analyzeError(event.error);
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.analyzeError(event.reason);
    });

    // Capture webpack-specific errors
    if (window.__webpack_require__) {
      const originalRequire = window.__webpack_require__;
      window.__webpack_require__ = function(moduleId) {
        try {
          return originalRequire.call(this, moduleId);
        } catch (error) {
          window.errorAnalyzer.analyzeError(error, { moduleId });
          throw error;
        }
      };
    }
  }

  analyzeError(error, context = {}) {
    console.group('🔍 Federation Error Analysis');
    console.error('Original error:', error);

    const analysis = {
      type: this.categorizeError(error),
      message: error.message || String(error),
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      suggestions: []
    };

    // Pattern matching
    Object.entries(this.errorPatterns).forEach(([pattern, info]) => {
      if (analysis.message.includes(pattern) || analysis.type === pattern) {
        console.log(`📋 Error Pattern: ${pattern}`);
        console.log(`Description: ${info.description}`);
        console.log('Common Causes:', info.commonCauses);
        console.log('Investigation Steps:', info.investigation);

        analysis.suggestions.push(...info.investigation);
      }
    });

    // Additional analysis
    this.performDeepAnalysis(analysis);

    console.log('📊 Analysis Summary:', analysis);
    console.groupEnd();

    // Store for debugging
    if (!window.federationErrorLog) {
      window.federationErrorLog = [];
    }
    window.federationErrorLog.push(analysis);

    return analysis;
  }

  categorizeError(error) {
    const message = error.message || String(error);

    if (message.includes('Loading chunk') || message.includes('ChunkLoadError')) {
      return 'ChunkLoadError';
    }

    if (message.includes('Module not found') || message.includes('Cannot resolve module')) {
      return 'MODULE_NOT_FOUND';
    }

    if (message.includes('Container') && message.includes('init')) {
      return 'CONTAINER_INIT_ERROR';
    }

    if (message.includes('shared module') || message.includes('singleton')) {
      return 'SHARE_SCOPE_ERROR';
    }

    return 'UNKNOWN';
  }

  performDeepAnalysis(analysis) {
    // Check current federation state
    console.log('🔬 Deep Analysis');

    // Remote availability
    const remotes = Object.keys(window).filter(key =>
      window[key] && typeof window[key].get === 'function'
    );
    console.log('Available remotes:', remotes);

    // Share scope state
    const shareScopes = window.__webpack_share_scopes__ || {};
    console.log('Share scopes:', Object.keys(shareScopes));

    // Recent network activity
    const recentRequests = performance.getEntriesByType('resource')
      .filter(entry => entry.startTime > Date.now() - 30000) // Last 30 seconds
      .filter(entry => entry.name.includes('remoteEntry') || entry.name.includes('.js'));

    console.log('Recent network requests:', recentRequests.map(r => ({
      url: r.name,
      status: r.responseStatus || 'unknown',
      duration: r.duration
    })));

    // Suggest specific fixes
    if (analysis.type === 'ChunkLoadError') {
      analysis.suggestions.push('Run window.RemoteLoadingDiagnostics.diagnoseRemoteFailure(remoteName, remoteUrl)');
    } else if (analysis.type === 'MODULE_NOT_FOUND') {
      analysis.suggestions.push('Run window.ModuleResolutionDebugger.testModuleResolution(remoteName, modulePath)');
    }
  }

  generateErrorReport() {
    const errorLog = window.federationErrorLog || [];

    const report = {
      summary: {
        totalErrors: errorLog.length,
        errorTypes: {},
        timeRange: errorLog.length > 0 ? {
          first: errorLog[0].timestamp,
          last: errorLog[errorLog.length - 1].timestamp
        } : null
      },
      errors: errorLog,
      systemInfo: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        federationState: {
          remotes: Object.keys(window).filter(key =>
            window[key] && typeof window[key].get === 'function'
          ),
          shareScopes: Object.keys(window.__webpack_share_scopes__ || {})
        }
      }
    };

    // Count error types
    errorLog.forEach(error => {
      report.summary.errorTypes[error.type] = (report.summary.errorTypes[error.type] || 0) + 1;
    });

    console.log('📋 Error Report Generated:', report);

    // Export as JSON
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `federation-error-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    return report;
  }
}

window.errorAnalyzer = new FederationErrorAnalyzer();
```
