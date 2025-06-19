const {
  describe,
  it,
  before,
  after,
  beforeEach,
  afterEach,
} = require('node:test');
const assert = require('node:assert');
const path = require('path');

// Import the HMR helpers
const {
  applyHotUpdateFromStringsByPatching,
} = require('@module-federation/node/utils/custom-hmr-helpers');
const { createHMRRuntime } = require('@module-federation/node/utils/hmr-runtime');

// Import main module
const {
  setUpdateProvider,
  createQueueUpdateProvider,
  createCallbackUpdateProvider,
  fetchUpdates,
  applyUpdates,
  startUpdatePolling,
  forceUpdate,
} = require('../examples/demo/index.js');

describe('HMR Integration Tests', () => {
  let mockWebpackRequire;
  let mockModule;
  let originalConsoleLog;
  let logMessages;

  before(() => {
    // Capture console.log for testing
    originalConsoleLog = console.log;
    logMessages = [];
    console.log = (...args) => {
      logMessages.push(args.join(' '));
      originalConsoleLog(...args);
    };
  });

  after(() => {
    // Restore console.log
    console.log = originalConsoleLog;
  });

  beforeEach(() => {
    logMessages = [];

    // Enhanced mock webpack require for integration testing
    mockWebpackRequire = {
      h: () => 'integration-test-hash',
      hmrS_readFileVm: {
        index: 0,
        main: 0,
        vendor: 0,
      },
      c: {
        './src/index.js': {
          id: './src/index.js',
          hot: {
            _selfAccepted: true,
            _selfInvalidated: false,
            status: () => 'idle',
            _disposeHandlers: [],
            _acceptedDependencies: {},
            _acceptedErrorHandlers: {},
            _declinedDependencies: {},
            _requireSelf: () => require('../examples/demo/index.js'),
            active: true,
          },
          parents: [],
          children: [],
        },
      },
      m: {
        './src/index.js': function (module, exports, require) {
          module.exports = require('../examples/demo/index.js');
        },
      },
      hmrD: {},
      hmrF: () => 'integration-test-hash',
      hmrI: {},
      hmrC: {},
      hmrM: null,
      o: (obj, key) => Object.prototype.hasOwnProperty.call(obj, key),
      f: {},
      setInMemoryManifest: null,
      setInMemoryChunk: null,
    };

    // Mock module with hot support
    mockModule = {
      hot: {
        status: () => 'idle',
        check: async (autoApply) => {
          if (autoApply) {
            return ['./src/index.js'];
          }
          return null;
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

    global.__webpack_require__ = mockWebpackRequire;
    global.module = mockModule;
  });

  afterEach(() => {
    delete global.__webpack_require__;
    delete global.module;
  });

  describe('HMR Helper Integration', () => {
    it('should inject in-memory HMR runtime', async () => {
      const manifestJson = JSON.stringify({
        h: 'test-hash',
        c: ['index'],
        r: [],
        m: ['./src/index.js'],
      });

      const chunkContent = `
        exports.modules = {
          './src/index.js': function(module, exports, require) {
            console.log('Updated module loaded via HMR helper');
            module.exports = { updated: true };
          }
        };
        exports.runtime = function(__webpack_require__) {
          console.log('Runtime update applied');
        };
      `;

      const chunkMap = { index: chunkContent };

      // Should not throw and should inject runtime
      await applyHotUpdateFromStringsByPatching(
        mockModule,
        mockWebpackRequire,
        manifestJson,
        chunkMap,
      );

      // Verify runtime was injected
      assert.ok(
        mockWebpackRequire.setInMemoryManifest,
        'Should have injected setInMemoryManifest',
      );
      assert.ok(
        mockWebpackRequire.setInMemoryChunk,
        'Should have injected setInMemoryChunk',
      );
    });

    it('should handle HMR with empty chunks', async () => {
      const manifestJson = JSON.stringify({
        h: 'empty-test-hash',
        c: [],
        r: [],
        m: [],
      });

      const chunkMap = {};

      // Should handle empty chunks gracefully
      await applyHotUpdateFromStringsByPatching(
        mockModule,
        mockWebpackRequire,
        manifestJson,
        chunkMap,
      );

      assert.ok(true, 'Should handle empty chunks without error');
    });

    it('should handle module.hot not available', async () => {
      const noHotModule = { hot: null };

      const manifestJson = JSON.stringify({ h: 'test', c: [], r: [], m: [] });
      const chunkMap = {};

      try {
        await applyHotUpdateFromStringsByPatching(
          noHotModule,
          mockWebpackRequire,
          manifestJson,
          chunkMap,
        );
        assert.fail('Should have thrown error for missing module.hot');
      } catch (error) {
        assert.ok(error.message.includes('Hot Module Replacement is disabled'));
      }
    });
  });

  describe('HMR Runtime Integration', () => {
    it('should create complete HMR runtime', () => {
      const installedChunks = { index: 0 };
      const inMemoryChunks = {};
      const manifestRef = { value: null };

      const runtime = createHMRRuntime(
        mockWebpackRequire,
        installedChunks,
        inMemoryChunks,
        manifestRef,
      );

      assert.ok(
        runtime.loadUpdateChunk,
        'Should have loadUpdateChunk function',
      );
      assert.ok(runtime.applyHandler, 'Should have applyHandler function');
      assert.ok(runtime.hmrHandlers, 'Should have hmrHandlers object');
      assert.ok(
        runtime.hmrManifestLoader,
        'Should have hmrManifestLoader function',
      );
      assert.ok(runtime.hmrHandlers.hmrI, 'Should have hmrI handler');
      assert.ok(runtime.hmrHandlers.hmrC, 'Should have hmrC handler');
    });

    it('should handle manifest loading from memory', async () => {
      const installedChunks = { index: 0 };
      const inMemoryChunks = {};
      const testManifest = { h: 'test', c: ['index'], r: [], m: [] };
      const manifestRef = { value: JSON.stringify(testManifest) };

      const runtime = createHMRRuntime(
        mockWebpackRequire,
        installedChunks,
        inMemoryChunks,
        manifestRef,
      );

      const manifest = await runtime.hmrManifestLoader();
      assert.deepStrictEqual(manifest, testManifest);
    });

    it('should handle chunk loading from memory', async () => {
      const installedChunks = { index: 0 };
      const testChunkContent = `
        exports.modules = {
          './test.js': function() { console.log('test'); }
        };
      `;
      const inMemoryChunks = { index: testChunkContent };
      const manifestRef = { value: null };

      const runtime = createHMRRuntime(
        mockWebpackRequire,
        installedChunks,
        inMemoryChunks,
        manifestRef,
      );

      // This should load the chunk from memory
      await runtime.loadUpdateChunk('index', []);
      assert.ok(true, 'Should load chunk from memory without error');
    });
  });

  describe('End-to-End Update Flow', () => {
    it('should complete full update cycle with queue provider', async () => {
      const testUpdate = {
        manifest: {
          h: 'e2e-test-hash',
          c: ['index'],
          r: [],
          m: ['./src/index.js'],
        },
        script: `
          exports.modules = {
            './src/index.js': function(module, exports, require) {
              console.log('E2E test update applied');
              module.exports = { e2eTest: true };
            }
          };
        `,
        originalInfo: {
          updateId: 'e2e-test-001',
          webpackHash: 'e2e-test-hash',
        },
      };

      // Set up queue provider
      const provider = createQueueUpdateProvider([testUpdate]);
      setUpdateProvider(provider);

      // Fetch update
      const fetchedUpdate = await fetchUpdates();
      assert.ok(fetchedUpdate.update, 'Should fetch update from queue');
      assert.strictEqual(
        fetchedUpdate.update.originalInfo.updateId,
        'e2e-test-001',
      );

      // Apply update (with mocked HMR)
      await applyUpdates(fetchedUpdate);

      // Verify logs show update was processed
      const hasUpdateLog = logMessages.some((msg) =>
        msg.includes('Applying update from provider'),
      );
      assert.ok(hasUpdateLog, 'Should log update application');
    });

    it('should handle complete polling cycle', async () => {
      let callCount = 0;
      const callbackProvider = createCallbackUpdateProvider(async (hash) => {
        callCount++;
        if (callCount === 1) {
          return {
            update: {
              manifest: { h: 'polling-hash', c: [], r: [], m: [] },
              script: 'console.log("Polling update");',
              originalInfo: {
                updateId: `polling-${callCount}`,
                webpackHash: 'polling-hash',
              },
            },
          };
        }
        return { update: null };
      });

      setUpdateProvider(callbackProvider);

      // Start polling with short interval
      const pollingInterval = await startUpdatePolling(50);

      // Wait for a few polling cycles
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Stop polling
      clearInterval(pollingInterval);

      // Should have been called multiple times
      assert.ok(
        callCount > 1,
        `Should have polled multiple times, got ${callCount} calls`,
      );
    });

    it('should handle force mode end-to-end', async () => {
      // Set provider that returns no updates
      setUpdateProvider(
        createCallbackUpdateProvider(async () => ({ update: null })),
      );

      // Force update should still work
      await forceUpdate();

      // Check logs for force update messages
      const hasForceLog = logMessages.some(
        (msg) =>
          msg.includes('Force mode') || msg.includes('Applying forced update'),
      );
      assert.ok(hasForceLog, 'Should log force mode messages');
    });

    it('should handle update provider errors gracefully', async () => {
      // Provider that throws errors
      const errorProvider = async () => {
        throw new Error('Simulated provider error');
      };
      setUpdateProvider(errorProvider);

      // Should not throw, but handle gracefully
      const result = await fetchUpdates();
      assert.deepStrictEqual(result, { update: null });

      // Check error was logged
      const hasErrorLog = logMessages.some((msg) =>
        msg.includes('Failed to fetch updates'),
      );
      assert.ok(hasErrorLog, 'Should log fetch error');
    });
  });

  describe('Multiple Provider Switching', () => {
    it('should switch between providers seamlessly', async () => {
      // Start with queue provider
      const update1 = {
        manifest: { h: 'hash1', c: [], r: [], m: [] },
        script: 'console.log("Update 1");',
        originalInfo: { updateId: 'switch-test-1' },
      };

      const queueProvider = createQueueUpdateProvider([update1]);
      setUpdateProvider(queueProvider);

      const result1 = await fetchUpdates();
      assert.strictEqual(result1.update.originalInfo.updateId, 'switch-test-1');

      // Switch to callback provider
      const callbackProvider = createCallbackUpdateProvider(async () => ({
        update: {
          manifest: { h: 'hash2', c: [], r: [], m: [] },
          script: 'console.log("Update 2");',
          originalInfo: { updateId: 'switch-test-2' },
        },
      }));
      setUpdateProvider(callbackProvider);

      const result2 = await fetchUpdates();
      assert.strictEqual(result2.update.originalInfo.updateId, 'switch-test-2');
    });

    it('should handle provider state isolation', async () => {
      // Create two queue providers with different states
      const provider1 = createQueueUpdateProvider([
        { manifest: {}, script: '', originalInfo: { updateId: 'p1-1' } },
        { manifest: {}, script: '', originalInfo: { updateId: 'p1-2' } },
      ]);

      const provider2 = createQueueUpdateProvider([
        { manifest: {}, script: '', originalInfo: { updateId: 'p2-1' } },
      ]);

      // Use provider1
      setUpdateProvider(provider1);
      const result1 = await fetchUpdates();
      assert.strictEqual(result1.update.originalInfo.updateId, 'p1-1');

      // Switch to provider2
      setUpdateProvider(provider2);
      const result2 = await fetchUpdates();
      assert.strictEqual(result2.update.originalInfo.updateId, 'p2-1');

      // Switch back to provider1 - should continue from where it left off
      setUpdateProvider(provider1);
      const result3 = await fetchUpdates();
      assert.strictEqual(result3.update.originalInfo.updateId, 'p1-2');
    });
  });
});
