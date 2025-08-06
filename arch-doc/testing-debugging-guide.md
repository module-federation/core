# Module Federation Testing & Debugging Guide

A comprehensive guide for testing and debugging Module Federation applications across different bundlers and runtime environments.

## Table of Contents
- [Module Federation Testing Strategies](#module-federation-testing-strategies)
- [Debugging Techniques](#debugging-techniques)
- [Development Tools Integration](#development-tools-integration)
- [Common Issues and Solutions](#common-issues-and-solutions)
- [Performance Debugging](#performance-debugging)
- [Advanced Debugging Techniques](#advanced-debugging-techniques)

## Module Federation Testing Strategies

### Unit Testing Patterns for Federated Modules

#### 1. Testing Exposed Modules in Isolation

```javascript
// remote-module.test.js
import { render, screen } from '@testing-library/react';
import RemoteComponent from '../src/components/RemoteComponent';

describe('RemoteComponent', () => {
  it('should render correctly', () => {
    render(<RemoteComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should handle props properly', () => {
    const mockCallback = jest.fn();
    render(<RemoteComponent onAction={mockCallback} />);
    // Test component behavior
  });
});
```

#### 2. Testing Shared Dependencies

```javascript
// shared-module.test.js
describe('Shared Module Behavior', () => {
  beforeEach(() => {
    // Reset shared state before each test
    if (window.__webpack_share_scopes__) {
      delete window.__webpack_share_scopes__.default;
    }
  });

  it('should use correct shared dependency version', async () => {
    // Mock share scope for testing
    window.__webpack_share_scopes__ = {
      default: {
        'react': {
          '18.0.0': {
            get: () => () => React,
            loaded: true
          }
        }
      }
    };

    const module = await import('./component-using-shared-react');
    expect(module.default).toBeDefined();
  });
});
```

#### 3. Testing Module Federation Configuration

```javascript
// webpack-config.test.js
const webpackConfig = require('../webpack.config.js');

describe('Module Federation Configuration', () => {
  it('should have correct remote entries', () => {
    const mfPlugin = webpackConfig.plugins.find(
      plugin => plugin.constructor.name === 'ModuleFederationPlugin'
    );
    
    expect(mfPlugin.options.remotes).toEqual({
      'shell': 'shell@http://localhost:3001/remoteEntry.js',
      'mfapp01': 'mfapp01@http://localhost:3002/remoteEntry.js'
    });
  });

  it('should expose correct modules', () => {
    const mfPlugin = webpackConfig.plugins.find(
      plugin => plugin.constructor.name === 'ModuleFederationPlugin'
    );
    
    expect(mfPlugin.options.exposes).toHaveProperty('./Component');
  });
});
```

### Integration Testing Across Federation Boundaries

#### 1. Cross-Federation Integration Tests

```javascript
// integration.test.js
import { act, render, screen } from '@testing-library/react';

describe('Cross-Federation Integration', () => {
  let mockRemoteEntry;

  beforeEach(() => {
    // Mock remote entry loading
    mockRemoteEntry = {
      get: jest.fn().mockResolvedValue({
        './Component': () => React.createElement('div', {}, 'Mocked Remote Component')
      }),
      init: jest.fn().mockResolvedValue(undefined)
    };

    // Mock dynamic import for remote modules
    global.__webpack_require__ = {
      e: jest.fn().mockResolvedValue(undefined),
      t: jest.fn((module) => module)
    };

    window.shell = mockRemoteEntry;
  });

  it('should load and render remote component', async () => {
    const RemoteWrapper = React.lazy(() => 
      import('shell/Component').catch(() => ({
        default: () => <div>Fallback Component</div>
      }))
    );

    await act(async () => {
      render(
        <React.Suspense fallback={<div>Loading...</div>}>
          <RemoteWrapper />
        </React.Suspense>
      );
    });

    expect(screen.getByText('Mocked Remote Component')).toBeInTheDocument();
  });
});
```

#### 2. Testing Federation Error Boundaries

```javascript
// error-boundary.test.js
import { render, screen } from '@testing-library/react';
import FederationErrorBoundary from '../src/components/FederationErrorBoundary';

describe('FederationErrorBoundary', () => {
  const ThrowError = ({ shouldThrow }) => {
    if (shouldThrow) {
      throw new Error('Remote module failed to load');
    }
    return <div>Success</div>;
  };

  it('should catch remote module loading errors', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(
      <FederationErrorBoundary fallback={<div>Error occurred</div>}>
        <ThrowError shouldThrow={true} />
      </FederationErrorBoundary>
    );

    expect(screen.getByText('Error occurred')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
```

### End-to-End Testing for Federated Applications

#### 1. Playwright E2E Tests

```javascript
// e2e/federation.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Module Federation E2E', () => {
  test('should load host and remote applications', async ({ page }) => {
    // Start with host application
    await page.goto('http://localhost:3000');
    
    // Verify host app loaded
    await expect(page.locator('[data-testid="host-app"]')).toBeVisible();
    
    // Click button that loads remote component
    await page.click('[data-testid="load-remote"]');
    
    // Wait for remote component to load
    await page.waitForSelector('[data-testid="remote-component"]');
    
    // Verify remote component rendered
    await expect(page.locator('[data-testid="remote-component"]')).toBeVisible();
  });

  test('should handle remote loading failures gracefully', async ({ page }) => {
    // Block remote entry requests
    await page.route('**/remoteEntry.js', route => route.abort());
    
    await page.goto('http://localhost:3000');
    await page.click('[data-testid="load-remote"]');
    
    // Verify fallback component is shown
    await expect(page.locator('[data-testid="fallback-component"]')).toBeVisible();
  });

  test('should share dependencies correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Load remote component
    await page.click('[data-testid="load-remote"]');
    await page.waitForSelector('[data-testid="remote-component"]');
    
    // Check that shared React instance is used
    const sharedReactVersion = await page.evaluate(() => {
      return window.React?.version;
    });
    
    expect(sharedReactVersion).toBeDefined();
  });
});
```

#### 2. Multi-Browser Federation Testing

```javascript
// e2e/multi-browser.spec.js
const { test, expect, devices } = require('@playwright/test');

['chromium', 'firefox', 'webkit'].forEach(browserName => {
  test.describe(`Federation on ${browserName}`, () => {
    test.use({ ...devices['Desktop ' + browserName] });
    
    test('should work across browsers', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await page.click('[data-testid="load-remote"]');
      
      await expect(page.locator('[data-testid="remote-component"]')).toBeVisible();
    });
  });
});
```

### Mock Strategies for Remote Modules During Testing

#### 1. Jest Module Federation Mocks

```javascript
// __mocks__/remote-modules.js
export const mockRemoteComponent = {
  './Component': () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'mocked-remote' }, 'Mocked Component');
  }
};

// Setup file: jest.setup.js
global.__webpack_init_sharing__ = jest.fn().mockResolvedValue(undefined);
global.__webpack_share_scopes__ = { default: {} };

// Mock dynamic imports for remote modules
jest.mock('shell/Component', () => ({
  default: () => <div data-testid="mocked-remote">Mocked Component</div>
}), { virtual: true });
```

#### 2. MSW (Mock Service Worker) for Remote Entries

```javascript
// mocks/handlers.js
import { rest } from 'msw';

export const handlers = [
  rest.get('http://localhost:3001/remoteEntry.js', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.set('Content-Type', 'application/javascript'),
      ctx.text(`
        (function() {
          var moduleMap = {
            "./Component": function() {
              return Promise.resolve({
                default: function() {
                  return React.createElement('div', {}, 'Mocked Remote Component');
                }
              });
            }
          };
          
          window.shell = {
            get: function(module) {
              return moduleMap[module]();
            },
            init: function() {
              return Promise.resolve();
            }
          };
        })();
      `)
    );
  })
];
```

#### 3. Dynamic Mock Loading

```javascript
// test-utils/federation-mocks.js
export class FederationMockRegistry {
  constructor() {
    this.mocks = new Map();
  }

  registerMock(remoteName, modulePath, mockImplementation) {
    const key = `${remoteName}${modulePath}`;
    this.mocks.set(key, mockImplementation);
  }

  getMock(remoteName, modulePath) {
    const key = `${remoteName}${modulePath}`;
    return this.mocks.get(key);
  }

  setupMocks() {
    const originalImport = window.__webpack_require__;
    
    window.__webpack_require__ = (moduleId) => {
      // Check if this is a federated module
      if (moduleId.includes('/')) {
        const [remoteName, modulePath] = moduleId.split('/', 2);
        const mock = this.getMock(remoteName, `/${modulePath}`);
        
        if (mock) {
          return Promise.resolve({ default: mock });
        }
      }
      
      return originalImport ? originalImport(moduleId) : Promise.reject(new Error(`Module not found: ${moduleId}`));
    };
  }
}

// Usage in tests
const mockRegistry = new FederationMockRegistry();
mockRegistry.registerMock('shell', '/Component', () => <div>Mock Component</div>);
mockRegistry.setupMocks();
```

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

      // Check for singleton violations
      versionEntries.forEach(([version, info]) => {
        if (info.singleton && versionEntries.length > 1) {
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

This comprehensive testing and debugging guide provides developers with practical tools and techniques to effectively test and debug Module Federation applications. The guide covers everything from unit testing patterns to advanced performance profiling, making it easier to build robust federated applications across different bundlers and environments.

Use these debugging utilities by copying the relevant code snippets into your browser console or integrating them into your development workflow. Remember to remove or disable debugging code in production environments.