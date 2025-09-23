import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchRetry } from '../src/fetch-retry';
import { scriptRetry } from '../src/script-retry';
import { ERROR_ABANDONED, RUNTIME_008 } from '../src/constant';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('../src/logger', () => ({
  default: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Retry Plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('fetchRetry', () => {
    it('should retry on fetch failure', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
        clone: () => ({
          ok: true,
          json: () => Promise.resolve({ data: 'test' }),
        }),
      };
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockResponse);

      const result = await fetchRetry({
        url: 'https://example.com/api',
        retryTimes: 1, // 1次重试
        retryDelay: 10,
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toBe(mockResponse);
    });

    it('should respect retryTimes limit', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        fetchRetry({
          url: 'https://example.com/api',
          retryTimes: 2,
          retryDelay: 10,
        }),
      ).rejects.toThrow(RUNTIME_008);

      expect(mockFetch).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    });

    it('should rotate domains on retry', async () => {
      const domains = ['https://domain1.com', 'https://domain2.com'];
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        fetchRetry({
          url: 'https://example.com/api',
          retryTimes: 2,
          retryDelay: 10,
          domains,
        }),
      ).rejects.toThrow();

      // Check that different domains were used
      const calls = mockFetch.mock.calls;
      expect(calls[1][0]).toContain('domain1.com');
      expect(calls[2][0]).toContain('domain2.com');
    });

    it('should add retry count query parameter', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        fetchRetry({
          url: 'https://example.com/api',
          retryTimes: 2,
          retryDelay: 10,
          addQuery: true,
        }),
      ).rejects.toThrow();

      const calls = mockFetch.mock.calls;
      expect(calls[1][0]).toContain('retryCount=1');
      expect(calls[2][0]).toContain('retryCount=2');
    });

    it('should call onRetry callback', async () => {
      const onRetry = vi.fn();
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        fetchRetry({
          url: 'https://example.com/api',
          retryTimes: 2,
          retryDelay: 10,
          onRetry,
        }),
      ).rejects.toThrow();

      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenCalledWith({
        times: 1,
        domains: undefined,
        url: 'https://example.com/api',
        tagName: 'fetch',
      });
    });

    it('should call onSuccess callback on retry success (not on first success)', async () => {
      const onSuccess = vi.fn();
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
        clone: () => ({
          ok: true,
          json: () => Promise.resolve({ data: 'test' }),
        }),
      };
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockResponse);

      const result = await fetchRetry({
        url: 'https://example.com/api',
        retryTimes: 1,
        retryDelay: 1,
        onSuccess,
      });

      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledWith({
        domains: undefined,
        url: 'https://example.com/api',
        tagName: 'fetch',
      });
      expect(result).toBe(mockResponse);
    });

    it('should call onError callback on final failure', async () => {
      const onError = vi.fn();
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        fetchRetry({
          url: 'https://example.com/api',
          retryTimes: 1,
          retryDelay: 10,
          onError,
        }),
      ).rejects.toThrow();

      expect(onError).toHaveBeenCalledWith({
        domains: undefined,
        url: 'https://example.com/api',
        tagName: 'fetch',
      });
    });
  });

  describe('scriptRetry', () => {
    it('should retry on script load failure', async () => {
      const mockRetryFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Script load error'))
        .mockResolvedValueOnce({ module: 'loaded' });

      const retryFunction = scriptRetry({
        retryOptions: {
          retryTimes: 2,
          retryDelay: 10,
        },
        retryFn: mockRetryFn,
      });

      const result = await retryFunction({
        url: 'https://example.com/script.js',
      });

      expect(mockRetryFn).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ module: 'loaded' });
    });

    it('should respect retryTimes limit for scripts', async () => {
      const mockRetryFn = vi
        .fn()
        .mockRejectedValue(new Error('Script load error'));

      const retryFunction = scriptRetry({
        retryOptions: {
          retryTimes: 2,
          retryDelay: 10,
        },
        retryFn: mockRetryFn,
      });

      await expect(
        retryFunction({ url: 'https://example.com/script.js' }),
      ).rejects.toThrow(ERROR_ABANDONED);

      expect(mockRetryFn).toHaveBeenCalledTimes(2);
    });

    it('should use getRetryUrl for script retries', async () => {
      const mockRetryFn = vi
        .fn()
        .mockRejectedValue(new Error('Script load error'));

      const retryFunction = scriptRetry({
        retryOptions: {
          retryTimes: 1,
          retryDelay: 10,
          domains: ['https://domain1.com'],
        },
        retryFn: mockRetryFn,
      });

      await expect(
        retryFunction({ url: 'https://example.com/script.js' }),
      ).rejects.toThrow();

      expect(mockRetryFn).toHaveBeenCalledWith(
        expect.objectContaining({
          getEntryUrl: expect.any(Function),
        }),
      );
    });

    it('should call callbacks for script retry', async () => {
      const onRetry = vi.fn();
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const mockRetryFn = vi
        .fn()
        .mockImplementationOnce(({ getEntryUrl }: any) => {
          // trigger onRetry by calling getEntryUrl
          getEntryUrl('https://example.com/script.js');
          throw new Error('Script load error');
        })
        .mockResolvedValueOnce({ module: 'loaded' });

      const retryFunction = scriptRetry({
        retryOptions: {
          retryTimes: 2,
          retryDelay: 10,
          onRetry,
          onSuccess,
          onError,
        },
        retryFn: mockRetryFn,
      });

      await retryFunction({ url: 'https://example.com/script.js' });

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onError).not.toHaveBeenCalled();
    });

    it('should rotate domains for scripts across retries', async () => {
      const sequence: string[] = [];
      const domains = [
        'http://localhost:2001',
        'http://localhost:2011',
        'http://localhost:2021',
      ];
      const mockRetryFn = vi.fn().mockImplementation(({ getEntryUrl }: any) => {
        // Consumer always calls getEntryUrl with the same original URL
        const nextUrl = getEntryUrl('http://localhost:2001/remoteEntry.js');
        sequence.push(nextUrl);
        // always throw to trigger next retry until retryTimes is reached
        throw new Error('Script load error');
      });

      const retryFunction = scriptRetry({
        retryOptions: {
          retryTimes: 3,
          retryDelay: 0,
          domains,
        },
        retryFn: mockRetryFn,
      });

      await expect(
        retryFunction({ url: 'http://localhost:2001/remoteEntry.js' }),
      ).rejects.toThrow(ERROR_ABANDONED);

      // With the fix, should properly rotate domains across retries
      expect(sequence.length).toBe(3);
      // First retry: 2001 -> 2011
      expect(sequence[0]).toContain('http://localhost:2011');
      // Second retry: 2011 -> 2021
      expect(sequence[1]).toContain('http://localhost:2021');
      // Third retry: 2021 -> wrap to 2001
      expect(sequence[2]).toContain('http://localhost:2001');
    });

    it('should append retryCount when addQuery is true for scripts', async () => {
      const sequence: string[] = [];
      const mockRetryFn = vi.fn().mockImplementation(({ getEntryUrl }: any) => {
        // Consumer always calls getEntryUrl with the same original URL
        const nextUrl = getEntryUrl('https://cdn-a.example.com/entry.js');
        sequence.push(nextUrl);
        throw new Error('Script load error');
      });

      const retryFunction = scriptRetry({
        retryOptions: {
          retryTimes: 2,
          retryDelay: 0,
          addQuery: true,
          domains: ['https://cdn-a.example.com', 'https://cdn-b.example.com'],
        },
        retryFn: mockRetryFn,
      });

      await expect(
        retryFunction({ url: 'https://cdn-a.example.com/entry.js' }),
      ).rejects.toThrow(ERROR_ABANDONED);

      expect(sequence.length).toBe(2);
      // First retry: should rotate to cdn-b and have retryCount=1
      expect(sequence[0]).toContain('https://cdn-b.example.com');
      expect(sequence[0]).toMatch(/retryCount=1/);
      // Second retry: should rotate back to cdn-a and have retryCount=2
      expect(sequence[1]).toContain('https://cdn-a.example.com');
      expect(sequence[1]).toMatch(/retryCount=2/);
      // Should not accumulate previous retry parameters
      expect(sequence[1]).not.toMatch(/retryCount=1/);
    });

    it('should prevent query parameter accumulation for scripts with functional addQuery', async () => {
      const sequence: string[] = [];
      const mockRetryFn = vi.fn().mockImplementation(({ getEntryUrl }: any) => {
        // Consumer always calls getEntryUrl with the same original URL
        const nextUrl = getEntryUrl('https://m1.example.com/remoteEntry.js');
        sequence.push(nextUrl);
        throw new Error('Script load error');
      });

      const retryFunction = scriptRetry({
        retryOptions: {
          retryTimes: 3,
          retryDelay: 0,
          domains: ['https://m1.example.com', 'https://m2.example.com'],
          addQuery: ({ times }) =>
            `retry=${times}&retryTimeStamp=${1757484964434 + times * 1000}`,
        },
        retryFn: mockRetryFn,
      });

      await expect(
        retryFunction({ url: 'https://m1.example.com/remoteEntry.js' }),
      ).rejects.toThrow(ERROR_ABANDONED);

      expect(sequence.length).toBe(3);

      // First retry: m1 -> m2 with retry=1
      expect(sequence[0]).toBe(
        'https://m2.example.com/remoteEntry.js?retry=1&retryTimeStamp=1757484965434',
      );

      // Second retry: m2 -> m1 with retry=2 (no accumulation)
      expect(sequence[1]).toBe(
        'https://m1.example.com/remoteEntry.js?retry=2&retryTimeStamp=1757484966434',
      );
      expect(sequence[1]).not.toContain('retry=1');

      // Third retry: m1 -> m2 with retry=3 (no accumulation)
      expect(sequence[2]).toBe(
        'https://m2.example.com/remoteEntry.js?retry=3&retryTimeStamp=1757484967434',
      );
      expect(sequence[2]).not.toContain('retry=1');
      expect(sequence[2]).not.toContain('retry=2');
    });
  });
});
