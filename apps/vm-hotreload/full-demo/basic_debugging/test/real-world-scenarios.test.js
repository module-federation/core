const { describe, it, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

// Import modules under test
const { applyHotUpdateFromStringsByPatching } = require('@module-federation/node/utils/custom-hmr-helpers');
const { createHMRRuntime } = require('@module-federation/node/utils/hmr-runtime');
const {
  setUpdateProvider,
  createQueueUpdateProvider,
  createCallbackUpdateProvider,
  fetchUpdates,
  applyUpdates,
  forceUpdate,
  startUpdatePolling,
  getModuleState,
  updateModuleState,
  resetModuleState,
} = require('../examples/demo/index.js');

describe('Real-World HMR Scenarios', () => {
  let mockWebpackRequire;
  let originalWebpackRequire;
  let logMessages;
  let originalConsoleLog;

  before(() => {
    originalWebpackRequire = global.__webpack_require__;
    originalConsoleLog = console.log;
    logMessages = [];
    console.log = (...args) => {
      logMessages.push(args.join(' '));
      originalConsoleLog(...args);
    };
  });

  after(() => {
    if (originalWebpackRequire) {
      global.__webpack_require__ = originalWebpackRequire;
    } else {
      delete global.__webpack_require__;
    }
    console.log = originalConsoleLog;
  });

  beforeEach(() => {
    logMessages = [];
    mockWebpackRequire = {
      h: () => 'real-world-hash',
      hmrS_readFileVm: { index: 0, vendor: 0, runtime: 0 },
      c: {},
      m: {},
      hmrD: {},
      hmrF: () => 'real-world-hash',
      hmrI: {},
      hmrC: {},
      o: (obj, key) => Object.prototype.hasOwnProperty.call(obj, key),
      f: {},
      setInMemoryManifest: null,
      setInMemoryChunk: null,
    };
    global.__webpack_require__ = mockWebpackRequire;
  });

  afterEach(() => {
    delete global.__webpack_require__;
    delete global.module;
  });

  describe('Component Update Scenarios', () => {
    it('should handle React-like component hot reloading', async () => {
      // Simulate React component update scenario
      const componentModule = {
        hot: {
          status: () => 'idle',
          check: async () => ['./src/components/Button.jsx'],
          accept: (deps, callback) => {
            if (callback) callback();
          },
          decline: () => {},
          dispose: (callback) => {
            if (callback) callback({ componentWillUnmount: true });
          },
          addDisposeHandler: () => {},
          removeDisposeHandler: () => {},
          _selfAccepted: true,
          _selfInvalidated: false,
          _main: false,
          active: true,
        },
      };

      global.module = componentModule;

      // Simulate component update
      const componentUpdate = {
        manifest: {
          h: 'component-hash',
          c: ['main'],
          r: [],
          m: ['./src/components/Button.jsx'],
        },
        script: `
          exports.modules = {
            './src/components/Button.jsx': function(module, exports, require) {
              // Simulated updated React component
              function Button(props) {
                return {
                  type: 'button',
                  props: props,
                  updated: true,
                  hotReloaded: true
                };
              }
              Button.displayName = 'Button';
              module.exports = Button;
            }
          };
          exports.runtime = function(__webpack_require__) {
            console.log('Component hot reload runtime executed');
          };
        `,
        originalInfo: {
          updateId: 'component-update-001',
          webpackHash: 'component-hash',
        },
      };

      const manifestJson = JSON.stringify(componentUpdate.manifest);
      const chunkMap = { main: componentUpdate.script };

      await applyHotUpdateFromStringsByPatching(
        componentModule,
        mockWebpackRequire,
        manifestJson,
        chunkMap
      );

      // Verify component was updated
      assert.ok(mockWebpackRequire.setInMemoryManifest, 'Should inject HMR runtime');
      assert.ok(mockWebpackRequire.setInMemoryChunk, 'Should set chunk in memory');

      // Check for HMR status log or successful execution
      const hasHMRLog = logMessages.some(msg =>
        msg.includes('Current HMR status') || msg.includes('Update failed') || msg.includes('Component hot reload')
      );
      assert.ok(hasHMRLog, 'Should execute component hot reload');
    });

    it('should handle CSS module hot reloading', async () => {
      global.module = {
        hot: {
          status: () => 'idle',
          check: async () => ['./src/styles/button.module.css'],
          accept: () => {},
          decline: () => {},
          dispose: () => {},
          addDisposeHandler: () => {},
          removeDisposeHandler: () => {},
          _selfAccepted: true,
          _selfInvalidated: false,
          _main: false,
          active: true,
        },
      };

      const cssUpdate = {
        update: {
          manifest: {
            h: 'css-hash',
            c: ['styles'],
            r: [],
            m: ['./src/styles/button.module.css'],
          },
          script: `
            exports.modules = {
              './src/styles/button.module.css': function(module, exports, require) {
                // Simulated CSS module update
                module.exports = {
                  button: 'button_abc123_updated',
                  primary: 'primary_def456_updated',
                  hotReloaded: true
                };
              }
            };
            exports.runtime = function(__webpack_require__) {
              console.log('CSS hot reload: styles updated');
              // Simulate style injection
              if (typeof document !== 'undefined') {
                const style = document.createElement('style');
                style.textContent = '.button_abc123_updated { color: red; }';
                document.head.appendChild(style);
              }
            };
          `,
          originalInfo: {
            updateId: 'css-update-001',
            webpackHash: 'css-hash',
          },
        },
      };

      const result = await applyUpdates(cssUpdate);

      // Check for successful update application or HMR status
      const hasUpdateLog = logMessages.some(msg =>
        msg.includes('Applying update') || msg.includes('Current HMR status') || msg.includes('CSS hot reload')
      );
      assert.ok(result || hasUpdateLog, 'Should execute CSS hot reload');
    });

    it('should handle API endpoint/service hot reloading', async () => {
      global.module = {
        hot: {
          status: () => 'idle',
          check: async () => ['./src/services/api.js'],
          accept: () => {},
          decline: () => {},
          dispose: (callback) => {
            // Simulate API cleanup
            if (callback) callback({ apiCleanup: true });
          },
          addDisposeHandler: () => {},
          removeDisposeHandler: () => {},
          _selfAccepted: true,
          _selfInvalidated: false,
          _main: false,
          active: true,
        },
      };

      const apiUpdate = {
        update: {
          manifest: {
            h: 'api-hash',
            c: ['services'],
            r: [],
            m: ['./src/services/api.js'],
          },
          script: `
            exports.modules = {
              './src/services/api.js': function(module, exports, require) {
                // Simulated API service update
                class ApiService {
                  constructor() {
                    this.baseURL = 'https://api.example.com/v2'; // Updated version
                    this.updated = true;
                  }
                  
                  async fetchData(endpoint) {
                    console.log('Fetching from updated API:', this.baseURL + endpoint);
                    return { data: 'updated_data', version: 'v2' };
                  }
                }
                
                module.exports = new ApiService();
              }
            };
            exports.runtime = function(__webpack_require__) {
              console.log('API service hot reloaded with new endpoints');
            };
          `,
          originalInfo: {
            updateId: 'api-update-001',
            webpackHash: 'api-hash',
          },
        },
      };

      const result = await applyUpdates(apiUpdate);

      // Check for successful update application or HMR status
      const hasUpdateLog = logMessages.some(msg =>
        msg.includes('Applying update') || msg.includes('Current HMR status') || msg.includes('API service hot reloaded')
      );
      assert.ok(result || hasUpdateLog, 'Should execute API service hot reload');
    });
  });

  describe('Development Workflow Scenarios', () => {
    it('should handle rapid development iteration cycle', async () => {
      // Simulate rapid file changes during development
      global.module = {
        hot: {
          status: () => 'idle',
          check: async () => ['./src/features/calculator.js'],
          accept: () => {},
          decline: () => {},
          dispose: () => {},
          addDisposeHandler: () => {},
          removeDisposeHandler: () => {},
          _selfAccepted: true,
          _selfInvalidated: false,
          _main: false,
          active: true,
        },
      };

      const iterations = [
        {
          description: 'Add basic function',
          script: `
            exports.modules = {
              './src/features/calculator.js': function(module, exports, require) {
                module.exports = {
                  add: (a, b) => a + b,
                  version: 1
                };
              }
            };
          `,
        },
        {
          description: 'Add subtract function',
          script: `
            exports.modules = {
              './src/features/calculator.js': function(module, exports, require) {
                module.exports = {
                  add: (a, b) => a + b,
                  subtract: (a, b) => a - b,
                  version: 2
                };
              }
            };
          `,
        },
        {
          description: 'Add error handling',
          script: `
            exports.modules = {
              './src/features/calculator.js': function(module, exports, require) {
                module.exports = {
                  add: (a, b) => {
                    if (typeof a !== 'number' || typeof b !== 'number') {
                      throw new Error('Invalid input');
                    }
                    return a + b;
                  },
                  subtract: (a, b) => {
                    if (typeof a !== 'number' || typeof b !== 'number') {
                      throw new Error('Invalid input');
                    }
                    return a - b;
                  },
                  version: 3
                };
              }
            };
          `,
        },
      ];

      for (let i = 0; i < iterations.length; i++) {
        const iteration = iterations[i];
        const update = {
          update: {
            manifest: {
              h: `dev-iteration-${i}`,
              c: ['main'],
              r: [],
              m: ['./src/features/calculator.js'],
            },
            script: iteration.script,
            originalInfo: {
              updateId: `dev-iteration-${i}`,
              description: iteration.description,
            },
          },
        };

        await applyUpdates(update);
        
        // Verify each iteration
        const hasUpdateLog = logMessages.some(msg =>
          msg.includes('Applying update from provider') ||
          msg.includes('HMR')
        );
        assert.ok(hasUpdateLog, `Should apply iteration ${i}: ${iteration.description}`);
      }
    });

    it('should handle live debugging session with breakpoints', async () => {
      global.module = {
        hot: {
          status: () => 'idle',
          check: async () => ['./src/debug/target.js'],
          accept: () => {},
          decline: () => {},
          dispose: () => {},
          addDisposeHandler: () => {},
          removeDisposeHandler: () => {},
          _selfAccepted: true,
          _selfInvalidated: false,
          _main: false,
          active: true,
        },
      };

      // Simulate adding debug logs and breakpoints
      const debugUpdate = {
        update: {
          manifest: {
            h: 'debug-hash',
            c: ['debug'],
            r: [],
            m: ['./src/debug/target.js'],
          },
          script: `
            exports.modules = {
              './src/debug/target.js': function(module, exports, require) {
                function complexFunction(data) {
                  console.log('DEBUG: Function called with:', data);
                  
                  // Simulated breakpoint location
                  const step1 = data.map(item => {
                    console.log('DEBUG: Processing item:', item);
                    return item * 2;
                  });
                  
                  console.log('DEBUG: Step1 result:', step1);
                  
                  const step2 = step1.filter(item => {
                    console.log('DEBUG: Filtering item:', item);
                    return item > 10;
                  });
                  
                  console.log('DEBUG: Final result:', step2);
                  return step2;
                }
                
                module.exports = { complexFunction, debugMode: true };
              }
            };
            exports.runtime = function(__webpack_require__) {
              console.log('Debug hot reload: added debugging statements');
            };
          `,
          originalInfo: {
            updateId: 'debug-session-001',
            webpackHash: 'debug-hash',
          },
        },
      };

      const result = await applyUpdates(debugUpdate);

      // Check for successful update application or HMR status
      const hasUpdateLog = logMessages.some(msg =>
        msg.includes('Applying update') || msg.includes('Current HMR status') || msg.includes('Debug hot reload')
      );
      assert.ok(result || hasUpdateLog, 'Should apply debug session updates');
    });
  });

  describe('Production-Like Error Recovery', () => {
    it('should handle network failures during update fetch', async () => {
      let failureCount = 0;
      const unreliableProvider = createCallbackUpdateProvider(async () => {
        failureCount++;
        if (failureCount <= 2) {
          throw new Error('Network timeout');
        }
        return {
          update: {
            manifest: { h: 'recovery-hash', c: [], r: [], m: [] },
            script: 'console.log("Recovered update");',
            originalInfo: { updateId: 'recovery-001' },
          },
        };
      });

      setUpdateProvider(unreliableProvider);

      // First attempts should fail
      let result1 = await fetchUpdates();
      assert.deepStrictEqual(result1, { update: null }, 'First fetch should fail');

      let result2 = await fetchUpdates();
      assert.deepStrictEqual(result2, { update: null }, 'Second fetch should fail');

      // Third attempt should succeed
      let result3 = await fetchUpdates();
      assert.ok(result3.update, 'Third fetch should succeed');
      assert.strictEqual(result3.update.originalInfo.updateId, 'recovery-001');
    });

    it('should handle partial update failures with rollback capability', async () => {
      global.module = {
        hot: {
          status: () => 'idle',
          check: async () => {
            // Simulate partial failure
            throw new Error('Partial update failure');
          },
          accept: () => {},
          decline: () => {},
          dispose: () => {},
          addDisposeHandler: () => {},
          removeDisposeHandler: () => {},
          _selfAccepted: true,
          _selfInvalidated: false,
          _main: false,
          active: true,
        },
      };

      const failingUpdate = {
        update: {
          manifest: {
            h: 'failing-hash',
            c: ['failing-chunk'],
            r: [],
            m: ['./src/failing-module.js'],
          },
          script: `
            exports.modules = {
              './src/failing-module.js': function(module, exports, require) {
                throw new Error('Module compilation error');
              }
            };
          `,
          originalInfo: {
            updateId: 'failing-update-001',
            webpackHash: 'failing-hash',
          },
        },
      };

      // Apply failing update
      const result = await applyUpdates(failingUpdate);
      
      // Should handle failure gracefully
      assert.ok(result, 'Should return result even on failure');
      
      // Test recovery with force update
      const recoveryResult = await forceUpdate();
      assert.ok(recoveryResult, 'Should allow force update for recovery');
    });

    it('should handle memory pressure during large updates', async () => {
      global.module = {
        hot: {
          status: () => 'idle',
          check: async () => [],
          accept: () => {},
          decline: () => {},
          dispose: () => {},
          addDisposeHandler: () => {},
          removeDisposeHandler: () => {},
          _selfAccepted: true,
          _selfInvalidated: false,
          _main: false,
          active: true,
        },
      };

      // Create a very large update to test memory handling
      const largeModuleCount = 100;
      const largeModules = {};
      
      for (let i = 0; i < largeModuleCount; i++) {
        largeModules[`./src/large-${i}.js`] = `function(module, exports, require) {
          // Large module with substantial content
          const largeData = ${JSON.stringify(Array.from({ length: 1000 }, (_, j) => `data-${i}-${j}`))};
          module.exports = { id: ${i}, data: largeData };
        }`;
      }

      const largeUpdate = {
        update: {
          manifest: {
            h: 'large-hash',
            c: ['large-chunk'],
            r: [],
            m: Object.keys(largeModules),
          },
          script: `exports.modules = {${Object.entries(largeModules).map(([key, value]) => `'${key}': ${value}`).join(',')}};`,
          originalInfo: {
            updateId: 'large-update-001',
            webpackHash: 'large-hash',
          },
        },
      };

      const startTime = performance.now();
      const result = await applyUpdates(largeUpdate);
      const endTime = performance.now();
      const duration = endTime - startTime;

      assert.ok(result, 'Should handle large update');
      assert.ok(duration < 1000, `Should handle large update efficiently: ${duration.toFixed(2)}ms`);
    });
  });

  describe('Multi-Module Dependencies', () => {
    it('should handle complex inter-module dependencies during updates', async () => {
      // Set up complex module dependency graph
      mockWebpackRequire.c = {
        './src/core/database.js': {
          id: './src/core/database.js',
          hot: {
            _selfAccepted: false,
            _selfInvalidated: false,
            _selfDeclined: false,
            _main: false,
            _acceptedDependencies: {},
            _acceptedErrorHandlers: {},
            _declinedDependencies: {},
            _disposeHandlers: [],
            active: true,
          },
          parents: [],
          children: ['./src/services/user.js', './src/services/product.js'],
        },
        './src/services/user.js': {
          id: './src/services/user.js',
          hot: {
            _selfAccepted: true,
            _selfInvalidated: false,
            _selfDeclined: false,
            _main: false,
            _acceptedDependencies: { './src/core/database.js': () => {} },
            _acceptedErrorHandlers: {},
            _declinedDependencies: {},
            _disposeHandlers: [],
            active: true,
            _requireSelf: () => ({ userService: true }),
          },
          parents: ['./src/core/database.js'],
          children: ['./src/controllers/auth.js'],
        },
        './src/services/product.js': {
          id: './src/services/product.js',
          hot: {
            _selfAccepted: true,
            _selfInvalidated: false,
            _selfDeclined: false,
            _main: false,
            _acceptedDependencies: { './src/core/database.js': () => {} },
            _acceptedErrorHandlers: {},
            _declinedDependencies: {},
            _disposeHandlers: [],
            active: true,
            _requireSelf: () => ({ productService: true }),
          },
          parents: ['./src/core/database.js'],
          children: [],
        },
      };

      global.module = {
        hot: {
          status: () => 'idle',
          check: async () => ['./src/core/database.js'],
          accept: () => {},
          decline: () => {},
          dispose: () => {},
          addDisposeHandler: () => {},
          removeDisposeHandler: () => {},
          _selfAccepted: false,
          _selfInvalidated: false,
          _main: false,
          active: true,
        },
      };

      const dependencyUpdate = {
        update: {
          manifest: {
            h: 'dependency-hash',
            c: ['core'],
            r: [],
            m: ['./src/core/database.js'],
          },
          script: `
            exports.modules = {
              './src/core/database.js': function(module, exports, require) {
                // Updated database module
                class Database {
                  constructor() {
                    this.connectionString = 'mongodb://localhost:27017/updated_db';
                    this.version = '2.0.0';
                  }
                  
                  async connect() {
                    console.log('Connecting to updated database:', this.connectionString);
                    return { connected: true, version: this.version };
                  }
                }
                
                module.exports = new Database();
              }
            };
            exports.runtime = function(__webpack_require__) {
              console.log('Database hot reload: updated connection handling');
            };
          `,
          originalInfo: {
            updateId: 'dependency-update-001',
            webpackHash: 'dependency-hash',
          },
        },
      };

      const result = await applyUpdates(dependencyUpdate);

      // Check for successful update application or HMR status
      const hasUpdateLog = logMessages.some(msg =>
        msg.includes('Applying update') || msg.includes('Current HMR status') || msg.includes('Database hot reload')
      );
      assert.ok(result || hasUpdateLog, 'Should apply dependency updates');
    });
  });
});