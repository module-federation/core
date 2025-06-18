const { describe, it, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

// Import the HMR Client
const { HMRClient, createHMRClient } = require('../hmr-client');

describe('HMR Client Tests', () => {
  let mockWebpackRequire;
  let mockModule;
  let originalWebpackRequire;
  let originalModule;
  let originalConsoleLog;
  let logMessages;

  before(() => {
    originalWebpackRequire = global.__webpack_require__;
    originalModule = global.module;
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
    if (originalModule) {
      global.module = originalModule;
    } else {
      delete global.module;
    }
    console.log = originalConsoleLog;
  });

  beforeEach(() => {
    logMessages = [];
    
    // Set up mock webpack require
    mockWebpackRequire = {
      h: () => 'test-hash-123',
      hmrS_readFileVm: {
        index: 0,
        main: 0,
        vendor: 0
      },
      c: {
        './src/index.js': {
          id: './src/index.js',
          hot: {
            _selfAccepted: true,
            _selfInvalidated: false,
            status: () => 'idle'
          }
        }
      },
      m: {
        './src/index.js': function() { return { test: true }; }
      },
      hmrF: () => 'test-hash-123',
      o: (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)
    };

    // Set up mock module with hot support
    mockModule = {
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
        active: true
      }
    };

    global.__webpack_require__ = mockWebpackRequire;
    global.module = mockModule;
  });

  afterEach(() => {
    delete global.__webpack_require__;
    delete global.module;
  });

  describe('HMRClient Constructor and Basic Setup', () => {
    it('should create HMR client with default options', () => {
      const client = new HMRClient();
      
      assert.strictEqual(client.options.autoAttach, true);
      assert.strictEqual(client.options.logging, true);
      assert.strictEqual(client.options.pollingInterval, 1000);
      assert.strictEqual(client.options.maxRetries, 3);
      assert.strictEqual(client.isAttached, true); // auto-attach is true
      assert.strictEqual(client.updateProvider, null);
      assert.strictEqual(client.pollingInterval, null);
    });

    it('should create HMR client with custom options', () => {
      const client = new HMRClient({
        autoAttach: false,
        logging: false,
        pollingInterval: 2000,
        maxRetries: 5
      });
      
      assert.strictEqual(client.options.autoAttach, false);
      assert.strictEqual(client.options.logging, false);
      assert.strictEqual(client.options.pollingInterval, 2000);
      assert.strictEqual(client.options.maxRetries, 5);
      assert.strictEqual(client.isAttached, false); // auto-attach is false
    });

    it('should initialize stats correctly', () => {
      const client = new HMRClient({ autoAttach: false });
      const stats = client.getStats();
      
      assert.strictEqual(stats.totalUpdates, 0);
      assert.strictEqual(stats.successfulUpdates, 0);
      assert.strictEqual(stats.failedUpdates, 0);
      assert.strictEqual(stats.lastUpdateTime, null);
    });

    it('should work with createHMRClient convenience function', () => {
      const client = createHMRClient({ autoAttach: false });
      
      assert.ok(client instanceof HMRClient);
      assert.strictEqual(client.isAttached, false);
    });
  });

  describe('Attach and Detach Operations', () => {
    it('should attach successfully with webpack runtime available', () => {
      const client = new HMRClient({ autoAttach: false });
      
      const result = client.attach();
      
      assert.strictEqual(result, true);
      assert.strictEqual(client.isAttached, true);
      
      const hasAttachLog = logMessages.some(msg => 
        msg.includes('HMR Client successfully attached')
      );
      assert.ok(hasAttachLog, 'Should log successful attachment');
    });

    it('should handle multiple attach attempts gracefully', () => {
      const client = new HMRClient({ autoAttach: false });
      
      const result1 = client.attach();
      const result2 = client.attach();
      
      assert.strictEqual(result1, true);
      assert.strictEqual(result2, true);
      
      const hasAlreadyAttachedLog = logMessages.some(msg =>
        msg.includes('HMR Client already attached')
      );
      assert.ok(hasAlreadyAttachedLog, 'Should log already attached message');
    });

    it('should warn when webpack require is not available', () => {
      delete global.__webpack_require__;
      
      const client = new HMRClient({ autoAttach: false });
      const result = client.attach();
      
      assert.strictEqual(result, true); // Still attaches but with warnings
      
      const hasWarningLog = logMessages.some(msg =>
        msg.includes('__webpack_require__ not available')
      );
      assert.ok(hasWarningLog, 'Should warn about missing webpack require');
    });

    it('should warn when module.hot is not available', () => {
      delete global.module;
      
      const client = new HMRClient({ autoAttach: false });
      const result = client.attach();
      
      assert.strictEqual(result, true); // Still attaches but with warnings
      
      const hasWarningLog = logMessages.some(msg =>
        msg.includes('module.hot not available')
      );
      assert.ok(hasWarningLog, 'Should warn about missing module.hot');
    });

    it('should detach and cleanup properly', () => {
      const client = new HMRClient();
      
      // Set up some state
      client.setUpdateProvider(() => ({ update: null }));
      
      client.detach();
      
      assert.strictEqual(client.isAttached, false);
      assert.strictEqual(client.updateProvider, null);
      assert.strictEqual(client.pollingInterval, null);
      
      const hasDetachLog = logMessages.some(msg =>
        msg.includes('HMR Client detached')
      );
      assert.ok(hasDetachLog, 'Should log detachment');
    });
  });

  describe('Update Provider Management', () => {
    it('should set update provider successfully', () => {
      const client = new HMRClient();
      const provider = async () => ({ update: null });
      
      client.setUpdateProvider(provider);
      
      assert.strictEqual(client.updateProvider, provider);
      
      const hasProviderLog = logMessages.some(msg =>
        msg.includes('Update provider configured')
      );
      assert.ok(hasProviderLog, 'Should log provider configuration');
    });

    it('should throw error for invalid provider', () => {
      const client = new HMRClient();
      
      assert.throws(() => {
        client.setUpdateProvider('not a function');
      }, /Update provider must be a function/);
      
      assert.throws(() => {
        client.setUpdateProvider(null);
      }, /Update provider must be a function/);
    });

    it('should create HTTP update provider', () => {
      // Mock fetch for testing
      global.fetch = async (url, options) => {
        if (url === 'http://test.com/updates') {
          return {
            ok: true,
            json: async () => ({
              update: {
                manifest: { h: 'http-hash', c: [], r: [], m: [] },
                script: 'console.log("HTTP update");',
                originalInfo: { updateId: 'http-update' }
              }
            })
          };
        }
        return { ok: false };
      };

      const provider = HMRClient.createHttpUpdateProvider('http://test.com/updates');
      assert.strictEqual(typeof provider, 'function');
      
      delete global.fetch;
    });

    it('should create queue update provider', async () => {
      const updates = [
        { manifest: {}, script: '', originalInfo: { updateId: 'queue-1' } },
        { manifest: {}, script: '', originalInfo: { updateId: 'queue-2' } }
      ];
      
      const provider = HMRClient.createQueueUpdateProvider(updates);
      
      const result1 = await provider();
      assert.strictEqual(result1.update.originalInfo.updateId, 'queue-1');
      
      const result2 = await provider();
      assert.strictEqual(result2.update.originalInfo.updateId, 'queue-2');
      
      const result3 = await provider();
      assert.strictEqual(result3.update, null);
    });

    it('should create callback update provider', async () => {
      const callback = async (hash) => {
        assert.strictEqual(hash, 'test-hash-123');
        return {
          update: {
            manifest: { h: 'callback-hash', c: [], r: [], m: [] },
            script: 'console.log("Callback update");',
            originalInfo: { updateId: 'callback-update' }
          }
        };
      };
      
      const provider = HMRClient.createCallbackUpdateProvider(callback);
      const result = await provider();
      
      assert.strictEqual(result.update.originalInfo.updateId, 'callback-update');
    });

    it('should handle callback provider errors gracefully', async () => {
      const callback = async () => {
        throw new Error('Callback error');
      };
      
      const provider = HMRClient.createCallbackUpdateProvider(callback);
      const result = await provider();
      
      assert.strictEqual(result.update, null);
    });
  });

  describe('Update Operations', () => {
    it('should check for updates with no provider', async () => {
      const client = new HMRClient();
      
      const result = await client.checkForUpdates();
      
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.reason, 'no_provider');
      assert.ok(result.message.includes('No update provider configured'));
    });

    it('should check for updates with no updates available', async () => {
      const client = new HMRClient();
      const provider = async () => ({ update: null });
      client.setUpdateProvider(provider);
      
      const result = await client.checkForUpdates();
      
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.reason, 'no_updates');
      assert.ok(result.message.includes('No updates available'));
    });

    it('should check for updates without auto-apply', async () => {
      const client = new HMRClient();
      const testUpdate = {
        manifest: { h: 'test', c: [], r: [], m: [] },
        script: 'console.log("Test");',
        originalInfo: { updateId: 'test-update' }
      };
      const provider = async () => ({ update: testUpdate });
      client.setUpdateProvider(provider);
      
      const result = await client.checkForUpdates({ autoApply: false });
      
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.reason, 'updates_available');
      assert.ok(result.updateData);
      assert.strictEqual(result.updateData.update, testUpdate);
    });

    it('should apply update successfully', async () => {
      const client = new HMRClient();
      const updateData = {
        update: {
          manifest: { h: 'apply-test', c: [], r: [], m: [] },
          script: 'exports.modules = {}; exports.runtime = function() {};',
          originalInfo: { updateId: 'apply-test' }
        }
      };
      
      const result = await client.applyUpdate(updateData);
      
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.reason, 'update_applied');
      assert.strictEqual(result.updateId, 'apply-test');
      
      const stats = client.getStats();
      assert.strictEqual(stats.totalUpdates, 1);
      assert.strictEqual(stats.successfulUpdates, 1);
      assert.ok(stats.lastUpdateTime);
    });

    it('should handle apply update when not attached', async () => {
      const client = new HMRClient({ autoAttach: false });
      const updateData = {
        update: {
          manifest: { h: 'test', c: [], r: [], m: [] },
          script: 'test',
          originalInfo: { updateId: 'test' }
        }
      };
      
      const result = await client.applyUpdate(updateData);
      
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.reason, 'apply_error');
      assert.ok(result.message.includes('not attached'));
    });

    it('should force update with minimal update creation', async () => {
      const client = new HMRClient();
      
      const result = await client.forceUpdate();
      
      assert.strictEqual(result.success, true);
      assert.ok(result.updateId.includes('force-update'));
      
      const stats = client.getStats();
      assert.strictEqual(stats.totalUpdates, 1);
      assert.strictEqual(stats.successfulUpdates, 1);
    });

    it('should force update with provided update data', async () => {
      const client = new HMRClient();
      const customUpdate = {
        update: {
          manifest: { h: 'custom-force', c: [], r: [], m: [] },
          script: 'exports.modules = {}; exports.runtime = function() {};',
          originalInfo: { updateId: 'custom-force' }
        }
      };
      
      const result = await client.forceUpdate({ updateData: customUpdate });
      
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.updateId, 'custom-force');
    });

    it('should handle provider errors during check', async () => {
      const client = new HMRClient();
      const provider = async () => {
        throw new Error('Provider error');
      };
      client.setUpdateProvider(provider);
      
      const result = await client.checkForUpdates();
      
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.reason, 'check_error');
      assert.ok(result.error);
      
      const stats = client.getStats();
      assert.strictEqual(stats.failedUpdates, 1);
    });
  });

  describe('Polling Operations', () => {
    it('should start and stop polling', async () => {
      const client = new HMRClient();
      let callCount = 0;
      const provider = async () => {
        callCount++;
        return { update: null };
      };
      client.setUpdateProvider(provider);
      
      const pollingControl = client.startPolling({ interval: 10 });
      
      assert.ok(client.pollingInterval, 'Should set polling interval');
      
      // Wait for a few polls
      await new Promise(resolve => setTimeout(resolve, 50));
      
      pollingControl.stop();
      
      assert.strictEqual(client.pollingInterval, null);
      assert.ok(callCount > 0, 'Should have called provider multiple times');
      
      const hasPollingLog = logMessages.some(msg =>
        msg.includes('Starting update polling')
      );
      assert.ok(hasPollingLog, 'Should log polling start');
    });

    it('should handle polling with force mode', async () => {
      const client = new HMRClient();
      
      const pollingControl = client.startPolling({
        interval: 10,
        forceMode: true
      });
      
      // Wait for at least one force update
      await new Promise(resolve => setTimeout(resolve, 30));
      
      pollingControl.stop();
      
      const stats = client.getStats();
      assert.ok(stats.totalUpdates > 0, 'Should have applied force updates');
    });

    it('should handle polling callbacks', async () => {
      const client = new HMRClient();
      let updateCallbackCalled = false;
      let errorCallbackCalled = false;
      
      const provider = async () => ({ update: null }); // No updates
      client.setUpdateProvider(provider);
      
      const pollingControl = client.startPolling({
        interval: 10,
        onUpdate: (result) => {
          updateCallbackCalled = true;
        },
        onError: (result) => {
          errorCallbackCalled = true;
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 30));
      pollingControl.stop();
      
      // With no updates available, error callback should be called
      assert.ok(errorCallbackCalled, 'Should call error callback for no updates');
    });

    it('should prevent multiple polling instances', () => {
      const client = new HMRClient();
      const provider = async () => ({ update: null });
      client.setUpdateProvider(provider);
      
      const control1 = client.startPolling({ interval: 100 });
      const control2 = client.startPolling({ interval: 100 });
      
      const hasAlreadyActiveLog = logMessages.some(msg =>
        msg.includes('Polling already active')
      );
      assert.ok(hasAlreadyActiveLog, 'Should log polling already active');
      
      control1.stop();
    });

    it('should handle polling errors gracefully', async () => {
      const client = new HMRClient();
      const provider = async () => {
        throw new Error('Polling provider error');
      };
      client.setUpdateProvider(provider);
      
      let errorHandled = false;
      const pollingControl = client.startPolling({
        interval: 10,
        onError: (result) => {
          errorHandled = true;
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 30));
      pollingControl.stop();
      
      assert.ok(errorHandled, 'Should handle polling errors');
    });
  });

  describe('Status and Statistics', () => {
    it('should get correct status', () => {
      const client = new HMRClient();
      const status = client.getStatus();
      
      assert.strictEqual(status.isAttached, true);
      assert.strictEqual(status.hasWebpackRequire, true);
      assert.strictEqual(status.hasModuleHot, true);
      assert.strictEqual(status.hotStatus, 'idle');
      assert.strictEqual(status.webpackHash, 'test-hash-123');
      assert.strictEqual(status.isPolling, false);
      assert.strictEqual(status.hasUpdateProvider, false);
      assert.ok(status.stats);
    });

    it('should get status without webpack runtime', () => {
      delete global.__webpack_require__;
      delete global.module;
      
      const client = new HMRClient({ autoAttach: false });
      client.attach();
      
      const status = client.getStatus();
      
      assert.strictEqual(status.hasWebpackRequire, false);
      assert.strictEqual(status.hasModuleHot, false);
      assert.strictEqual(status.hotStatus, 'unavailable');
      assert.strictEqual(status.webpackHash, null);
    });

    it('should track statistics correctly', async () => {
      const client = new HMRClient();
      
      // In test environment without proper HMR setup, updates should fail but stats should track
      await client.forceUpdate();
      await client.forceUpdate();
      
      const stats = client.getStats();
      assert.strictEqual(stats.totalUpdates, 2);
      // In test environment without real HMR, updates fail but are tracked
      assert.strictEqual(stats.failedUpdates, 2);
      assert.strictEqual(stats.successfulUpdates, 0);
    });

    it('should handle status errors gracefully', () => {
      const client = new HMRClient();
      
      // Mock module.hot.status to throw
      const originalStatus = global.module.hot.status;
      global.module.hot.status = () => {
        throw new Error('Status error');
      };
      
      const status = client.getStatus();
      assert.strictEqual(status.hotStatus, 'error');
      
      // Restore original status
      global.module.hot.status = originalStatus;
    });
  });

  describe('Private Helper Methods', () => {
    it('should log messages when logging is enabled', () => {
      const client = new HMRClient({ logging: true, autoAttach: false });
      
      client.log('Test message');
      
      const hasTestLog = logMessages.some(msg =>
        msg.includes('[HMR Client] Test message')
      );
      assert.ok(hasTestLog, 'Should log with HMR Client prefix');
    });

    it('should not log when logging is disabled', () => {
      const initialLogCount = logMessages.length;
      const client = new HMRClient({ logging: false, autoAttach: false });
      
      client.log('Test message');
      
      assert.strictEqual(logMessages.length, initialLogCount, 'Should not log when disabled');
    });

    it('should get current chunks', () => {
      const client = new HMRClient();
      const chunks = client.getCurrentChunks();
      
      assert.ok(Array.isArray(chunks));
      assert.ok(chunks.includes('index'));
    });

    it('should get current modules', () => {
      const client = new HMRClient();
      const modules = client.getCurrentModules();
      
      assert.ok(Array.isArray(modules));
      assert.ok(modules.includes('./src/index.js'));
    });

    it('should prepare chunk map correctly', () => {
      const client = new HMRClient();
      const update = {
        script: 'test script content'
      };
      
      const chunkMap = client.prepareChunkMap(update);
      
      assert.strictEqual(chunkMap.index, 'test script content');
    });

    it('should create minimal script', () => {
      const client = new HMRClient();
      const script = client.createMinimalScript();
      
      assert.ok(script.includes('exports.modules'));
      assert.ok(script.includes('exports.runtime'));
      assert.ok(script.includes('Force update applied'));
    });

    it('should handle helper method errors gracefully', () => {
      delete global.__webpack_require__;
      
      const client = new HMRClient({ autoAttach: false });
      
      const chunks = client.getCurrentChunks();
      assert.deepStrictEqual(chunks, ['index']);
      
      const modules = client.getCurrentModules();
      assert.deepStrictEqual(modules, []);
      
      const hash = client.getWebpackHash();
      assert.strictEqual(hash, null);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete update workflow', async () => {
      const client = new HMRClient();
      
      // Set up queue provider with test updates
      const updates = [
        {
          manifest: { h: 'workflow-1', c: [], r: [], m: [] },
          script: 'exports.modules = {}; exports.runtime = function() {};',
          originalInfo: { updateId: 'workflow-1' }
        },
        {
          manifest: { h: 'workflow-2', c: [], r: [], m: [] },
          script: 'exports.modules = {}; exports.runtime = function() {};',
          originalInfo: { updateId: 'workflow-2' }
        }
      ];
      
      const provider = HMRClient.createQueueUpdateProvider(updates);
      client.setUpdateProvider(provider);
      
      // Apply first update
      const result1 = await client.checkForUpdates();
      assert.strictEqual(result1.success, true);
      assert.strictEqual(result1.updateId, 'workflow-1');
      
      // Apply second update
      const result2 = await client.checkForUpdates();
      assert.strictEqual(result2.success, true);
      assert.strictEqual(result2.updateId, 'workflow-2');
      
      // No more updates
      const result3 = await client.checkForUpdates();
      assert.strictEqual(result3.success, false);
      assert.strictEqual(result3.reason, 'no_updates');
      
      // Check final stats
      const stats = client.getStats();
      assert.strictEqual(stats.totalUpdates, 2);
      assert.strictEqual(stats.successfulUpdates, 2);
      assert.strictEqual(stats.failedUpdates, 0);
    });

    it('should handle client lifecycle properly', () => {
      const client = new HMRClient({ autoAttach: false });
      
      assert.strictEqual(client.isAttached, false);
      
      // Attach
      const attached = client.attach();
      assert.strictEqual(attached, true);
      assert.strictEqual(client.isAttached, true);
      
      // Set provider and start polling
      const provider = async () => ({ update: null });
      client.setUpdateProvider(provider);
      
      const pollingControl = client.startPolling({ interval: 100 });
      assert.ok(client.pollingInterval, 'Should be polling');
      
      // Detach (should stop polling and cleanup)
      client.detach();
      assert.strictEqual(client.isAttached, false);
      assert.strictEqual(client.pollingInterval, null);
      assert.strictEqual(client.updateProvider, null);
    });
  });
});