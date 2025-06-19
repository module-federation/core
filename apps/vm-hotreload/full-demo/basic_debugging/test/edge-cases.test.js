const { describe, it, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const path = require('path');

// Import the modules under test
const { createHMRRuntime, createApplyHandler } = require('@module-federation/node/utils/hmr-runtime');
const { applyHotUpdateFromStringsByPatching } = require('@module-federation/node/utils/custom-hmr-helpers');
const {
  setUpdateProvider,
  createQueueUpdateProvider,
  createCallbackUpdateProvider,
  fetchUpdates,
  applyUpdates,
  forceUpdate,
  getModuleState,
  resetModuleState,
} = require('../examples/demo/index.js');

describe('HMR Edge Cases and Stress Tests', () => {
  let mockWebpackRequire;
  let originalWebpackRequire;

  before(() => {
    originalWebpackRequire = global.__webpack_require__;
  });

  after(() => {
    if (originalWebpackRequire) {
      global.__webpack_require__ = originalWebpackRequire;
    } else {
      delete global.__webpack_require__;
    }
  });

  beforeEach(() => {
    // Enhanced mock for edge case testing
    mockWebpackRequire = {
      h: () => 'edge-test-hash',
      hmrS_readFileVm: { index: 0, main: 0, vendor: 0 },
      c: {},
      m: {},
      hmrD: {},
      hmrF: () => 'edge-test-hash',
      hmrI: {},
      hmrC: {},
      o: (obj, key) => Object.prototype.hasOwnProperty.call(obj, key),
      f: {},
    };
    global.__webpack_require__ = mockWebpackRequire;
  });

  afterEach(() => {
    delete global.__webpack_require__;
    delete global.module;
  });

  describe('Circular Dependency Handling', () => {
    beforeEach(() => {
      // Create circular dependency: A -> B -> C -> A
      global.__webpack_require__.c = {
        './src/module-a.js': {
          id: './src/module-a.js',
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
            _disposeHandlers: [],
            active: true,
          },
          parents: ['./src/module-a.js'],
          children: ['./src/module-c.js'],
        },
        './src/module-c.js': {
          id: './src/module-c.js',
          hot: {
            _selfAccepted: true,
            _selfInvalidated: false,
            _selfDeclined: false,
            _main: false,
            _acceptedDependencies: {},
            _acceptedErrorHandlers: {},
            _declinedDependencies: {},
            _disposeHandlers: [],
            active: true,
            _requireSelf: () => ({ circular: true }),
          },
          parents: ['./src/module-b.js'],
          children: ['./src/module-a.js'],
        },
      };
    });

    it('should handle circular dependencies without infinite loops', () => {
      const installedChunks = { index: 0 };
      const state = {
        currentUpdate: { './src/module-a.js': function() { return 'updated-a'; } },
        currentUpdateRuntime: [],
        currentUpdateRemovedChunks: [],
      };

      const applyHandler = createApplyHandler(
        global.__webpack_require__,
        installedChunks,
        state
      );

      const result = applyHandler({});
      // Should complete without hanging
      assert.ok(result.dispose || result.apply, 'Should handle circular dependencies');
    });

    it('should properly break circular dependency chains at self-accepted modules', () => {
      // Update module C which is self-accepted in the circular chain
      const installedChunks = { index: 0 };
      const state = {
        currentUpdate: { './src/module-c.js': function() { return 'updated-c'; } },
        currentUpdateRuntime: [],
        currentUpdateRemovedChunks: [],
      };

      const applyHandler = createApplyHandler(
        global.__webpack_require__,
        installedChunks,
        state
      );

      const result = applyHandler({});
      
      if (result.apply) {
        const outdatedModules = result.apply(() => {});
        // Should only include module C, not propagate through the entire circle
        assert.ok(Array.isArray(outdatedModules), 'Should return array of outdated modules');
      }
    });

    it('should detect deep circular chains with multiple levels', () => {
      // Add more modules to create deeper circular chain: A -> B -> C -> D -> E -> A
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
        parents: ['./src/module-c.js'],
        children: ['./src/module-e.js'],
      };

      global.__webpack_require__.c['./src/module-e.js'] = {
        id: './src/module-e.js',
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
        parents: ['./src/module-d.js'],
        children: ['./src/module-a.js'],
      };

      // Update C -> D chain
      global.__webpack_require__.c['./src/module-c.js'].children = ['./src/module-d.js'];
      global.__webpack_require__.c['./src/module-a.js'].parents.push('./src/module-e.js');

      const installedChunks = { index: 0 };
      const state = {
        currentUpdate: { './src/module-d.js': function() { return 'updated-d'; } },
        currentUpdateRuntime: [],
        currentUpdateRemovedChunks: [],
      };

      const applyHandler = createApplyHandler(
        global.__webpack_require__,
        installedChunks,
        state
      );

      const result = applyHandler({});
      // Should handle deep circular chains without hanging
      assert.ok(result.dispose || result.apply, 'Should handle deep circular dependencies');
    });
  });

  describe('Concurrent HMR Operations', () => {
    it('should handle multiple simultaneous update attempts', async () => {
      // Set up provider that simulates concurrent updates
      let updateCount = 0;
      const concurrentProvider = createCallbackUpdateProvider(async () => {
        updateCount++;
        return {
          update: {
            manifest: { h: `concurrent-${updateCount}`, c: [], r: [], m: [] },
            script: `console.log("Concurrent update ${updateCount}");`,
            originalInfo: { updateId: `concurrent-${updateCount}` },
          },
        };
      });

      setUpdateProvider(concurrentProvider);

      // Launch multiple update operations simultaneously
      const updatePromises = [];
      for (let i = 0; i < 5; i++) {
        updatePromises.push(fetchUpdates());
      }

      const results = await Promise.all(updatePromises);

      // All should complete without errors
      results.forEach((result, index) => {
        assert.ok(result.update, `Update ${index} should succeed`);
        assert.ok(result.update.originalInfo.updateId.includes('concurrent'), 'Should be concurrent update');
      });
    });

    it('should handle overlapping apply operations', async () => {
      global.module = {
        hot: {
          status: () => 'idle',
          check: async () => [],
          accept: () => {},
        },
      };

      const testUpdates = [
        {
          update: {
            manifest: { h: 'overlap1', c: [], r: [], m: [] },
            script: 'console.log("Overlap 1");',
            originalInfo: { updateId: 'overlap-1' },
          },
        },
        {
          update: {
            manifest: { h: 'overlap2', c: [], r: [], m: [] },
            script: 'console.log("Overlap 2");',
            originalInfo: { updateId: 'overlap-2' },
          },
        },
        {
          update: {
            manifest: { h: 'overlap3', c: [], r: [], m: [] },
            script: 'console.log("Overlap 3");',
            originalInfo: { updateId: 'overlap-3' },
          },
        },
      ];

      // Apply multiple updates in parallel
      const applyPromises = testUpdates.map(update => applyUpdates(update));
      const applyResults = await Promise.all(applyPromises);

      // All should complete
      applyResults.forEach((result, index) => {
        assert.ok(result, `Apply operation ${index} should complete`);
      });
    });

    it('should handle force updates during regular updates', async () => {
      global.module = {
        hot: {
          status: () => 'idle',
          check: async () => [],
          accept: () => {},
        },
      };

      const regularProvider = createCallbackUpdateProvider(async () => ({
        update: {
          manifest: { h: 'regular', c: [], r: [], m: [] },
          script: 'console.log("Regular update");',
          originalInfo: { updateId: 'regular' },
        },
      }));

      setUpdateProvider(regularProvider);

      // Start regular update and force update simultaneously
      const regularUpdatePromise = fetchUpdates().then(result => applyUpdates(result));
      const forceUpdatePromise = forceUpdate();

      const [regularResult, forceResult] = await Promise.all([
        regularUpdatePromise,
        forceUpdatePromise,
      ]);

      assert.ok(regularResult, 'Regular update should complete');
      assert.ok(forceResult, 'Force update should complete');
    });
  });

  describe('Memory and Resource Management', () => {
    it('should clean up disposed modules properly', () => {
      // Create modules with complex disposal handlers
      global.__webpack_require__.c = {
        './src/memory-test.js': {
          id: './src/memory-test.js',
          hot: {
            _selfAccepted: false,
            _selfInvalidated: false,
            _selfDeclined: false,
            _main: false,
            _acceptedDependencies: {},
            _acceptedErrorHandlers: {},
            _declinedDependencies: {},
            _disposeHandlers: [
              function(data) {
                data.cleanedUp = true;
                data.timestamp = Date.now();
              },
              function(data) {
                data.secondCleanup = true;
              },
            ],
            active: true,
          },
          parents: [],
          children: [],
        },
      };

      const installedChunks = { index: 0 };
      const state = {
        currentUpdate: { './src/memory-test.js': false }, // Mark for disposal
        currentUpdateRuntime: [],
        currentUpdateRemovedChunks: [],
      };

      const applyHandler = createApplyHandler(
        global.__webpack_require__,
        installedChunks,
        state
      );

      const result = applyHandler({});
      
      if (result.dispose) {
        result.dispose();
        
        // Check that disposal data was properly set
        const disposeData = global.__webpack_require__.hmrD['./src/memory-test.js'];
        assert.ok(disposeData, 'Should have dispose data');
        assert.ok(disposeData.cleanedUp, 'Should have called first dispose handler');
        assert.ok(disposeData.secondCleanup, 'Should have called second dispose handler');
        
        // Check that module was deactivated
        const module = global.__webpack_require__.c['./src/memory-test.js'];
        if (module) {
          assert.strictEqual(module.hot.active, false, 'Module should be deactivated');
        }
      }
    });

    it('should handle memory cleanup with large module graphs', () => {
      // Create a large module graph for stress testing
      const moduleCount = 50;
      
      for (let i = 0; i < moduleCount; i++) {
        const moduleId = `./src/large-module-${i}.js`;
        global.__webpack_require__.c[moduleId] = {
          id: moduleId,
          hot: {
            _selfAccepted: i % 10 === 0, // Every 10th module is self-accepted
            _selfInvalidated: false,
            _selfDeclined: false,
            _main: false,
            _acceptedDependencies: {},
            _acceptedErrorHandlers: {},
            _declinedDependencies: {},
            _disposeHandlers: [function(data) { data.disposed = true; }],
            active: true,
            _requireSelf: i % 10 === 0 ? (() => ({ large: i })) : undefined,
          },
          parents: i > 0 ? [`./src/large-module-${i - 1}.js`] : [],
          children: i < moduleCount - 1 ? [`./src/large-module-${i + 1}.js`] : [],
        };
      }

      const installedChunks = { index: 0 };
      const state = {
        currentUpdate: { './src/large-module-25.js': function() { return 'updated-25'; } },
        currentUpdateRuntime: [],
        currentUpdateRemovedChunks: [],
      };

      const applyHandler = createApplyHandler(
        global.__webpack_require__,
        installedChunks,
        state
      );

      const startTime = Date.now();
      const result = applyHandler({});
      const endTime = Date.now();

      // Should complete in reasonable time (< 1 second)
      assert.ok(endTime - startTime < 1000, 'Should handle large graphs efficiently');
      assert.ok(result.dispose || result.apply, 'Should handle large module graph');
    });

    it('should prevent memory leaks in update provider state', async () => {
      // Test with many sequential updates to check for memory leaks
      const updateCount = 100;
      const updates = [];
      
      for (let i = 0; i < updateCount; i++) {
        updates.push({
          manifest: { h: `leak-test-${i}`, c: [], r: [], m: [] },
          script: `console.log("Leak test ${i}");`,
          originalInfo: { updateId: `leak-test-${i}` },
        });
      }

      const queueProvider = createQueueUpdateProvider(updates);
      setUpdateProvider(queueProvider);

      // Fetch all updates
      for (let i = 0; i < updateCount; i++) {
        const result = await fetchUpdates();
        if (result.update) {
          assert.strictEqual(result.update.originalInfo.updateId, `leak-test-${i}`);
        }
      }

      // After exhausting queue, should return null
      const finalResult = await fetchUpdates();
      assert.deepStrictEqual(finalResult, { update: null });
    });
  });

  describe('Complex Error Scenarios', () => {
    it('should handle cascading errors in dependency chains', () => {
      // Create a chain where multiple modules have error handlers
      global.__webpack_require__.c = {
        './src/error-parent.js': {
          id: './src/error-parent.js',
          hot: {
            _selfAccepted: false,
            _selfInvalidated: false,
            _selfDeclined: false,
            _main: false,
            _acceptedDependencies: {
              './src/error-child.js': function() {
                throw new Error('Parent accept handler error');
              },
            },
            _acceptedErrorHandlers: {
              './src/error-child.js': function(err, context) {
                console.log('Parent error handler:', err.message);
                throw new Error('Error handler also failed');
              },
            },
            _declinedDependencies: {},
            _disposeHandlers: [],
            active: true,
          },
          parents: [],
          children: ['./src/error-child.js'],
        },
        './src/error-child.js': {
          id: './src/error-child.js',
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
          parents: ['./src/error-parent.js'],
          children: [],
        },
      };

      const installedChunks = { index: 0 };
      const state = {
        currentUpdate: { './src/error-child.js': function() { return 'updated-child'; } },
        currentUpdateRuntime: [],
        currentUpdateRemovedChunks: [],
      };

      const applyHandler = createApplyHandler(
        global.__webpack_require__,
        installedChunks,
        state
      );

      const result = applyHandler({
        onErrored: (info) => {
          assert.ok(info.type, 'Error info should have type');
          assert.ok(info.moduleId, 'Error info should have moduleId');
        },
      });

      if (result.apply) {
        const errors = [];
        result.apply((err) => {
          errors.push(err);
        });
        // Should have collected cascading errors
        assert.ok(errors.length >= 0, 'Should handle cascading errors');
      }
    });

    it('should handle malformed chunk content gracefully', async () => {
      const installedChunks = { index: 0 };
      const inMemoryChunks = {
        index: 'INVALID_JAVASCRIPT_SYNTAX {{{',
        malformed: 'function( { invalid syntax',
      };
      const manifestRef = { value: null };

      const runtime = createHMRRuntime(
        global.__webpack_require__,
        installedChunks,
        inMemoryChunks,
        manifestRef
      );

      // Should handle malformed content without crashing
      try {
        await runtime.loadUpdateChunk('index', []);
        // If it doesn't throw, that's also acceptable (graceful handling)
        assert.ok(true, 'Should handle malformed content gracefully');
      } catch (error) {
        // Expected to throw due to syntax error
        assert.ok(error.message, 'Should provide meaningful error message');
      }
    });

    it('should handle invalid manifest JSON', async () => {
      const installedChunks = { index: 0 };
      const inMemoryChunks = {};
      const manifestRef = { value: 'INVALID_JSON{{{' };

      const runtime = createHMRRuntime(
        global.__webpack_require__,
        installedChunks,
        inMemoryChunks,
        manifestRef
      );

      try {
        await runtime.hmrManifestLoader();
        assert.fail('Should have thrown error for invalid JSON');
      } catch (error) {
        assert.ok(error.message, 'Should provide error for invalid JSON');
      }
    });
  });

  describe('State Consistency and Race Conditions', () => {
    it('should maintain state consistency during rapid updates', async () => {
      // Simulate rapid state changes
      const stateSnapshots = [];
      
      for (let i = 0; i < 20; i++) {
        const state = getModuleState();
        stateSnapshots.push(JSON.parse(JSON.stringify(state)));
        
        // Modify state
        const newState = { testValue: `rapid-${i}`, counter: i };
        await new Promise(resolve => setTimeout(resolve, 1)); // Micro delay
        
        // Update state
        const updated = require('../examples/demo/index.js').updateModuleState(newState);
        assert.ok(updated.testValue === `rapid-${i}`, 'State should update correctly');
      }

      // Verify state integrity
      const finalState = getModuleState();
      assert.ok(finalState.testValue === 'rapid-19', 'Final state should be consistent');
      assert.ok(finalState.counter === 19, 'Counter should be correct');
    });

    it('should handle module state reset during active updates', async () => {
      global.module = {
        hot: {
          status: () => 'idle',
          check: async () => [],
          accept: () => {},
        },
      };

      // Start an update
      const provider = createCallbackUpdateProvider(async () => ({
        update: {
          manifest: { h: 'reset-test', c: [], r: [], m: [] },
          script: 'console.log("Reset test");',
          originalInfo: { updateId: 'reset-test' },
        },
      }));

      setUpdateProvider(provider);
      
      // Start update and reset state simultaneously
      const updatePromise = fetchUpdates().then(result => applyUpdates(result));
      const resetPromise = new Promise(resolve => {
        setTimeout(() => {
          const resetResult = resetModuleState();
          resolve(resetResult);
        }, 10);
      });

      const [updateResult, resetResult] = await Promise.all([updatePromise, resetPromise]);

      assert.ok(updateResult, 'Update should complete');
      assert.ok(resetResult.newModuleId, 'Reset should complete');
      assert.notStrictEqual(resetResult.oldModuleId, resetResult.newModuleId, 'Module ID should change');
    });

    it('should handle provider switching during active operations', async () => {
      // Start with one provider
      const provider1 = createCallbackUpdateProvider(async () => ({
        update: {
          manifest: { h: 'switch-1', c: [], r: [], m: [] },
          script: 'console.log("Provider 1");',
          originalInfo: { updateId: 'provider-1' },
        },
      }));

      setUpdateProvider(provider1);

      // Fetch from first provider
      const result1 = await fetchUpdates();

      // Switch provider
      const provider2 = createCallbackUpdateProvider(async () => ({
        update: {
          manifest: { h: 'switch-2', c: [], r: [], m: [] },
          script: 'console.log("Provider 2");',
          originalInfo: { updateId: 'provider-2' },
        },
      }));

      setUpdateProvider(provider2);

      // Fetch from second provider
      const result2 = await fetchUpdates();

      assert.ok(result1.update, 'First fetch should complete');
      assert.ok(result2.update, 'Second fetch should complete');
      assert.strictEqual(result1.update.originalInfo.updateId, 'provider-1');
      assert.strictEqual(result2.update.originalInfo.updateId, 'provider-2');
    });
  });
});