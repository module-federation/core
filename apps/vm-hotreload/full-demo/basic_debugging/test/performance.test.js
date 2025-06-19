const { describe, it, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

// Import modules under test
const { createHMRRuntime } = require('@module-federation/node/utils/hmr-runtime');
const {
  setUpdateProvider,
  createQueueUpdateProvider,
  createCallbackUpdateProvider,
  fetchUpdates,
  applyUpdates,
  startUpdatePolling,
  getModuleState,
  updateModuleState,
  incrementReloadCount,
} = require('../examples/demo/index.js');

describe('HMR Performance and Load Tests', () => {
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
    mockWebpackRequire = {
      h: () => 'perf-test-hash',
      hmrS_readFileVm: { index: 0 },
      c: {},
      m: {},
      hmrD: {},
      hmrF: () => 'perf-test-hash',
      o: (obj, key) => Object.prototype.hasOwnProperty.call(obj, key),
      f: {},
    };
    global.__webpack_require__ = mockWebpackRequire;
    global.module = {
      hot: {
        status: () => 'idle',
        check: async () => [],
        accept: () => {},
      },
    };
  });

  afterEach(() => {
    delete global.__webpack_require__;
    delete global.module;
  });

  describe('High Volume Update Processing', () => {
    it('should handle 1000 sequential updates efficiently', async () => {
      const updateCount = 1000;
      const updates = [];
      
      for (let i = 0; i < updateCount; i++) {
        updates.push({
          manifest: { h: `bulk-${i}`, c: [], r: [], m: [] },
          script: `console.log("Bulk update ${i}");`,
          originalInfo: { updateId: `bulk-${i}` },
        });
      }

      const provider = createQueueUpdateProvider(updates);
      setUpdateProvider(provider);

      const startTime = performance.now();
      
      for (let i = 0; i < updateCount; i++) {
        const result = await fetchUpdates();
        assert.ok(result.update, `Update ${i} should be fetched`);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should process 1000 updates in under 100ms
      assert.ok(duration < 100, `Should process ${updateCount} updates quickly, took ${duration.toFixed(2)}ms`);
      console.log(`✅ Processed ${updateCount} updates in ${duration.toFixed(2)}ms`);
    });

    it('should handle rapid-fire update applications', async () => {
      const updateCount = 100;
      const startTime = performance.now();

      for (let i = 0; i < updateCount; i++) {
        const updateData = {
          update: {
            manifest: { h: `rapid-${i}`, c: [], r: [], m: [] },
            script: `console.log("Rapid ${i}");`,
            originalInfo: { updateId: `rapid-${i}` },
          },
        };

        await applyUpdates(updateData);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should apply 100 updates in under 50ms
      assert.ok(duration < 50, `Should apply updates rapidly, took ${duration.toFixed(2)}ms`);
      console.log(`✅ Applied ${updateCount} updates in ${duration.toFixed(2)}ms`);
    });

    it('should maintain performance with large chunk sizes', async () => {
      // Create a large update with substantial content
      const largeScript = `
        exports.modules = {
          ${Array.from({ length: 100 }, (_, i) => `
            './src/large-module-${i}.js': function(module, exports, require) {
              // Simulated large module content
              const data = ${JSON.stringify(Array.from({ length: 1000 }, (_, j) => `item-${i}-${j}`))};
              module.exports = { moduleId: ${i}, data: data };
            }
          `).join(',')}
        };
      `;

      const largeUpdate = {
        update: {
          manifest: { h: 'large-update', c: ['index'], r: [], m: [] },
          script: largeScript,
          originalInfo: { updateId: 'large-update' },
        },
      };

      const startTime = performance.now();
      await applyUpdates(largeUpdate);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle large updates in under 100ms
      assert.ok(duration < 100, `Should handle large updates efficiently, took ${duration.toFixed(2)}ms`);
      console.log(`✅ Processed large update in ${duration.toFixed(2)}ms`);
    });
  });

  describe('Memory Usage Under Load', () => {
    it('should not accumulate memory with repeated state operations', () => {
      const iterations = 10000;
      const initialState = getModuleState();
      
      // Perform many state operations
      for (let i = 0; i < iterations; i++) {
        updateModuleState({ iteration: i, data: `test-${i}` });
        incrementReloadCount();
      }

      const finalState = getModuleState();
      
      // State should be reasonable size (not accumulating data)
      const stateSize = JSON.stringify(finalState).length;
      assert.ok(stateSize < 10000, `State size should remain reasonable: ${stateSize} bytes`);
      
      // Should have updated correctly
      assert.strictEqual(finalState.iteration, iterations - 1);
      assert.ok(finalState.reloadCount >= iterations);
      
      console.log(`✅ Completed ${iterations} state operations, final state size: ${stateSize} bytes`);
    });

    it('should handle memory pressure during chunk loading', async () => {
      // Create many in-memory chunks
      const chunkCount = 500;
      const inMemoryChunks = {};
      
      for (let i = 0; i < chunkCount; i++) {
        // Each chunk contains substantial content
        inMemoryChunks[`chunk-${i}`] = `
          exports.modules = {
            './chunk-${i}/module.js': function(module, exports, require) {
              module.exports = { id: ${i}, data: ${JSON.stringify(Array.from({ length: 100 }, (_, j) => j))} };
            }
          };
        `;
      }

      const installedChunks = {};
      for (let i = 0; i < chunkCount; i++) {
        installedChunks[`chunk-${i}`] = 0;
      }

      const runtime = createHMRRuntime(
        global.__webpack_require__,
        installedChunks,
        inMemoryChunks,
        { value: null }
      );

      const startTime = performance.now();
      
      // Load chunks in batches to simulate memory pressure
      const batchSize = 50;
      for (let i = 0; i < chunkCount; i += batchSize) {
        const batchPromises = [];
        for (let j = i; j < Math.min(i + batchSize, chunkCount); j++) {
          batchPromises.push(runtime.loadUpdateChunk(`chunk-${j}`, []));
        }
        await Promise.all(batchPromises);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      assert.ok(duration < 1000, `Should load ${chunkCount} chunks efficiently: ${duration.toFixed(2)}ms`);
      console.log(`✅ Loaded ${chunkCount} chunks in ${duration.toFixed(2)}ms`);
    });
  });

  describe('Polling Performance', () => {
    it('should maintain stable performance during extended polling', async () => {
      let pollCount = 0;
      let maxDuration = 0;
      let totalDuration = 0;

      const performanceProvider = createCallbackUpdateProvider(async () => {
        const startTime = performance.now();
        
        // Simulate work
        await new Promise(resolve => setTimeout(resolve, 1));
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        pollCount++;
        totalDuration += duration;
        maxDuration = Math.max(maxDuration, duration);

        // Return update every 10th poll
        if (pollCount % 10 === 0) {
          return {
            update: {
              manifest: { h: `poll-${pollCount}`, c: [], r: [], m: [] },
              script: `console.log("Poll update ${pollCount}");`,
              originalInfo: { updateId: `poll-${pollCount}` },
            },
          };
        }
        
        return { update: null };
      });

      setUpdateProvider(performanceProvider);

      // Start high-frequency polling
      const pollingInterval = await startUpdatePolling(5); // 5ms interval

      // Let it run for 200ms
      await new Promise(resolve => setTimeout(resolve, 200));

      clearInterval(pollingInterval);

      const avgDuration = totalDuration / pollCount;

      assert.ok(pollCount > 30, `Should have polled multiple times: ${pollCount}`);
      assert.ok(maxDuration < 50, `Max poll duration should be reasonable: ${maxDuration.toFixed(2)}ms`);
      assert.ok(avgDuration < 10, `Average poll duration should be low: ${avgDuration.toFixed(2)}ms`);

      console.log(`✅ Completed ${pollCount} polls, avg: ${avgDuration.toFixed(2)}ms, max: ${maxDuration.toFixed(2)}ms`);
    });

    it('should handle polling frequency changes smoothly', async () => {
      let pollCount = 0;
      const provider = createCallbackUpdateProvider(async () => {
        pollCount++;
        return { update: null };
      });

      setUpdateProvider(provider);

      // Start with fast polling
      let interval = await startUpdatePolling(1);
      await new Promise(resolve => setTimeout(resolve, 50));
      clearInterval(interval);
      const fastPollCount = pollCount;

      pollCount = 0;

      // Switch to slow polling
      interval = await startUpdatePolling(20);
      await new Promise(resolve => setTimeout(resolve, 100));
      clearInterval(interval);
      const slowPollCount = pollCount;

      assert.ok(fastPollCount > slowPollCount * 2, 'Fast polling should poll more frequently');
      console.log(`✅ Fast polling: ${fastPollCount} polls, slow polling: ${slowPollCount} polls`);
    });
  });

  describe('Concurrent Operation Performance', () => {
    it('should handle concurrent provider operations efficiently', async () => {
      const concurrentOperations = 50;
      const provider = createCallbackUpdateProvider(async () => ({
        update: {
          manifest: { h: 'concurrent', c: [], r: [], m: [] },
          script: 'console.log("Concurrent");',
          originalInfo: { updateId: 'concurrent' },
        },
      }));

      setUpdateProvider(provider);

      const startTime = performance.now();
      
      // Launch many concurrent fetch operations
      const promises = Array.from({ length: concurrentOperations }, () => fetchUpdates());
      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // All should succeed
      results.forEach((result, index) => {
        assert.ok(result.update, `Concurrent operation ${index} should succeed`);
      });

      // Should complete concurrent operations efficiently
      assert.ok(duration < 100, `Should handle ${concurrentOperations} concurrent operations efficiently: ${duration.toFixed(2)}ms`);
      console.log(`✅ Completed ${concurrentOperations} concurrent operations in ${duration.toFixed(2)}ms`);
    });

    it('should maintain performance under mixed operation load', async () => {
      // Mixed workload: fetches, applies, state updates, polls
      const operations = 200;
      const startTime = performance.now();

      const provider = createCallbackUpdateProvider(async () => ({
        update: {
          manifest: { h: 'mixed', c: [], r: [], m: [] },
          script: 'console.log("Mixed");',
          originalInfo: { updateId: 'mixed' },
        },
      }));

      setUpdateProvider(provider);

      const promises = [];

      for (let i = 0; i < operations; i++) {
        const operationType = i % 4;
        
        switch (operationType) {
          case 0:
            promises.push(fetchUpdates());
            break;
          case 1:
            promises.push(applyUpdates({
              update: {
                manifest: { h: `mixed-${i}`, c: [], r: [], m: [] },
                script: `console.log("Mixed ${i}");`,
                originalInfo: { updateId: `mixed-${i}` },
              },
            }));
            break;
          case 2:
            promises.push(Promise.resolve(updateModuleState({ mixedOp: i })));
            break;
          case 3:
            promises.push(Promise.resolve(incrementReloadCount()));
            break;
        }
      }

      await Promise.all(promises);
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle mixed operations efficiently
      assert.ok(duration < 500, `Should handle ${operations} mixed operations efficiently: ${duration.toFixed(2)}ms`);
      console.log(`✅ Completed ${operations} mixed operations in ${duration.toFixed(2)}ms`);
    });
  });
});