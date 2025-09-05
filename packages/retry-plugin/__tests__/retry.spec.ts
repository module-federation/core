import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchRetry } from '../src/fetch-retry';
import { scriptRetry } from '../src/script-retry';
import { RetryPlugin } from '../src/index';
import {
  getRetryUrl,
  rewriteWithNextDomain,
  appendRetryCountQuery,
} from '../src/utils';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock logger
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
      ).rejects.toThrow('The request failed and has now been abandoned');

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

    it('should call onSuccess callback', async () => {
      const onSuccess = vi.fn();
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
        clone: () => ({
          ok: true,
          json: () => Promise.resolve({ data: 'test' }),
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await fetchRetry({
        url: 'https://example.com/api',
        retryTimes: 0, // 不重试，第一次就成功
        onSuccess,
      });

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
      ).rejects.toThrow('Script load error');

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
        .mockRejectedValueOnce(new Error('Script load error'))
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
        // simulate consumer calling getEntryUrl with the current known url
        const prev =
          sequence.length === 0
            ? 'http://localhost:2001/remoteEntry.js'
            : sequence[sequence.length - 1];
        const nextUrl = getEntryUrl(prev);
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
      ).rejects.toThrow('Script load error');

      // With current implementation, first attempt already rotates based on base URL
      // and then continues rotating on each retry
      expect(sequence.length).toBe(3);
      // Start from 2001 -> next 2011
      expect(sequence[0]).toContain('http://localhost:2011');
      // 2011 -> 2021
      expect(sequence[1]).toContain('http://localhost:2021');
      // 2021 -> wrap to 2001
      expect(sequence[2]).toContain('http://localhost:2001');
    });

    it('should append retryCount when addQuery is true for scripts', async () => {
      const sequence: string[] = [];
      const mockRetryFn = vi.fn().mockImplementation(({ getEntryUrl }: any) => {
        const prev =
          sequence.length === 0
            ? 'https://cdn.example.com/entry.js'
            : sequence[sequence.length - 1];
        const nextUrl = getEntryUrl(prev);
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
      ).rejects.toThrow('Script load error');

      expect(sequence.length).toBe(2);
      // first attempt (per current logic) applies retryIndex=1 and rotates domain
      expect(sequence[0]).toMatch(/retryCount=1/);
      // second attempt uses retryIndex=2
      expect(sequence[1]).toMatch(/retryCount=2/);
    });
  });

  describe('RetryPlugin', () => {
    it('should create plugin with default options', () => {
      const plugin = RetryPlugin({});
      expect(plugin.name).toBe('retry-plugin');
      expect(plugin.fetch).toBeDefined();
      expect(plugin.loadEntryError).toBeDefined();
    });

    it('should handle fetch with retry', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
        clone: () => ({
          ok: true,
          json: () => Promise.resolve({ data: 'test' }),
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const plugin = RetryPlugin({
        retryTimes: 0, // 不重试，第一次就成功
        retryDelay: 10,
      });

      const result = await plugin.fetch!('https://example.com/api', {});

      expect(mockFetch).toHaveBeenCalledWith('https://example.com/api', {});
      expect(result).toBe(mockResponse);
    });

    it('should prefer manifestDomains over domains for manifest fetch retries', async () => {
      // Arrange: fail first, then succeed
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: 'ok' }),
        clone: () => ({
          ok: true,
          json: () => Promise.resolve({ data: 'ok' }),
        }),
      };
      mockFetch
        .mockRejectedValueOnce(new Error('Network error 1'))
        .mockResolvedValueOnce(mockResponse);

      const plugin = RetryPlugin({
        retryTimes: 2,
        retryDelay: 1,
        // global domains (should be ignored when manifestDomains provided)
        domains: ['https://global-domain.com'],
        // manifestDomains should take precedence in plugin.fetch
        manifestDomains: ['https://m1.example.com', 'https://m2.example.com'],
      });

      const result = await plugin.fetch!(
        'https://origin.example.com/mf-manifest.json',
        {} as any,
      );

      // Assert: second call (first retry) should use manifestDomains[0]
      const calls = mockFetch.mock.calls;
      expect(calls[0][0]).toBe('https://origin.example.com/mf-manifest.json');
      expect(String(calls[1][0])).toContain('m1.example.com');
      expect(result).toBe(mockResponse as any);
    });

    it('should handle loadEntryError with uniqueKey cache', async () => {
      const mockGetRemoteEntry = vi
        .fn()
        .mockResolvedValue({ module: 'loaded' });
      const globalLoading = {};

      const plugin = RetryPlugin({
        retryTimes: 2,
        retryDelay: 10,
      });

      // First call should succeed
      const result1 = await plugin.loadEntryError!({
        getRemoteEntry: mockGetRemoteEntry,
        origin: 'https://example.com',
        remoteInfo: { name: 'test' },
        remoteEntryExports: {},
        globalLoading,
        uniqueKey: 'test-key',
      } as any);

      expect(result1).toEqual({ module: 'loaded' });
      expect(mockGetRemoteEntry).toHaveBeenCalledTimes(1);

      // Second call with same uniqueKey should throw error
      await expect(
        plugin.loadEntryError!({
          getRemoteEntry: mockGetRemoteEntry,
          origin: 'https://example.com',
          remoteInfo: { name: 'test' },
          remoteEntryExports: {},
          globalLoading,
          uniqueKey: 'test-key',
        } as any),
      ).rejects.toThrow('Entry test-key has already been retried');

      expect(mockGetRemoteEntry).toHaveBeenCalledTimes(1); // Still 1, not called again
    });
  });

  describe('utils', () => {
    describe('rewriteWithNextDomain', () => {
      it('should return null for empty domains', () => {
        expect(rewriteWithNextDomain('https://example.com/api', [])).toBeNull();
        expect(
          rewriteWithNextDomain('https://example.com/api', undefined),
        ).toBeNull();
      });

      it('should rotate to next domain', () => {
        const domains = [
          'https://domain1.com',
          'https://domain2.com',
          'https://domain3.com',
        ];
        const result = rewriteWithNextDomain(
          'https://domain1.com/api',
          domains,
        );
        expect(result).toBe('https://domain2.com/api');
      });

      it('should wrap around to first domain', () => {
        const domains = ['https://domain1.com', 'https://domain2.com'];
        const result = rewriteWithNextDomain(
          'https://domain2.com/api',
          domains,
        );
        expect(result).toBe('https://domain1.com/api');
      });

      it('should handle domains with different protocols', () => {
        const domains = ['https://domain1.com', 'http://domain2.com'];
        const result = rewriteWithNextDomain(
          'https://domain1.com/api',
          domains,
        );
        expect(result).toBe('http://domain2.com/api');
      });
    });

    describe('appendRetryCountQuery', () => {
      it('should append retry count to URL', () => {
        const result = appendRetryCountQuery('https://example.com/api', 3);
        expect(result).toBe('https://example.com/api?retryCount=3');
      });

      it('should append to existing query parameters', () => {
        const result = appendRetryCountQuery(
          'https://example.com/api?foo=bar',
          2,
        );
        expect(result).toBe('https://example.com/api?foo=bar&retryCount=2');
      });

      it('should use custom query key', () => {
        const result = appendRetryCountQuery(
          'https://example.com/api',
          1,
          'retry',
        );
        expect(result).toBe('https://example.com/api?retry=1');
      });
    });

    describe('getRetryUrl', () => {
      it('should return original URL when no options provided', () => {
        const result = getRetryUrl('https://example.com/api');
        expect(result).toBe('https://example.com/api');
      });

      it('should apply domain rotation', () => {
        const domains = ['https://domain1.com', 'https://domain2.com'];
        const result = getRetryUrl('https://domain1.com/api', { domains });
        expect(result).toBe('https://domain2.com/api');
      });

      it('should add retry count query when addQuery is true', () => {
        const result = getRetryUrl('https://example.com/api', {
          addQuery: true,
          retryIndex: 2,
        });
        expect(result).toBe('https://example.com/api?retryCount=2');
      });

      it('should not add query when retryIndex is 0', () => {
        const result = getRetryUrl('https://example.com/api', {
          addQuery: true,
          retryIndex: 0,
        });
        expect(result).toBe('https://example.com/api');
      });

      it('should use custom query key', () => {
        const result = getRetryUrl('https://example.com/api', {
          addQuery: true,
          retryIndex: 1,
          queryKey: 'retry',
        });
        expect(result).toBe('https://example.com/api?retry=1');
      });
    });
  });
});
