import { HMRClient, createHMRClient } from '../utils/hmr-client';
import type { HMRClientOptions, HMRUpdate } from '../types/hmr';

describe('HMR Client Tests', () => {
  let mockWebpackRequire: any;
  let mockModule: any;
  let originalWebpackRequire: any;
  let originalModule: any;
  let originalConsoleLog: typeof console.log;
  let logMessages: string[];

  beforeAll(() => {
    originalWebpackRequire = (global as any).__webpack_require__;
    originalModule = (global as any).module;
    originalConsoleLog = console.log;
    logMessages = [];
    console.log = (...args: any[]) => {
      logMessages.push(args.join(' '));
      originalConsoleLog(...args);
    };
  });

  afterAll(() => {
    if (originalWebpackRequire) {
      (global as any).__webpack_require__ = originalWebpackRequire;
    } else {
      delete (global as any).__webpack_require__;
    }
    if (originalModule) {
      (global as any).module = originalModule;
    } else {
      delete (global as any).module;
    }
    console.log = originalConsoleLog;
  });

  beforeEach(() => {
    logMessages = [];

    // Create mock webpack require
    mockWebpackRequire = {
      h: jest.fn(() => 'test-hash-123'),
      hmrS_readFileVm: {
        index: 0,
        main: 0,
      },
      c: {
        './src/test-module.js': {
          id: './src/test-module.js',
          hot: {
            _selfAccepted: true,
            _selfDeclined: false,
            _selfInvalidated: false,
            status: jest.fn(() => 'idle'),
          },
        },
      },
      m: {
        './src/test-module.js': jest.fn(),
      },
      o: jest.fn((obj: any, prop: string) =>
        Object.prototype.hasOwnProperty.call(obj, prop),
      ),
    };

    // Create mock module with hot API
    mockModule = {
      hot: {
        status: jest.fn(() => 'idle'),
        check: jest.fn(),
        apply: jest.fn(),
        _selfAccepted: false,
        _selfDeclined: false,
        _selfInvalidated: false,
        _acceptedDependencies: {},
        _declinedDependencies: {},
        _acceptedErrorHandlers: {},
        _disposeHandlers: [],
        _main: false,
        active: true,
      },
      exports: {},
    };

    // Set global mocks
    (global as any).__webpack_require__ = mockWebpackRequire;
    (global as any).module = mockModule;
  });

  afterEach(() => {
    // Clean up
    delete (global as any).__webpack_require__;
    delete (global as any).module;
  });

  describe('HMRClient Constructor and Basic Setup', () => {
    it('should create HMR client with default options', () => {
      const client = new HMRClient();

      expect(client).toBeInstanceOf(HMRClient);
      expect(client.getStatus().isAttached).toBe(true); // autoAttach is true by default
    });

    it('should create HMR client with custom options', () => {
      const options: HMRClientOptions = {
        autoAttach: false,
        logging: false,
        pollingInterval: 5000,
        maxRetries: 5,
      };

      const client = new HMRClient(options);

      expect(client.getStatus().isAttached).toBe(false); // autoAttach is false
    });

    it('should initialize stats correctly', () => {
      const client = new HMRClient();
      const stats = client.getStats();

      expect(stats.totalUpdates).toBe(0);
      expect(stats.successfulUpdates).toBe(0);
      expect(stats.failedUpdates).toBe(0);
      expect(stats.lastUpdateTime).toBeNull();
    });

    it('should work with createHMRClient convenience function', () => {
      const client = createHMRClient({ logging: false });

      expect(client).toBeInstanceOf(HMRClient);
    });
  });

  describe('Attach and Detach Operations', () => {
    it('should attach successfully with webpack runtime available', () => {
      const client = new HMRClient({ autoAttach: false });

      const result = client.attach();

      expect(result).toBe(true);
      expect(client.getStatus().isAttached).toBe(true);
    });

    it('should handle multiple attach attempts gracefully', () => {
      const client = new HMRClient({ autoAttach: false });

      const result1 = client.attach();
      const result2 = client.attach();

      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });

    it('should warn when webpack require is not available', () => {
      delete (global as any).__webpack_require__;

      const client = new HMRClient({ autoAttach: false });
      const result = client.attach();

      expect(result).toBe(true); // Still attaches with warning
    });

    it('should warn when module.hot is not available', () => {
      delete (global as any).module.hot;

      const client = new HMRClient({ autoAttach: false });
      const result = client.attach();

      expect(result).toBe(true); // Still attaches with warning
    });

    it('should detach and cleanup properly', () => {
      const client = new HMRClient({ autoAttach: false });
      client.attach();

      client.detach();

      expect(client.getStatus().isAttached).toBe(false);
      expect(client.getStatus().isPolling).toBe(false);
    });
  });

  describe('Update Provider Management', () => {
    it('should set update provider successfully', () => {
      const client = new HMRClient();
      const provider = async () => ({ update: null });

      expect(() => client.setUpdateProvider(provider)).not.toThrow();
      expect(client.getStatus().hasUpdateProvider).toBe(true);
    });

    it('should throw error for invalid provider', () => {
      const client = new HMRClient();

      expect(() => client.setUpdateProvider('invalid' as any)).toThrow(
        'Update provider must be a function',
      );
    });

    it('should create HTTP update provider', () => {
      const provider = HMRClient.createHttpUpdateProvider(
        'http://localhost:3000/updates',
      );

      expect(typeof provider).toBe('function');
    });

    it('should create queue update provider', () => {
      const updates = [
        {
          manifest: { h: 'hash1', c: [], r: [], m: [] },
          script: 'test script',
          originalInfo: { updateId: 'update1', webpackHash: 'hash1' },
        },
      ];
      const provider = HMRClient.createQueueUpdateProvider(updates);

      expect(typeof provider).toBe('function');
    });

    it('should create callback update provider', () => {
      const callback = async (hash: string | null) => ({
        update: {
          manifest: { h: hash || 'default', c: [], r: [], m: [] },
          script: 'test script',
          originalInfo: {
            updateId: 'callback-update',
            webpackHash: hash || 'default',
          },
        },
      });
      const provider = HMRClient.createCallbackUpdateProvider(callback);

      expect(typeof provider).toBe('function');
    });

    it('should handle callback provider errors gracefully', async () => {
      const callback = async () => {
        throw new Error('Provider error');
      };
      const provider = HMRClient.createCallbackUpdateProvider(callback);

      const result = await provider();
      expect(result).toEqual({ update: null });
    });
  });

  describe('Update Operations', () => {
    it('should check for updates with no provider', async () => {
      const client = new HMRClient();

      const result = await client.checkForUpdates();

      expect(result.success).toBe(false);
      expect(result.reason).toBe('no_provider');
    });

    it('should check for updates with no updates available', async () => {
      const client = new HMRClient();
      const provider = async () => ({ update: null });
      client.setUpdateProvider(provider);

      const result = await client.checkForUpdates();

      expect(result.success).toBe(false);
      expect(result.reason).toBe('no_updates');
    });

    it('should check for updates without auto-apply', async () => {
      const client = new HMRClient();
      const updateData: HMRUpdate = {
        update: {
          manifest: { h: 'hash1', c: [], r: [], m: [] },
          script: 'test script',
          originalInfo: { updateId: 'test', webpackHash: 'hash1' },
        },
      };
      const provider = async () => updateData;
      client.setUpdateProvider(provider);

      const result = await client.checkForUpdates({ autoApply: false });

      expect(result.success).toBe(true);
      expect(result.reason).toBe('updates_available');
      expect(result.updateData).toBe(updateData);
    });

    it('should handle apply update when not attached', async () => {
      const client = new HMRClient({ autoAttach: false });
      const updateData: HMRUpdate = {
        update: {
          manifest: { h: 'hash1', c: [], r: [], m: [] },
          script: 'test script',
          originalInfo: { updateId: 'test', webpackHash: 'hash1' },
        },
      };

      const result = await client.applyUpdate(updateData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('not attached');
    });

    it('should force update with minimal update creation', async () => {
      const client = new HMRClient();

      const result = await client.forceUpdate();

      expect(result.reason).toContain('error'); // Will fail without proper HMR setup
    });

    it('should force update with provided update data', async () => {
      const client = new HMRClient();
      const updateData: HMRUpdate = {
        update: {
          manifest: { h: 'hash1', c: [], r: [], m: [] },
          script: 'test script',
          originalInfo: { updateId: 'force-test', webpackHash: 'hash1' },
        },
      };

      const result = await client.forceUpdate({ updateData });

      expect(result.reason).toContain('error'); // Will fail without proper HMR setup
    });

    it('should handle provider errors during check', async () => {
      const client = new HMRClient();
      const provider = async () => {
        throw new Error('Provider error');
      };
      client.setUpdateProvider(provider);

      const result = await client.checkForUpdates();

      expect(result.success).toBe(false);
      expect(result.reason).toBe('check_error');
      expect(result.message).toBe('Provider error');
    });
  });

  describe('Polling Operations', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should start and stop polling', async () => {
      const client = new HMRClient();
      const provider = async () => ({ update: null });
      client.setUpdateProvider(provider);

      const pollingControl = client.startPolling({ interval: 100 });

      expect(client.getStatus().isPolling).toBe(true);

      pollingControl.stop();

      expect(client.getStatus().isPolling).toBe(false);
    });

    it('should handle polling with force mode', async () => {
      const client = new HMRClient();

      const pollingControl = client.startPolling({
        interval: 100,
        forceMode: true,
      });

      expect(client.getStatus().isPolling).toBe(true);

      pollingControl.stop();
    });

    it('should handle multiple polling attempts', () => {
      const client = new HMRClient();
      const provider = async () => ({ update: null });
      client.setUpdateProvider(provider);

      const control1 = client.startPolling({ interval: 100 });
      const control2 = client.startPolling({ interval: 100 });

      // Should return a control object for stopping
      expect(typeof control1.stop).toBe('function');
      expect(typeof control2.stop).toBe('function');

      control1.stop();
    });
  });

  describe('Status and Statistics', () => {
    it('should return correct status information', () => {
      const client = new HMRClient();
      const status = client.getStatus();

      expect(status).toHaveProperty('isAttached');
      expect(status).toHaveProperty('hasWebpackRequire');
      expect(status).toHaveProperty('hasModuleHot');
      expect(status).toHaveProperty('hotStatus');
      expect(status).toHaveProperty('webpackHash');
      expect(status).toHaveProperty('isPolling');
      expect(status).toHaveProperty('hasUpdateProvider');
      expect(status).toHaveProperty('stats');
    });

    it('should track update statistics correctly', () => {
      const client = new HMRClient();
      const stats = client.getStats();

      expect(stats.totalUpdates).toBe(0);
      expect(stats.successfulUpdates).toBe(0);
      expect(stats.failedUpdates).toBe(0);
      expect(stats.lastUpdateTime).toBeNull();
    });

    it('should handle webpack require unavailable', () => {
      delete (global as any).__webpack_require__;

      const client = new HMRClient();
      const status = client.getStatus();

      expect(status.hasWebpackRequire).toBe(false);
      expect(status.webpackHash).toBeNull();
    });

    it('should handle module.hot unavailable', () => {
      delete (global as any).module.hot;

      const client = new HMRClient();
      const status = client.getStatus();

      expect(status.hasModuleHot).toBe(false);
      expect(status.hotStatus).toBe('unavailable');
    });
  });
});
