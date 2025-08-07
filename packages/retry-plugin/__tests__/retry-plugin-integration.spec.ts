import { RetryPlugin } from '../src/index';
import { fetchWithRetry } from '../src/fetch-retry';
import { scriptCommonRetry } from '../src/util';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { RemoteInfo } from '@module-federation/runtime/types';

describe('RetryPlugin Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    global.fetch = fetch;
  });

  describe('RetryPlugin Configuration', () => {
    it('should create plugin with fetch configuration', () => {
      const plugin = RetryPlugin({
        fetch: {
          url: 'https://example.com/manifest.json',
          retryTimes: 5,
          retryDelay: 2000,
          fallback: () => 'https://fallback.com/manifest.json',
        },
      });

      expect(plugin.name).toBe('retry-plugin');
      expect(plugin.fetch).toBeDefined();
    });

    it('should create plugin with script configuration', () => {
      const plugin = RetryPlugin({
        script: {
          retryTimes: 3,
          retryDelay: 1500,
          moduleName: ['remote1', 'remote2'],
          cb: (resolve, error) => resolve(error),
        },
      });

      expect(plugin.name).toBe('retry-plugin');
      expect(plugin.loadEntryError).toBeDefined();
      expect(plugin.getModuleFactory).toBeDefined();
    });

    it('should create plugin with both fetch and script configuration', () => {
      const plugin = RetryPlugin({
        fetch: { retryTimes: 2 },
        script: { retryTimes: 4 },
      });

      expect(plugin.name).toBe('retry-plugin');
      expect(plugin.fetch).toBeDefined();
      expect(plugin.loadEntryError).toBeDefined();
      expect(plugin.getModuleFactory).toBeDefined();
    });
  });

  describe('Fetch Retry Mechanism', () => {
    const mockSuccessfulFetch = (data: any) => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: () => Promise.resolve(data),
        clone: function () {
          return this;
        },
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);
      return global.fetch;
    };

    const mockFailingFetch = (status = 500) => {
      const mockResponse = {
        ok: false,
        status,
        json: () => Promise.resolve({}),
        clone: function () {
          return this;
        },
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);
      return global.fetch;
    };

    it('should retry for specific URL when configured', async () => {
      const plugin = RetryPlugin({
        fetch: {
          url: 'https://example.com/specific.json',
          retryTimes: 2,
          retryDelay: 100,
        },
      });

      mockFailingFetch();

      try {
        await plugin.fetch('https://example.com/specific.json', {});
        vi.advanceTimersByTime(300);
      } catch (error) {
        // Expected to fail after retries
      }

      // Initial call + 2 retries = 3 total calls
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should retry for all URLs when no specific URL configured', async () => {
      const plugin = RetryPlugin({
        fetch: {
          retryTimes: 1,
          retryDelay: 50,
        },
      });

      mockFailingFetch();

      try {
        await plugin.fetch('https://any-url.com/manifest.json', {});
        vi.advanceTimersByTime(100);
      } catch (error) {
        // Expected to fail after retries
      }

      // Initial call + 1 retry = 2 total calls
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should not retry if no fetch configuration', async () => {
      const plugin = RetryPlugin({
        script: { retryTimes: 3 },
      });

      const mockData = { success: true };
      mockSuccessfulFetch(mockData);

      const result = await plugin.fetch('https://example.com', {});
      expect(await result.json()).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should use fallback function after all retries fail', async () => {
      const fallbackMock = vi.fn(() => 'https://fallback.com');
      const plugin = RetryPlugin({
        fetch: {
          retryTimes: 1,
          retryDelay: 0,
          fallback: fallbackMock,
        },
      });

      mockFailingFetch();

      try {
        await plugin.fetch('https://primary.com', {});
      } catch (error) {
        // Expected to fail even with fallback if fallback also fails
      }

      expect(fallbackMock).toHaveBeenCalledWith('https://primary.com');
    });
  });

  describe('Script Retry Mechanism via loadEntryError', () => {
    const createMockRemoteInfo = (name: string): RemoteInfo => ({
      name,
      entry: `http://localhost:3001/${name}Entry.js`,
      type: 'remote',
      version: '1.0.0',
    });

    it('should retry script loading for configured modules', async () => {
      const plugin = RetryPlugin({
        script: {
          retryTimes: 2,
          retryDelay: 100,
          moduleName: ['remote1'],
        },
      });

      const mockGetRemoteEntry = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ get: () => {} });

      const result = await plugin.loadEntryError({
        getRemoteEntry: mockGetRemoteEntry,
        origin: {} as any,
        remoteInfo: createMockRemoteInfo('remote1'),
        remoteEntryExports: undefined,
        globalLoading: {},
        uniqueKey: 'remote1',
      });

      vi.advanceTimersByTime(300);

      // Initial call + 2 retries = 3 total calls
      expect(mockGetRemoteEntry).toHaveBeenCalledTimes(3);
      expect(result).toBeDefined();
    });

    it('should not retry for modules not in moduleName list', async () => {
      const plugin = RetryPlugin({
        script: {
          retryTimes: 3,
          moduleName: ['remote1'],
        },
      });

      const mockGetRemoteEntry = vi.fn().mockResolvedValue({ get: () => {} });

      await plugin.loadEntryError({
        getRemoteEntry: mockGetRemoteEntry,
        origin: {} as any,
        remoteInfo: createMockRemoteInfo('remote2'), // Not in moduleName list
        remoteEntryExports: undefined,
        globalLoading: {},
        uniqueKey: 'remote2',
      });

      // Should not call retry since module is not in the list
      expect(mockGetRemoteEntry).not.toHaveBeenCalled();
    });

    it('should retry all modules when moduleName is undefined', async () => {
      const plugin = RetryPlugin({
        script: {
          retryTimes: 1,
          retryDelay: 50,
        },
      });

      const mockGetRemoteEntry = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValueOnce({ get: () => {} });

      const result = await plugin.loadEntryError({
        getRemoteEntry: mockGetRemoteEntry,
        origin: {} as any,
        remoteInfo: createMockRemoteInfo('anyModule'),
        remoteEntryExports: undefined,
        globalLoading: {},
        uniqueKey: 'anyModule',
      });

      vi.advanceTimersByTime(100);

      // Initial call + 1 retry = 2 total calls
      expect(mockGetRemoteEntry).toHaveBeenCalledTimes(2);
      expect(result).toBeDefined();
    });

    it('should call callback function after all retries fail', async () => {
      const mockCallback = vi.fn((resolve, error) => {
        setTimeout(() => resolve(error), 100);
      });

      const plugin = RetryPlugin({
        script: {
          retryTimes: 1,
          retryDelay: 0,
          cb: mockCallback,
        },
      });

      const mockGetRemoteEntry = vi
        .fn()
        .mockRejectedValue(new Error('Always fail'));

      try {
        await plugin.loadEntryError({
          getRemoteEntry: mockGetRemoteEntry,
          origin: {} as any,
          remoteInfo: createMockRemoteInfo('testModule'),
          remoteEntryExports: undefined,
          globalLoading: {},
          uniqueKey: 'testModule',
        });

        vi.advanceTimersByTime(200);
      } catch (error) {
        // Expected to eventually fail
      }

      expect(mockCallback).toHaveBeenCalled();
      expect(mockGetRemoteEntry).toHaveBeenCalledTimes(2); // Initial + 1 retry
    });
  });

  describe('Script Retry via getModuleFactory', () => {
    it('should retry module factory retrieval', async () => {
      const plugin = RetryPlugin({
        script: {
          retryTimes: 2,
          retryDelay: 50,
        },
      });

      const mockRemoteEntryExports = {
        get: vi
          .fn()
          .mockRejectedValueOnce(new Error('Fail 1'))
          .mockRejectedValueOnce(new Error('Fail 2'))
          .mockResolvedValueOnce(() => ({ default: 'component' })),
      };

      const result = await plugin.getModuleFactory({
        remoteEntryExports: mockRemoteEntryExports,
        expose: './Component',
        moduleInfo: createMockRemoteInfo('testModule'),
      });

      vi.advanceTimersByTime(150);

      expect(mockRemoteEntryExports.get).toHaveBeenCalledTimes(3);
      expect(result).toBeDefined();
    });

    it('should respect module name filtering for getModuleFactory', async () => {
      const plugin = RetryPlugin({
        script: {
          retryTimes: 2,
          moduleName: ['allowedModule'],
        },
      });

      const mockRemoteEntryExports = {
        get: vi.fn().mockResolvedValue(() => ({ default: 'component' })),
      };

      // Test with allowed module
      await plugin.getModuleFactory({
        remoteEntryExports: mockRemoteEntryExports,
        expose: './Component',
        moduleInfo: createMockRemoteInfo('allowedModule'),
      });

      expect(mockRemoteEntryExports.get).toHaveBeenCalledTimes(1);

      // Reset mock
      mockRemoteEntryExports.get.mockClear();

      // Test with disallowed module
      const result = await plugin.getModuleFactory({
        remoteEntryExports: mockRemoteEntryExports,
        expose: './Component',
        moduleInfo: createMockRemoteInfo('disallowedModule'),
      });

      expect(result).toBeUndefined();
      expect(mockRemoteEntryExports.get).not.toHaveBeenCalled();
    });
  });

  describe('Default Configuration Values', () => {
    it('should use default retry times when not specified', async () => {
      const plugin = RetryPlugin({
        fetch: {}, // No retryTimes specified
      });

      mockFailingFetch();

      try {
        await plugin.fetch('https://example.com', {});
        vi.advanceTimersByTime(5000);
      } catch (error) {
        // Expected to fail
      }

      // Should use default retryTimes (3) = initial + 3 retries = 4 calls
      expect(global.fetch).toHaveBeenCalledTimes(4);
    });

    it('should use default retry delay when not specified', async () => {
      const plugin = RetryPlugin({
        script: {
          retryTimes: 1, // Only 1 retry for faster test
        },
      });

      const mockGetRemoteEntry = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValueOnce({ get: () => {} });

      const startTime = Date.now();

      await plugin.loadEntryError({
        getRemoteEntry: mockGetRemoteEntry,
        origin: {} as any,
        remoteInfo: createMockRemoteInfo('testModule'),
        remoteEntryExports: undefined,
        globalLoading: {},
        uniqueKey: 'testModule',
      });

      // Advance timers by default delay (1000ms)
      vi.advanceTimersByTime(1100);

      expect(mockGetRemoteEntry).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle JSON parse errors correctly in fetch retry', async () => {
      const plugin = RetryPlugin({
        fetch: {
          retryTimes: 1,
          retryDelay: 0,
        },
      });

      const mockResponse = {
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('Invalid JSON')),
        clone: function () {
          return this;
        },
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await expect(plugin.fetch('https://example.com', {})).rejects.toThrow(
        'Json parse error',
      );
    });

    it('should handle network errors in script retry', async () => {
      const plugin = RetryPlugin({
        script: {
          retryTimes: 1,
          retryDelay: 0,
        },
      });

      const networkError = new Error('Network unreachable');
      const mockGetRemoteEntry = vi.fn().mockRejectedValue(networkError);

      await expect(
        plugin.loadEntryError({
          getRemoteEntry: mockGetRemoteEntry,
          origin: {} as any,
          remoteInfo: createMockRemoteInfo('testModule'),
          remoteEntryExports: undefined,
          globalLoading: {},
          uniqueKey: 'testModule',
        }),
      ).rejects.toThrow('Network unreachable');

      expect(mockGetRemoteEntry).toHaveBeenCalledTimes(2); // Initial + 1 retry
    });
  });

  describe('Integration with Module Alias', () => {
    it('should respect module alias in moduleName matching', async () => {
      const plugin = RetryPlugin({
        script: {
          retryTimes: 1,
          moduleName: ['aliasedRemote'],
        },
      });

      const mockGetRemoteEntry = vi.fn().mockResolvedValue({ get: () => {} });

      const remoteInfoWithAlias = {
        ...createMockRemoteInfo('actualRemoteName'),
        alias: 'aliasedRemote',
      };

      await plugin.loadEntryError({
        getRemoteEntry: mockGetRemoteEntry,
        origin: {} as any,
        remoteInfo: remoteInfoWithAlias,
        remoteEntryExports: undefined,
        globalLoading: {},
        uniqueKey: 'test',
      });

      expect(mockGetRemoteEntry).toHaveBeenCalledTimes(1);
    });
  });
});
