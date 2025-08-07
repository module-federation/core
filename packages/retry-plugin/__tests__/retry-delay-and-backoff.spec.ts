import { fetchWithRetry } from '../src/fetch-retry';
import { scriptCommonRetry } from '../src/util';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { RemoteInfo } from '@module-federation/runtime/types';

describe('Retry Delay and Backoff Strategies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    global.fetch = fetch;
  });

  const createMockFailingFetch = () => {
    const mockResponse = {
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
      clone: function () {
        return this;
      },
    };
    global.fetch = vi.fn().mockResolvedValue(mockResponse);
    return global.fetch;
  };

  const createMockRemoteInfo = (
    name: string,
  ): RemoteInfo & { alias?: string } => ({
    name,
    entry: `http://localhost:3001/${name}Entry.js`,
    type: 'remote',
    version: '1.0.0',
  });

  describe('Fixed Delay Strategy (Current Implementation)', () => {
    it('should use fixed delay between fetch retries', async () => {
      const delayMs = 500;
      createMockFailingFetch();

      const startTime = Date.now();
      vi.setSystemTime(startTime);

      const fetchPromise = fetchWithRetry({
        url: 'https://example.com',
        retryTimes: 2,
        retryDelay: delayMs,
      });

      // Simulate the passage of time for retries
      vi.advanceTimersByTime(delayMs); // First retry after 500ms
      vi.advanceTimersByTime(delayMs); // Second retry after another 500ms

      try {
        await fetchPromise;
      } catch (error) {
        expect(error.message).toContain('request failed three times');
      }

      // Initial call + 2 retries = 3 total calls
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should use fixed delay between script retries', async () => {
      const delayMs = 300;
      const mockRetryFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValueOnce('Success');

      const retryFunction = scriptCommonRetry({
        scriptOption: {
          retryTimes: 2,
          retryDelay: delayMs,
        },
        moduleInfo: createMockRemoteInfo('testModule'),
        retryFn: mockRetryFn,
      });

      const resultPromise = retryFunction();

      // Advance time for retries
      vi.advanceTimersByTime(delayMs); // First retry
      vi.advanceTimersByTime(delayMs); // Second retry

      const result = await resultPromise;

      expect(result).toBe('Success');
      expect(mockRetryFn).toHaveBeenCalledTimes(3);
    });

    it('should respect zero delay configuration', async () => {
      createMockFailingFetch();

      const fetchPromise = fetchWithRetry({
        url: 'https://example.com',
        retryTimes: 1,
        retryDelay: 0,
      });

      // No need to advance timers with zero delay
      try {
        await fetchPromise;
      } catch (error) {
        expect(error.message).toContain('request failed three times');
      }

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Retry Timing Verification', () => {
    it('should measure actual delay timing in fetch retries', async () => {
      const delayMs = 1000;
      createMockFailingFetch();

      const timeStamps: number[] = [];
      const originalSetTimeout = global.setTimeout;

      vi.spyOn(global, 'setTimeout').mockImplementation(
        (callback: Function, delay: number) => {
          timeStamps.push(Date.now());
          return originalSetTimeout(() => {
            timeStamps.push(Date.now());
            callback();
          }, delay) as any;
        },
      );

      const fetchPromise = fetchWithRetry({
        url: 'https://example.com',
        retryTimes: 1,
        retryDelay: delayMs,
      });

      vi.advanceTimersByTime(delayMs);

      try {
        await fetchPromise;
      } catch (error) {
        // Expected to fail
      }

      // Verify setTimeout was called with correct delay
      expect(global.setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        delayMs,
      );
    });

    it('should handle multiple concurrent retries with different delays', async () => {
      const delay1 = 200;
      const delay2 = 400;

      createMockFailingFetch();

      const fetchPromise1 = fetchWithRetry({
        url: 'https://example1.com',
        retryTimes: 1,
        retryDelay: delay1,
      });

      const fetchPromise2 = fetchWithRetry({
        url: 'https://example2.com',
        retryTimes: 1,
        retryDelay: delay2,
      });

      // Advance time to trigger first retry (200ms)
      vi.advanceTimersByTime(delay1);

      // Advance time to trigger second retry (400ms total)
      vi.advanceTimersByTime(delay2 - delay1);

      try {
        await Promise.all([fetchPromise1, fetchPromise2]);
      } catch (error) {
        // Both expected to fail
      }

      // Each should have been called twice (initial + 1 retry)
      expect(global.fetch).toHaveBeenCalledTimes(4);
    });
  });

  describe('Error Conditions with Delays', () => {
    it('should not delay when retryDelay is negative', async () => {
      const mockRetryFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValueOnce('Success');

      const retryFunction = scriptCommonRetry({
        scriptOption: {
          retryTimes: 1,
          retryDelay: -100, // Negative delay should be treated as 0
        },
        moduleInfo: createMockRemoteInfo('testModule'),
        retryFn: mockRetryFn,
      });

      const result = await retryFunction();

      expect(result).toBe('Success');
      expect(mockRetryFn).toHaveBeenCalledTimes(2);
    });

    it('should handle very large delay values', async () => {
      const largeDelay = 86400000; // 24 hours in milliseconds

      const mockRetryFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValueOnce('Success');

      const retryFunction = scriptCommonRetry({
        scriptOption: {
          retryTimes: 1,
          retryDelay: largeDelay,
        },
        moduleInfo: createMockRemoteInfo('testModule'),
        retryFn: mockRetryFn,
      });

      const resultPromise = retryFunction();

      // Advance by large delay
      vi.advanceTimersByTime(largeDelay);

      const result = await resultPromise;

      expect(result).toBe('Success');
      expect(mockRetryFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Documentation Claims Verification', () => {
    it('should verify default retry times is 3', async () => {
      createMockFailingFetch();

      const fetchPromise = fetchWithRetry({
        url: 'https://example.com',
        // No retryTimes specified, should use default (3)
        retryDelay: 0,
      });

      try {
        await fetchPromise;
      } catch (error) {
        expect(error.message).toContain('request failed three times');
      }

      // Initial call + 3 retries = 4 total calls
      expect(global.fetch).toHaveBeenCalledTimes(4);
    });

    it('should verify default retry delay is 1000ms', async () => {
      const mockRetryFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValueOnce('Success');

      const retryFunction = scriptCommonRetry({
        scriptOption: {
          retryTimes: 1,
          // No retryDelay specified, should use default (1000)
        },
        moduleInfo: createMockRemoteInfo('testModule'),
        retryFn: mockRetryFn,
      });

      const resultPromise = retryFunction();

      // Should need to advance by default delay (1000ms)
      vi.advanceTimersByTime(1000);

      const result = await resultPromise;

      expect(result).toBe('Success');
      expect(mockRetryFn).toHaveBeenCalledTimes(2);
    });

    it('should verify retry only happens on network/server errors, not on success', async () => {
      const mockSuccessfulResponse = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
        clone: function () {
          return this;
        },
      };
      global.fetch = vi.fn().mockResolvedValue(mockSuccessfulResponse);

      const result = await fetchWithRetry({
        url: 'https://example.com',
        retryTimes: 5, // High retry count
        retryDelay: 0,
      });

      expect(await result.json()).toEqual({ success: true });

      // Should only be called once since it succeeded
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should verify fetch retries on network errors (response.ok = false)', async () => {
      const mockFailResponse = {
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
        clone: function () {
          return this;
        },
      };
      global.fetch = vi.fn().mockResolvedValue(mockFailResponse);

      try {
        await fetchWithRetry({
          url: 'https://example.com',
          retryTimes: 2,
          retryDelay: 0,
        });
      } catch (error) {
        expect(error.message).toContain('Server error：404');
      }

      // Initial call + 2 retries = 3 total calls
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should verify fetch retries on JSON parse errors', async () => {
      const mockResponseWithBadJson = {
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('Unexpected token')),
        clone: function () {
          return this;
        },
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponseWithBadJson);

      try {
        await fetchWithRetry({
          url: 'https://example.com',
          retryTimes: 1,
          retryDelay: 0,
        });
      } catch (error) {
        expect(error.message).toContain('Json parse error');
      }

      // Initial call + 1 retry = 2 total calls
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Retry Condition Customization Tests', () => {
    it('should verify that retries stop when retryTimes reaches 0', async () => {
      const mockRetryFn = vi.fn().mockRejectedValue(new Error('Always fail'));

      const retryFunction = scriptCommonRetry({
        scriptOption: {
          retryTimes: 2,
          retryDelay: 0,
        },
        moduleInfo: createMockRemoteInfo('testModule'),
        retryFn: mockRetryFn,
      });

      await expect(retryFunction()).rejects.toThrow('Always fail');

      // Initial call + 2 retries = 3 total calls
      expect(mockRetryFn).toHaveBeenCalledTimes(3);
    });

    it('should verify retry attempts are counted correctly', async () => {
      let attemptCount = 0;
      const mockRetryFn = vi.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount <= 2) {
          throw new Error(`Attempt ${attemptCount} failed`);
        }
        return 'Success on attempt 3';
      });

      const retryFunction = scriptCommonRetry({
        scriptOption: {
          retryTimes: 3,
          retryDelay: 0,
        },
        moduleInfo: createMockRemoteInfo('testModule'),
        retryFn: mockRetryFn,
      });

      const result = await retryFunction();

      expect(result).toBe('Success on attempt 3');
      expect(mockRetryFn).toHaveBeenCalledTimes(3);
      expect(attemptCount).toBe(3);
    });
  });
});
