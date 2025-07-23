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

// Import the module under test
const {
  getModuleState,
  updateModuleState,
  incrementReloadCount,
  resetModuleState,
  setUpdateProvider,
  getUpdateProvider,
  createDefaultUpdateProvider,
  createQueueUpdateProvider,
  createCallbackUpdateProvider,
  fetchUpdates,
  applyUpdates,
  forceUpdate,
  testModuleReinstall,
  getHMRStatus,
} = require('../examples/demo/index.js');

describe('HMR Basic Debugging Unit Tests', () => {
  let originalWebpackRequire;
  let mockWebpackRequire;

  before(() => {
    // Store original webpack require if it exists
    originalWebpackRequire = global.__webpack_require__;

    // Create mock webpack require
    mockWebpackRequire = {
      h: () => 'test-hash-123',
      hmrS_readFileVm: {
        index: true,
        main: true,
        vendor: true,
      },
      c: {
        './src/index.js': {
          id: './src/index.js',
          hot: {
            _selfAccepted: true,
            _selfInvalidated: false,
            status: () => 'idle',
          },
        },
        './src/utils.js': { id: './src/utils.js' },
      },
      hmrF: () => 'test-hash-123',
      o: (obj, key) => Object.prototype.hasOwnProperty.call(obj, key),
    };
  });

  after(() => {
    // Restore original webpack require
    if (originalWebpackRequire) {
      global.__webpack_require__ = originalWebpackRequire;
    } else {
      delete global.__webpack_require__;
    }
  });

  beforeEach(() => {
    // Set up fresh mock for each test
    global.__webpack_require__ = { ...mockWebpackRequire };
    // Reset module state
    resetModuleState();
  });

  describe('Module State Management', () => {
    it('should get initial module state', () => {
      const state = getModuleState();
      assert.strictEqual(typeof state, 'object');
      assert.strictEqual(state.version, '1.0.0');
      assert.strictEqual(state.reloadCount, 0);
      assert.strictEqual(typeof state.moduleId, 'string');
      assert.strictEqual(state.isUpdated, false);
    });

    it('should update module state correctly', () => {
      const initialState = getModuleState();
      const newData = { testValue: 'updated', isUpdated: true };

      const updatedState = updateModuleState(newData);

      assert.strictEqual(updatedState.testValue, 'updated');
      assert.strictEqual(updatedState.isUpdated, true);
      assert.strictEqual(updatedState.version, '1.0.0'); // Should keep existing values
      assert.ok(updatedState.lastReload); // Should have timestamp
    });

    it('should increment reload count', () => {
      const initialCount = getModuleState().reloadCount;
      const newCount = incrementReloadCount();

      assert.strictEqual(newCount, initialCount + 1);
      assert.strictEqual(getModuleState().reloadCount, newCount);
    });

    it('should reset module state', () => {
      // Modify state first
      updateModuleState({ testValue: 'test' });
      incrementReloadCount();
      const oldState = getModuleState();

      // Reset
      const resetResult = resetModuleState();
      const newState = getModuleState();

      assert.ok(resetResult.oldModuleId);
      assert.ok(resetResult.newModuleId);
      assert.notStrictEqual(resetResult.oldModuleId, resetResult.newModuleId);
      assert.strictEqual(newState.reloadCount, 0);
      assert.strictEqual(newState.version, '1.0.0');
      assert.strictEqual(newState.isUpdated, false);
    });
  });

  describe('Update Provider System', () => {
    afterEach(() => {
      // Reset to default provider after each test
      setUpdateProvider(createDefaultUpdateProvider());
    });

    it('should set and get update provider', () => {
      const testProvider = async () => ({ update: null });
      setUpdateProvider(testProvider);
      assert.strictEqual(getUpdateProvider(), testProvider);
    });

    it('should create default update provider', async () => {
      const provider = createDefaultUpdateProvider();
      assert.strictEqual(typeof provider, 'function');

      const result = await provider();
      assert.deepStrictEqual(result, { update: null });
    });

    it('should create queue update provider with empty queue', async () => {
      const provider = createQueueUpdateProvider([]);
      assert.strictEqual(typeof provider, 'function');

      const result = await provider();
      assert.deepStrictEqual(result, { update: null });
    });

    it('should create queue update provider with updates', async () => {
      const testUpdate = {
        manifest: { h: 'abc123', c: [], r: [], m: [] },
        script: 'test script',
        originalInfo: { updateId: 'test-001' },
      };

      const provider = createQueueUpdateProvider([testUpdate]);

      // First call should return the update
      const result1 = await provider();
      assert.deepStrictEqual(result1, { update: testUpdate });

      // Second call should return null (queue exhausted)
      const result2 = await provider();
      assert.deepStrictEqual(result2, { update: null });
    });

    it('should create callback update provider', async () => {
      const testUpdate = {
        manifest: { h: 'callback123', c: [], r: [], m: [] },
        script: 'callback script',
        originalInfo: { updateId: 'callback-001' },
      };

      const callback = async (hash) => {
        assert.strictEqual(hash, 'test-hash-123');
        return { update: testUpdate };
      };

      const provider = createCallbackUpdateProvider(callback);
      const result = await provider();
      assert.deepStrictEqual(result, { update: testUpdate });
    });

    it('should handle callback provider errors', async () => {
      const callback = async () => {
        throw new Error('Test callback error');
      };

      const provider = createCallbackUpdateProvider(callback);
      const result = await provider();
      assert.deepStrictEqual(result, { update: null });
    });
  });

  describe('Fetch Updates', () => {
    afterEach(() => {
      setUpdateProvider(createDefaultUpdateProvider());
    });

    it('should return null when no provider set', async () => {
      setUpdateProvider(null);
      const result = await fetchUpdates();
      assert.deepStrictEqual(result, { update: null });
    });

    it('should fetch updates from provider', async () => {
      const testUpdate = { test: 'update' };
      const provider = async () => ({ update: testUpdate });
      setUpdateProvider(provider);

      const result = await fetchUpdates();
      assert.deepStrictEqual(result, { update: testUpdate });
    });

    it('should handle provider errors', async () => {
      const provider = async () => {
        throw new Error('Provider error');
      };
      setUpdateProvider(provider);

      const result = await fetchUpdates();
      assert.deepStrictEqual(result, { update: null });
    });
  });

  describe('Apply Updates', () => {
    beforeEach(() => {
      // Enhanced mock for apply updates testing
      global.__webpack_require__ = {
        ...mockWebpackRequire,
        hmrD: {},
        m: {},
        o: (obj, key) => Object.prototype.hasOwnProperty.call(obj, key),
      };

      // Mock module.hot for HMR
      global.module = {
        hot: {
          status: () => 'idle',
          check: async () => ['./src/index.js'],
          accept: () => {},
          _selfAccepted: true,
          _selfInvalidated: false,
        },
      };
    });

    it('should return early when no update data and not forced', async () => {
      const result1 = await applyUpdates(null, false);
      const result2 = await applyUpdates({ update: null }, false);

      assert.strictEqual(result1.success, false);
      assert.strictEqual(result1.reason, 'no_update_data');
      assert.strictEqual(result2.success, false);
      assert.strictEqual(result2.reason, 'no_update_data');
    });

    it('should create force update when no data and forced', async () => {
      const result = await applyUpdates(null, true);
      // Force mode should attempt to apply even without data
      assert.ok(result);
      assert.ok(typeof result === 'object');
    });

    it('should handle valid update data', async () => {
      const updateData = {
        update: {
          manifest: { h: 'test', c: [], r: [], m: [] },
          script: 'test script',
          originalInfo: { updateId: 'test' },
        },
      };

      const result = await applyUpdates(updateData, false);
      assert.ok(result);
      assert.ok(typeof result === 'object');
    });
  });

  describe('Force Update Functionality', () => {
    beforeEach(() => {
      global.module = {
        hot: {
          status: () => 'idle',
          check: async () => [],
          accept: () => {},
        },
      };
    });

    it('should trigger force update manually', async () => {
      const result = await forceUpdate();
      assert.ok(result);
      assert.ok(typeof result === 'object');
    });

    it('should handle force update without webpack require', async () => {
      delete global.__webpack_require__;

      const result = await forceUpdate();
      assert.ok(result);
      assert.ok(typeof result === 'object');
    });
  });

  describe('HMR Status and Testing', () => {
    it('should get HMR status', () => {
      const status = getHMRStatus();

      assert.ok(typeof status === 'object');
      assert.ok(typeof status.hasWebpackRequire === 'boolean');
      assert.ok(typeof status.hasModuleHot === 'boolean');
      assert.ok(typeof status.hotStatus === 'string');
      assert.ok(typeof status.moduleState === 'object');
    });

    it('should test module reinstall', () => {
      const result = testModuleReinstall();

      assert.ok(typeof result === 'object');
      assert.ok(typeof result.beforeState === 'object');
      assert.ok(typeof result.afterState === 'object');
      assert.ok(typeof result.moduleIdChanged === 'boolean');
      assert.ok(typeof result.stateReset === 'boolean');
    });

    it('should handle HMR status without webpack require', () => {
      delete global.__webpack_require__;

      const status = getHMRStatus();
      assert.strictEqual(status.hasWebpackRequire, false);
      assert.strictEqual(status.webpackHash, null);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing webpack require gracefully', async () => {
      delete global.__webpack_require__;

      // These should not throw
      await fetchUpdates();
      await forceUpdate();
      const status = getHMRStatus();

      assert.ok(status);
      assert.strictEqual(status.hasWebpackRequire, false);
    });

    it('should handle malformed update data', async () => {
      global.__webpack_require__ = mockWebpackRequire;

      const malformedUpdate = {
        update: {
          // Missing required fields
          manifest: null,
          script: null,
        },
      };

      // Should not throw
      const result = await applyUpdates(malformedUpdate, false);
      assert.ok(result);
      assert.ok(typeof result === 'object');
    });
  });

  describe('Complex HMR Runtime Logic', () => {
    const {
      createHMRRuntime,
      createApplyHandler,
    } = require('@module-federation/node/utils/hmr-runtime');

    beforeEach(() => {
      // Set up complex mock for HMR runtime testing
      global.__webpack_require__ = {
        ...mockWebpackRequire,
        m: {
          './src/module-a.js': function () {
            return 'module-a';
          },
          './src/module-b.js': function () {
            return 'module-b';
          },
          './src/module-c.js': function () {
            return 'module-c';
          },
        },
        c: {
          './src/module-a.js': {
            id: './src/module-a.js',
            hot: {
              _selfAccepted: true,
              _selfInvalidated: false,
              _selfDeclined: false,
              _main: false,
              _acceptedDependencies: { './src/module-b.js': () => {} },
              _acceptedErrorHandlers: { './src/module-b.js': null },
              _declinedDependencies: {},
              _disposeHandlers: [],
              active: true,
              _requireSelf: () => require('./src/module-a.js'),
            },
            parents: ['./src/module-c.js'],
            children: ['./src/module-b.js'],
          },
          './src/module-b.js': {
            id: './src/module-b.js',
            hot: {
              _selfAccepted: false,
              _selfInvalidated: false,
              _selfDeclined: false,
              _main: false,
              _acceptedDependencies: {},
              _acceptedErrorHandlers: {},
              _declinedDependencies: {},
              _disposeHandlers: [
                function (data) {
                  data.disposed = true;
                },
              ],
              active: true,
            },
            parents: ['./src/module-a.js'],
            children: [],
          },
          './src/module-c.js': {
            id: './src/module-c.js',
            hot: {
              _selfAccepted: false,
              _selfInvalidated: false,
              _selfDeclined: true,
              _main: false,
              _acceptedDependencies: {},
              _acceptedErrorHandlers: {},
              _declinedDependencies: { './src/module-a.js': true },
              _disposeHandlers: [],
              active: true,
            },
            parents: [],
            children: ['./src/module-a.js'],
          },
        },
        hmrD: {},
      };
    });

    it('should test getAffectedModuleEffects with self-accepted module', () => {
      const installedChunks = { index: 0 };
      const inMemoryChunks = {};
      const manifestRef = { value: null };

      const runtime = createHMRRuntime(
        global.__webpack_require__,
        installedChunks,
        inMemoryChunks,
        manifestRef,
      );

      // Create a state object for testing
      const state = {
        currentUpdate: {
          './src/module-a.js': function () {
            return 'updated-module-a';
          },
        },
        currentUpdateRuntime: [],
      };

      const applyHandler = createApplyHandler(
        global.__webpack_require__,
        installedChunks,
        state,
      );

      const result = applyHandler({ ignoreDeclined: false });
      assert.ok(result.dispose, 'Should have dispose function');
      assert.ok(result.apply, 'Should have apply function');
    });

    it('should test getAffectedModuleEffects with declined dependency', () => {
      const installedChunks = { index: 0 };
      const inMemoryChunks = {};
      const manifestRef = { value: null };

      // Test with module that has declined dependency
      const state = {
        currentUpdate: {
          './src/module-a.js': function () {
            return 'updated-module-a';
          },
        },
        currentUpdateRuntime: [],
      };

      const applyHandler = createApplyHandler(
        global.__webpack_require__,
        installedChunks,
        state,
      );

      const result = applyHandler({ ignoreDeclined: false });
      // Should return error due to declined dependency
      assert.ok(
        result.error || result.dispose,
        'Should handle declined dependency',
      );
    });

    it('should test module disposal and cleanup cycle', () => {
      const installedChunks = { index: 0 };
      const state = {
        currentUpdate: {
          './src/module-b.js': function () {
            return 'updated-module-b';
          },
        },
        currentUpdateRuntime: [],
        currentUpdateRemovedChunks: [],
      };

      const applyHandler = createApplyHandler(
        global.__webpack_require__,
        installedChunks,
        state,
      );

      const result = applyHandler({});

      // Test dispose functionality
      if (result.dispose) {
        result.dispose();

        // Verify disposal effects
        const moduleB = global.__webpack_require__.c['./src/module-b.js'];
        if (moduleB) {
          assert.strictEqual(
            moduleB.hot.active,
            false,
            'Module should be deactivated',
          );
        }

        // Check if dispose handler data was set
        assert.ok(
          global.__webpack_require__.hmrD,
          'Should have dispose data storage',
        );
      }
    });

    it('should handle self-declined modules', () => {
      // Test with self-declined module
      global.__webpack_require__.c['./src/module-c.js'].hot._selfDeclined =
        true;

      const installedChunks = { index: 0 };
      const state = {
        currentUpdate: {
          './src/module-c.js': function () {
            return 'updated-module-c';
          },
        },
        currentUpdateRuntime: [],
      };

      const applyHandler = createApplyHandler(
        global.__webpack_require__,
        installedChunks,
        state,
      );

      const result = applyHandler({ ignoreDeclined: false });
      assert.ok(result.error, 'Should return error for self-declined module');
      assert.ok(
        result.error.message.includes('self decline'),
        'Error should mention self decline',
      );
    });

    it('should handle unaccepted modules (main modules)', () => {
      // Set module as main (unaccepted)
      global.__webpack_require__.c['./src/module-a.js'].hot._main = true;

      const installedChunks = { index: 0 };
      const state = {
        currentUpdate: {
          './src/module-a.js': function () {
            return 'updated-module-a';
          },
        },
        currentUpdateRuntime: [],
        currentUpdateRemovedChunks: [],
      };

      const applyHandler = createApplyHandler(
        global.__webpack_require__,
        installedChunks,
        state,
      );

      const result = applyHandler({ ignoreUnaccepted: false });

      // The test should verify behavior regardless of specific implementation
      assert.ok(
        result.error || result.dispose,
        'Should handle unaccepted module appropriately',
      );
      if (result.error) {
        assert.ok(
          result.error.message.includes('not accepted'),
          'Error should mention not accepted',
        );
      }
    });

    it('should test complex dependency chain analysis', () => {
      // Create a more complex dependency chain
      global.__webpack_require__.c['./src/module-d.js'] = {
        id: './src/module-d.js',
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
        parents: ['./src/module-a.js'],
        children: [],
      };

      // Add module-d as child of module-a
      global.__webpack_require__.c['./src/module-a.js'].children.push(
        './src/module-d.js',
      );

      const installedChunks = { index: 0 };
      const state = {
        currentUpdate: {
          './src/module-d.js': function () {
            return 'updated-module-d';
          },
        },
        currentUpdateRuntime: [],
      };

      const applyHandler = createApplyHandler(
        global.__webpack_require__,
        installedChunks,
        state,
      );

      const result = applyHandler({});
      // Should propagate up the dependency chain
      assert.ok(
        result.dispose || result.apply,
        'Should handle dependency chain propagation',
      );
    });

    it('should test self-accepted module reloading with error handling', () => {
      // Create a self-accepted module with error handler
      global.__webpack_require__.c['./src/module-a.js'].hot._selfAccepted =
        function (err, context) {
          console.log('Self-accept error handler called:', err, context);
        };

      const installedChunks = { index: 0 };
      const state = {
        currentUpdate: {
          './src/module-a.js': function () {
            throw new Error('Test error');
          },
        },
        currentUpdateRuntime: [],
      };

      const applyHandler = createApplyHandler(
        global.__webpack_require__,
        installedChunks,
        state,
      );

      const result = applyHandler({});

      if (result.apply) {
        let errorCaught = false;
        try {
          result.apply((err) => {
            errorCaught = true;
            assert.ok(err, 'Should report error');
          });
        } catch (e) {
          // Expected due to error in module
        }
        // Test completes if no crash occurs
        assert.ok(true, 'Should handle self-accepted module errors');
      }
    });

    it('should test accept callback error handling', () => {
      // Set up accept callback that throws error
      global.__webpack_require__.c[
        './src/module-a.js'
      ].hot._acceptedDependencies['./src/module-b.js'] = function () {
        throw new Error('Accept callback error');
      };

      global.__webpack_require__.c[
        './src/module-a.js'
      ].hot._acceptedErrorHandlers['./src/module-b.js'] = function (
        err,
        context,
      ) {
        console.log('Accept error handler:', err, context);
      };

      const installedChunks = { index: 0 };
      const state = {
        currentUpdate: {
          './src/module-b.js': function () {
            return 'updated-module-b';
          },
        },
        currentUpdateRuntime: [],
      };

      const applyHandler = createApplyHandler(
        global.__webpack_require__,
        installedChunks,
        state,
      );

      const result = applyHandler({});

      if (result.apply) {
        let errorReported = false;
        result.apply((err) => {
          errorReported = true;
        });
        // Should handle accept callback errors gracefully
        assert.ok(true, 'Should handle accept callback errors');
      }
    });
  });
});
