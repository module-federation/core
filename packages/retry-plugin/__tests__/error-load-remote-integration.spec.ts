import { RetryPlugin } from '../src/index';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type {
  RemoteInfo,
  RemoteEntryExports,
} from '@module-federation/runtime/types';

describe('errorLoadRemote Hook Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const createMockRemoteInfo = (
    name: string,
    alias?: string,
  ): RemoteInfo & { alias?: string } => ({
    name,
    entry: `http://localhost:3001/${name}Entry.js`,
    type: 'remote',
    version: '1.0.0',
    ...(alias && { alias }),
  });

  const createMockRemoteEntryExports = (): RemoteEntryExports => ({
    get: vi.fn(),
    init: vi.fn(),
  });

  describe('loadEntryError Hook Integration', () => {
    it('should integrate with loadEntryError lifecycle when script retry is configured', async () => {
      const plugin = RetryPlugin({
        script: {
          retryTimes: 2,
          retryDelay: 100,
        },
      });

      const mockGetRemoteEntry = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockRejectedValueOnce(new Error('Connection refused'))
        .mockResolvedValueOnce(createMockRemoteEntryExports());

      const mockGlobalLoading = {};
      const uniqueKey = 'test-remote-key';

      const result = await plugin.loadEntryError({
        getRemoteEntry: mockGetRemoteEntry,
        origin: {} as any,
        remoteInfo: createMockRemoteInfo('testRemote'),
        remoteEntryExports: undefined,
        globalLoading: mockGlobalLoading,
        uniqueKey,
      });

      // Advance time for retries
      vi.advanceTimersByTime(250);

      expect(result).toBeDefined();
      expect(mockGetRemoteEntry).toHaveBeenCalledTimes(3);

      // Verify globalLoading is cleaned up before each retry
      expect(mockGlobalLoading[uniqueKey]).toBeUndefined();
    });

    it('should not call loadEntryError if script option is not configured', async () => {
      const plugin = RetryPlugin({
        fetch: { retryTimes: 3 }, // Only fetch, no script
      });

      const result = await plugin.loadEntryError({
        getRemoteEntry: vi.fn(),
        origin: {} as any,
        remoteInfo: createMockRemoteInfo('testRemote'),
        remoteEntryExports: undefined,
        globalLoading: {},
        uniqueKey: 'test',
      });

      expect(result).toBeUndefined();
    });

    it('should pass correct parameters to retry function', async () => {
      const plugin = RetryPlugin({
        script: {
          retryTimes: 1,
          retryDelay: 50,
        },
      });

      const mockGetRemoteEntry = vi
        .fn()
        .mockResolvedValue(createMockRemoteEntryExports());
      const mockOrigin = { name: 'host' };
      const mockRemoteInfo = createMockRemoteInfo('testRemote');
      const mockRemoteEntryExports = createMockRemoteEntryExports();
      const mockGlobalLoading = {};
      const uniqueKey = 'unique-test-key';

      await plugin.loadEntryError({
        getRemoteEntry: mockGetRemoteEntry,
        origin: mockOrigin as any,
        remoteInfo: mockRemoteInfo,
        remoteEntryExports: mockRemoteEntryExports,
        globalLoading: mockGlobalLoading,
        uniqueKey,
      });

      // Verify getRemoteEntry was called with correct parameters
      expect(mockGetRemoteEntry).toHaveBeenCalledWith({
        origin: mockOrigin,
        remoteInfo: mockRemoteInfo,
        remoteEntryExports: mockRemoteEntryExports,
      });
    });

    it('should clean up globalLoading before each retry attempt', async () => {
      const plugin = RetryPlugin({
        script: {
          retryTimes: 2,
          retryDelay: 0,
        },
      });

      const uniqueKey = 'cleanup-test';
      const mockGlobalLoading = {
        [uniqueKey]: Promise.resolve('existing-promise'),
      };

      const mockGetRemoteEntry = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockImplementation(() => {
          // Verify cleanup happened before this call
          expect(mockGlobalLoading[uniqueKey]).toBeUndefined();
          return Promise.resolve(createMockRemoteEntryExports());
        });

      await plugin.loadEntryError({
        getRemoteEntry: mockGetRemoteEntry,
        origin: {} as any,
        remoteInfo: createMockRemoteInfo('testRemote'),
        remoteEntryExports: undefined,
        globalLoading: mockGlobalLoading,
        uniqueKey,
      });

      expect(mockGetRemoteEntry).toHaveBeenCalledTimes(2);
    });
  });

  describe('getModuleFactory Hook Integration', () => {
    it('should retry getModuleFactory when script retry is configured', async () => {
      const plugin = RetryPlugin({
        script: {
          retryTimes: 2,
          retryDelay: 100,
        },
      });

      const mockRemoteEntryExports = {
        get: vi
          .fn()
          .mockRejectedValueOnce(new Error('Module not found'))
          .mockRejectedValueOnce(new Error('Loading failed'))
          .mockResolvedValueOnce(() => ({ default: 'ComponentFactory' })),
      };

      const result = await plugin.getModuleFactory({
        remoteEntryExports: mockRemoteEntryExports,
        expose: './Component',
        moduleInfo: createMockRemoteInfo('testRemote'),
      });

      vi.advanceTimersByTime(250);

      expect(result).toBeDefined();
      expect(mockRemoteEntryExports.get).toHaveBeenCalledTimes(3);
      expect(mockRemoteEntryExports.get).toHaveBeenCalledWith('./Component');
    });

    it('should not retry getModuleFactory if script option is not configured', async () => {
      const plugin = RetryPlugin({
        fetch: { retryTimes: 3 }, // Only fetch, no script
      });

      const mockRemoteEntryExports = {
        get: vi.fn().mockResolvedValue(() => ({ default: 'Component' })),
      };

      const result = await plugin.getModuleFactory({
        remoteEntryExports: mockRemoteEntryExports,
        expose: './Component',
        moduleInfo: createMockRemoteInfo('testRemote'),
      });

      expect(result).toBeUndefined();
      expect(mockRemoteEntryExports.get).not.toHaveBeenCalled();
    });

    it('should respect moduleName filtering in getModuleFactory', async () => {
      const plugin = RetryPlugin({
        script: {
          retryTimes: 1,
          moduleName: ['allowedModule'],
        },
      });

      const mockRemoteEntryExports = {
        get: vi.fn().mockResolvedValue(() => ({ default: 'Component' })),
      };

      // Test allowed module
      const allowedResult = await plugin.getModuleFactory({
        remoteEntryExports: mockRemoteEntryExports,
        expose: './AllowedComponent',
        moduleInfo: createMockRemoteInfo('allowedModule'),
      });

      expect(allowedResult).toBeDefined();
      expect(mockRemoteEntryExports.get).toHaveBeenCalledWith(
        './AllowedComponent',
      );

      // Reset mock
      mockRemoteEntryExports.get.mockClear();

      // Test disallowed module
      const disallowedResult = await plugin.getModuleFactory({
        remoteEntryExports: mockRemoteEntryExports,
        expose: './DisallowedComponent',
        moduleInfo: createMockRemoteInfo('disallowedModule'),
      });

      expect(disallowedResult).toBeUndefined();
      expect(mockRemoteEntryExports.get).not.toHaveBeenCalled();
    });

    it('should handle module alias matching in getModuleFactory', async () => {
      const plugin = RetryPlugin({
        script: {
          retryTimes: 1,
          moduleName: ['moduleAlias'],
        },
      });

      const mockRemoteEntryExports = {
        get: vi.fn().mockResolvedValue(() => ({ default: 'AliasedComponent' })),
      };

      const result = await plugin.getModuleFactory({
        remoteEntryExports: mockRemoteEntryExports,
        expose: './Component',
        moduleInfo: createMockRemoteInfo('actualModuleName', 'moduleAlias'),
      });

      expect(result).toBeDefined();
      expect(mockRemoteEntryExports.get).toHaveBeenCalledWith('./Component');
    });
  });

  describe('Error Handling in Hook Integration', () => {
    it('should propagate errors after all retries fail in loadEntryError', async () => {
      const plugin = RetryPlugin({
        script: {
          retryTimes: 2,
          retryDelay: 0,
        },
      });

      const finalError = new Error('All retries exhausted');
      const mockGetRemoteEntry = vi.fn().mockRejectedValue(finalError);

      await expect(
        plugin.loadEntryError({
          getRemoteEntry: mockGetRemoteEntry,
          origin: {} as any,
          remoteInfo: createMockRemoteInfo('failingRemote'),
          remoteEntryExports: undefined,
          globalLoading: {},
          uniqueKey: 'failing-key',
        }),
      ).rejects.toThrow('All retries exhausted');

      expect(mockGetRemoteEntry).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should propagate errors after all retries fail in getModuleFactory', async () => {
      const plugin = RetryPlugin({
        script: {
          retryTimes: 1,
          retryDelay: 0,
        },
      });

      const finalError = new Error('Module factory failed');
      const mockRemoteEntryExports = {
        get: vi.fn().mockRejectedValue(finalError),
      };

      await expect(
        plugin.getModuleFactory({
          remoteEntryExports: mockRemoteEntryExports,
          expose: './FailingComponent',
          moduleInfo: createMockRemoteInfo('failingModule'),
        }),
      ).rejects.toThrow('Module factory failed');

      expect(mockRemoteEntryExports.get).toHaveBeenCalledTimes(2); // Initial + 1 retry
    });

    it('should call error callback after retries fail', async () => {
      const mockCallback = vi.fn((resolve, error) => {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Callback test error');
        setTimeout(() => resolve(null), 100);
      });

      const plugin = RetryPlugin({
        script: {
          retryTimes: 1,
          retryDelay: 0,
          cb: mockCallback,
        },
      });

      const testError = new Error('Callback test error');
      const mockGetRemoteEntry = vi.fn().mockRejectedValue(testError);

      try {
        await plugin.loadEntryError({
          getRemoteEntry: mockGetRemoteEntry,
          origin: {} as any,
          remoteInfo: createMockRemoteInfo('callbackTest'),
          remoteEntryExports: undefined,
          globalLoading: {},
          uniqueKey: 'callback-test',
        });

        // Advance time for callback delay
        vi.advanceTimersByTime(150);
      } catch (error) {
        // Expected to eventually throw
      }

      expect(mockCallback).toHaveBeenCalledWith(
        expect.any(Function),
        testError,
      );
    });
  });

  describe('Hook Return Value Integration', () => {
    it('should return result from successful retry in loadEntryError', async () => {
      const plugin = RetryPlugin({
        script: {
          retryTimes: 1,
          retryDelay: 0,
        },
      });

      const expectedResult = createMockRemoteEntryExports();
      const mockGetRemoteEntry = vi
        .fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValueOnce(expectedResult);

      const result = await plugin.loadEntryError({
        getRemoteEntry: mockGetRemoteEntry,
        origin: {} as any,
        remoteInfo: createMockRemoteInfo('successRetry'),
        remoteEntryExports: undefined,
        globalLoading: {},
        uniqueKey: 'success-key',
      });

      expect(result).toBe(expectedResult);
      expect(mockGetRemoteEntry).toHaveBeenCalledTimes(2);
    });

    it('should return result from successful retry in getModuleFactory', async () => {
      const plugin = RetryPlugin({
        script: {
          retryTimes: 1,
          retryDelay: 0,
        },
      });

      const expectedFactory = () => ({ default: 'SuccessfulComponent' });
      const mockRemoteEntryExports = {
        get: vi
          .fn()
          .mockRejectedValueOnce(new Error('First attempt failed'))
          .mockResolvedValueOnce(expectedFactory),
      };

      const result = await plugin.getModuleFactory({
        remoteEntryExports: mockRemoteEntryExports,
        expose: './SuccessComponent',
        moduleInfo: createMockRemoteInfo('successModule'),
      });

      expect(result).toBe(expectedFactory);
      expect(mockRemoteEntryExports.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Concurrent Hook Execution', () => {
    it('should handle concurrent loadEntryError calls independently', async () => {
      const plugin = RetryPlugin({
        script: {
          retryTimes: 1,
          retryDelay: 100,
        },
      });

      const mockGetRemoteEntry1 = vi
        .fn()
        .mockRejectedValueOnce(new Error('Remote1 fail'))
        .mockResolvedValueOnce(createMockRemoteEntryExports());

      const mockGetRemoteEntry2 = vi
        .fn()
        .mockRejectedValueOnce(new Error('Remote2 fail'))
        .mockResolvedValueOnce(createMockRemoteEntryExports());

      const promise1 = plugin.loadEntryError({
        getRemoteEntry: mockGetRemoteEntry1,
        origin: {} as any,
        remoteInfo: createMockRemoteInfo('concurrent1'),
        remoteEntryExports: undefined,
        globalLoading: {},
        uniqueKey: 'concurrent1',
      });

      const promise2 = plugin.loadEntryError({
        getRemoteEntry: mockGetRemoteEntry2,
        origin: {} as any,
        remoteInfo: createMockRemoteInfo('concurrent2'),
        remoteEntryExports: undefined,
        globalLoading: {},
        uniqueKey: 'concurrent2',
      });

      vi.advanceTimersByTime(150);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(mockGetRemoteEntry1).toHaveBeenCalledTimes(2);
      expect(mockGetRemoteEntry2).toHaveBeenCalledTimes(2);
    });

    it('should handle concurrent getModuleFactory calls independently', async () => {
      const plugin = RetryPlugin({
        script: {
          retryTimes: 1,
          retryDelay: 50,
        },
      });

      const mockRemoteEntryExports1 = {
        get: vi
          .fn()
          .mockRejectedValueOnce(new Error('Factory1 fail'))
          .mockResolvedValueOnce(() => ({ default: 'Component1' })),
      };

      const mockRemoteEntryExports2 = {
        get: vi
          .fn()
          .mockRejectedValueOnce(new Error('Factory2 fail'))
          .mockResolvedValueOnce(() => ({ default: 'Component2' })),
      };

      const promise1 = plugin.getModuleFactory({
        remoteEntryExports: mockRemoteEntryExports1,
        expose: './Component1',
        moduleInfo: createMockRemoteInfo('module1'),
      });

      const promise2 = plugin.getModuleFactory({
        remoteEntryExports: mockRemoteEntryExports2,
        expose: './Component2',
        moduleInfo: createMockRemoteInfo('module2'),
      });

      vi.advanceTimersByTime(100);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(mockRemoteEntryExports1.get).toHaveBeenCalledTimes(2);
      expect(mockRemoteEntryExports2.get).toHaveBeenCalledTimes(2);
    });
  });
});
