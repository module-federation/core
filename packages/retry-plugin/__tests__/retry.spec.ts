import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchRetry } from '../src/fetch-retry';
import { scriptRetry } from '../src/script-retry';
import { RetryPlugin } from '../src/index';
import {
  getRetryUrl,
  rewriteWithNextDomain,
  appendRetryCountQuery,
  combineUrlDomainWithPathQuery,
} from '../src/utils';

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
      ).rejects.toThrow('The request failed and has now been abandoned');

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
      ).rejects.toThrow('The request failed and has now been abandoned');

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
      ).rejects.toThrow('The request failed and has now been abandoned');

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
      ).rejects.toThrow('The request failed and has now been abandoned');

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

      it('should support functional addQuery to replace query string (no original query)', () => {
        const result = getRetryUrl('https://example.com/api', {
          addQuery: ({ times, originalQuery }) =>
            `${originalQuery}&retry=${times}&retryTimeStamp=123`,
          retryIndex: 2,
        });
        expect(result).toBe(
          'https://example.com/api?&retry=2&retryTimeStamp=123',
        );
      });

      it('should support functional addQuery with existing original query', () => {
        const result = getRetryUrl('https://example.com/api?foo=bar', {
          addQuery: ({ times, originalQuery }) =>
            `${originalQuery}&retry=${times}`,
          retryIndex: 3,
        });
        expect(result).toBe('https://example.com/api?foo=bar&retry=3');
      });

      it('should clear query when functional addQuery returns empty string', () => {
        const result = getRetryUrl('https://example.com/api?foo=bar', {
          addQuery: () => '',
          retryIndex: 1,
        });
        expect(result).toBe('https://example.com/api');
      });

      // Tests for addQuery accumulation fix
      it('should prevent query parameter accumulation when using boolean addQuery', () => {
        // Simulate what was happening before the fix: using previous URL as base
        let currentUrl = 'https://example.com/api';

        // First retry
        currentUrl = getRetryUrl(currentUrl, {
          addQuery: true,
          retryIndex: 1,
        });
        expect(currentUrl).toBe('https://example.com/api?retryCount=1');

        // Second retry - using the previous URL as base should not accumulate
        const secondRetryUrl = getRetryUrl(currentUrl, {
          addQuery: true,
          retryIndex: 2,
        });
        expect(secondRetryUrl).toBe('https://example.com/api?retryCount=2');
        expect(secondRetryUrl).not.toContain('retryCount=1');
      });

      it('should prevent query parameter accumulation when using functional addQuery', () => {
        let currentUrl = 'https://example.com/mf-manifest.json';
        const baseTimestamp = 1757484964434;

        // First retry
        currentUrl = getRetryUrl(currentUrl, {
          addQuery: ({ times }) =>
            `retry=${times}&retryTimeStamp=${baseTimestamp + times * 1000}`,
          retryIndex: 1,
        });
        expect(currentUrl).toBe(
          'https://example.com/mf-manifest.json?retry=1&retryTimeStamp=1757484965434',
        );

        // Second retry - should not accumulate previous parameters
        const secondRetryUrl = getRetryUrl(currentUrl, {
          addQuery: ({ times }) =>
            `retry=${times}&retryTimeStamp=${baseTimestamp + times * 1000}`,
          retryIndex: 2,
        });
        expect(secondRetryUrl).toBe(
          'https://example.com/mf-manifest.json?retry=2&retryTimeStamp=1757484966434',
        );
        expect(secondRetryUrl).not.toContain('retry=1');
        expect(secondRetryUrl).not.toContain('retryTimeStamp=1757484965434');
      });

      it('should handle domain rotation while preventing parameter accumulation', () => {
        const domains = ['https://m1.example.com', 'https://m2.example.com'];
        let currentUrl = 'https://m1.example.com/mf-manifest.json';

        // First retry - should rotate domain and add query
        currentUrl = getRetryUrl(currentUrl, {
          domains,
          addQuery: ({ times }) =>
            `retry=${times}&retryTimeStamp=${1757484964434 + times * 1000}`,
          retryIndex: 1,
        });
        expect(currentUrl).toBe(
          'https://m2.example.com/mf-manifest.json?retry=1&retryTimeStamp=1757484965434',
        );

        // Second retry - should rotate back to m1 but not accumulate parameters
        const secondRetryUrl = getRetryUrl(currentUrl, {
          domains,
          addQuery: ({ times }) =>
            `retry=${times}&retryTimeStamp=${1757484964434 + times * 1000}`,
          retryIndex: 2,
        });
        expect(secondRetryUrl).toBe(
          'https://m1.example.com/mf-manifest.json?retry=2&retryTimeStamp=1757484966434',
        );
        expect(secondRetryUrl).not.toContain('retry=1');
      });

      it('should clean existing retry parameters from baseUrl before processing', () => {
        // Test with a URL that already has retry parameters (simulating accumulated state)
        const urlWithExistingParams =
          'https://example.com/api?other=value&retryCount=5&retryCount=6';

        const result = getRetryUrl(urlWithExistingParams, {
          addQuery: true,
          retryIndex: 2,
          queryKey: 'retryCount',
        });

        // Should have cleaned the old retryCount parameters and added new ones
        expect(result).toBe('https://example.com/api?other=value&retryCount=2');
        expect(result).not.toContain('retryCount=5');
        expect(result).not.toContain('retryCount=6');
      });

      it('should clean custom query key parameters from baseUrl', () => {
        // Test with custom query key
        const urlWithCustomParams =
          'https://example.com/api?retry=1&retryTimeStamp=123&other=value&retry=2';

        const result = getRetryUrl(urlWithCustomParams, {
          addQuery: true,
          retryIndex: 3,
          queryKey: 'retry',
        });

        // Should have cleaned the old retry parameters and added new ones
        expect(result).toBe(
          'https://example.com/api?retryTimeStamp=123&other=value&retry=3',
        );
        expect(result).not.toContain('retry=1');
        expect(result).not.toContain('retry=2');
      });

      it('should preserve original query parameters while cleaning retry parameters', () => {
        const urlWithMixedParams =
          'https://example.com/api?foo=bar&retryCount=5&baz=qux&retryCount=6';

        const result = getRetryUrl(urlWithMixedParams, {
          addQuery: true,
          retryIndex: 3,
          queryKey: 'retryCount',
        });

        expect(result).toBe(
          'https://example.com/api?foo=bar&baz=qux&retryCount=3',
        );
        expect(result).not.toContain('retryCount=5');
        expect(result).not.toContain('retryCount=6');
      });
    });

    describe('combineUrlDomainWithPathQuery', () => {
      it('should combine domain from first URL with path/query from second URL', () => {
        const domainUrl = 'https://m2.example.com/old-path?old=param';
        const pathQueryUrl =
          'https://m1.example.com/new-path?new=param&foo=bar';

        const result = combineUrlDomainWithPathQuery(domainUrl, pathQueryUrl);

        expect(result).toBe(
          'https://m2.example.com/new-path?new=param&foo=bar',
        );
      });

      it('should handle URLs with different protocols', () => {
        const domainUrl = 'http://cdn.example.com:8080/';
        const pathQueryUrl = 'https://original.com/api/data?v=1';

        const result = combineUrlDomainWithPathQuery(domainUrl, pathQueryUrl);

        expect(result).toBe('http://cdn.example.com:8080/api/data?v=1');
      });

      it('should handle URLs without query parameters', () => {
        const domainUrl = 'https://backup.example.com';
        const pathQueryUrl = 'https://primary.example.com/manifest.json';

        const result = combineUrlDomainWithPathQuery(domainUrl, pathQueryUrl);

        expect(result).toBe('https://backup.example.com/manifest.json');
      });

      it('should handle URLs with ports', () => {
        const domainUrl = 'https://localhost:3001/old';
        const pathQueryUrl = 'https://localhost:3000/new?param=value';

        const result = combineUrlDomainWithPathQuery(domainUrl, pathQueryUrl);

        expect(result).toBe('https://localhost:3001/new?param=value');
      });

      it('should fallback to pathQueryUrl when domainUrl is invalid', () => {
        const domainUrl = 'invalid-url';
        const pathQueryUrl = 'https://example.com/api?valid=true';

        const result = combineUrlDomainWithPathQuery(domainUrl, pathQueryUrl);

        expect(result).toBe('https://example.com/api?valid=true');
      });

      it('should fallback to pathQueryUrl when pathQueryUrl is invalid', () => {
        const domainUrl = 'https://example.com';
        const pathQueryUrl = 'invalid-path-url';

        const result = combineUrlDomainWithPathQuery(domainUrl, pathQueryUrl);

        expect(result).toBe('invalid-path-url');
      });
    });

    describe('fetchRetry addQuery accumulation fix', () => {
      it('should not accumulate query parameters across retries', async () => {
        const domains = ['https://m1.example.com', 'https://m2.example.com'];
        const onRetry = vi.fn();

        // Mock fetch to always fail to trigger retries
        mockFetch.mockRejectedValue(new Error('Network error'));

        await expect(
          fetchRetry({
            url: 'https://m1.example.com/mf-manifest.json',
            retryTimes: 3,
            retryDelay: 1,
            domains,
            addQuery: ({ times }) =>
              `retry=${times}&retryTimeStamp=${1757484964434 + times * 1000}`,
            onRetry,
          }),
        ).rejects.toThrow();

        // Check that URLs don't accumulate parameters
        const retryCallUrls = onRetry.mock.calls.map((call) => call[0].url);

        // First retry should be on m2 with retry=1
        expect(retryCallUrls[0]).toBe(
          'https://m2.example.com/mf-manifest.json?retry=1&retryTimeStamp=1757484965434',
        );

        // Second retry should be on m1 with retry=2 (no accumulation)
        expect(retryCallUrls[1]).toBe(
          'https://m1.example.com/mf-manifest.json?retry=2&retryTimeStamp=1757484966434',
        );
        expect(retryCallUrls[1]).not.toContain('retry=1');

        // Third retry should be on m2 with retry=3 (no accumulation)
        expect(retryCallUrls[2]).toBe(
          'https://m2.example.com/mf-manifest.json?retry=3&retryTimeStamp=1757484967434',
        );
        expect(retryCallUrls[2]).not.toContain('retry=1');
        expect(retryCallUrls[2]).not.toContain('retry=2');
      });

      it('should not accumulate boolean addQuery parameters across retries', async () => {
        const domains = ['https://domain1.com', 'https://domain2.com'];
        const onRetry = vi.fn();

        mockFetch.mockRejectedValue(new Error('Network error'));

        await expect(
          fetchRetry({
            url: 'https://domain1.com/api',
            retryTimes: 2,
            retryDelay: 1,
            domains,
            addQuery: true,
            onRetry,
          }),
        ).rejects.toThrow();

        const retryCallUrls = onRetry.mock.calls.map((call) => call[0].url);

        // First retry
        expect(retryCallUrls[0]).toBe('https://domain2.com/api?retryCount=1');

        // Second retry should not have accumulated retryCount=1
        expect(retryCallUrls[1]).toBe('https://domain1.com/api?retryCount=2');
        expect(retryCallUrls[1]).not.toContain('retryCount=1');
      });
    });
  });
});
