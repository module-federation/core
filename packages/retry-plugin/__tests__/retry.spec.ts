import { fetchWithRetry } from '../src/fetch-retry';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

const mockScriptElement = {
  onload: vi.fn(),
  onerror: vi.fn(),
  setAttribute: vi.fn(),
  async: false,
  defer: false,
  src: '',
};

vi.spyOn(document, 'createElement').mockImplementation(() => {
  return mockScriptElement as unknown as HTMLScriptElement;
});

vi.spyOn(document.head, 'appendChild').mockImplementation(
  () => mockScriptElement as any,
);

const mockGlobalFetch = (mockData) => {
  const mockFetch = vi.fn().mockResolvedValueOnce(mockResponse(200, mockData));
  global.fetch = mockFetch;
  return mockFetch;
};

const mockResponse = (status: number, body: any) => {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    clone: function () {
      return this;
    },
  };
};

const mockErrorFetch = () => {
  const mockData = { success: false };
  const data = {
    ok: false,
    status: 500,
    statusText: 'Internal Server Error',
    headers: new Headers(),
    url: 'https://example.com',
    clone: () => mockData,
    json: () => Promise.resolve(mockData),
  };

  const mockFetch = vi.fn().mockResolvedValueOnce(data);
  global.fetch = mockFetch;
  return mockFetch;
};

afterEach(() => {
  global.fetch = fetch;
});

describe('fetchWithRetry', () => {
  it('mockFetch should resolve correctly', async () => {
    const mockData = { success: true };
    mockGlobalFetch(mockData);
    const response = await fetchWithRetry({
      manifestUrl: 'https://example.com',
      retryDelay: 0,
    });
    expect(await response.json()).toEqual(mockData);
  });

  it('should succeed on the first try', async () => {
    const mockData = { success: true };
    mockGlobalFetch(mockData);

    const response = await fetchWithRetry({
      manifestUrl: 'https://example.com',
      retryDelay: 0,
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(await response.json()).toEqual(mockData);
  });

  it('should throw an error if max retries are reached and no fallback is provided', async () => {
    mockErrorFetch();
    const retryTimes = 3;
    const responsePromise = fetchWithRetry({
      manifestUrl: 'https://example.com',
      retryTimes,
      retryDelay: 0,
    });
    vi.advanceTimersByTime(2000 * retryTimes);

    await expect(responsePromise).rejects.toThrow(
      'The request failed three times and has now been abandoned',
    );
    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it('should fall back to the fallback URL after retries fail', async () => {
    mockErrorFetch();
    const retryTimes = 3;
    const responsePromise = fetchWithRetry({
      manifestUrl: 'https://example.com',
      retryTimes,
      retryDelay: 0,
      fallback: () => 'https://fallback.com',
    });
    vi.advanceTimersByTime(2000 * retryTimes);

    await expect(responsePromise).rejects.toThrow(
      'The request failed three times and has now been abandoned',
    );
    expect(fetch).toHaveBeenCalledTimes(5);
    expect(fetch).toHaveBeenLastCalledWith('https://fallback.com', {});
  });

  it('should build fallback URL from remote after retries fail', async () => {
    mockErrorFetch();
    const retryTimes = 3;
    const responsePromise = fetchWithRetry({
      manifestUrl: 'https://example.com',
      retryTimes,
      retryDelay: 0,
      fallback: (url) => `${url}/fallback`,
    });
    vi.advanceTimersByTime(2000 * retryTimes);

    await expect(responsePromise).rejects.toThrow(
      'The request failed three times and has now been abandoned',
    );
    expect(fetch).toHaveBeenCalledTimes(5);
    expect(fetch).toHaveBeenLastCalledWith('https://example.com/fallback', {});
  });

  it('should handle JSON parse error', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error('Unexpected token')),
      clone: function () {
        return this;
      },
    });
    global.fetch = mockFetch;
    await expect(
      fetchWithRetry({
        manifestUrl: 'https://example.com',
        retryTimes: 0,
        retryDelay: 0,
      }),
    ).rejects.toThrow('Json parse error');
  });

  describe('getRetryPath functionality', () => {
    it('should use original URL for first attempt and getRetryPath for retries', async () => {
      const mockFetch = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockResponse(200, { success: true }));

      global.fetch = mockFetch;
      const getRetryPath = vi.fn().mockReturnValue('https://retry.example.com');

      const response = await fetchWithRetry({
        manifestUrl: 'https://example.com',
        retryTimes: 3,
        retryDelay: 0,
        getRetryPath,
      });

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenNthCalledWith(1, 'https://example.com', {});
      expect(fetch).toHaveBeenNthCalledWith(2, 'https://retry.example.com', {});
      expect(getRetryPath).toHaveBeenCalledWith('https://example.com');
    });

    it('should not call getRetryPath on first attempt', async () => {
      const mockData = { success: true };
      mockGlobalFetch(mockData);
      const getRetryPath = vi.fn().mockReturnValue('https://retry.example.com');
      const response = await fetchWithRetry({
        manifestUrl: 'https://example.com',
        retryDelay: 0,
        getRetryPath,
      });

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('https://example.com', {});
      expect(getRetryPath).not.toHaveBeenCalled();
    });

    it('should use getRetryPath for all retry attempts', async () => {
      const mockFetch = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockResponse(200, { success: true }));

      global.fetch = mockFetch;
      const getRetryPath = vi.fn().mockReturnValue('https://retry.example.com');
      const response = await fetchWithRetry({
        manifestUrl: 'https://example.com',
        retryTimes: 3,
        retryDelay: 0,
        getRetryPath,
      });

      expect(fetch).toHaveBeenCalledTimes(4);
      expect(fetch).toHaveBeenNthCalledWith(1, 'https://example.com', {});
      expect(fetch).toHaveBeenNthCalledWith(2, 'https://retry.example.com', {});
      expect(fetch).toHaveBeenNthCalledWith(3, 'https://retry.example.com', {});
      expect(fetch).toHaveBeenNthCalledWith(4, 'https://retry.example.com', {});
      expect(getRetryPath).toHaveBeenCalledTimes(3);
    });

    it('should handle getRetryPath returning different URLs for each retry', async () => {
      const mockFetch = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockResponse(200, { success: true }));

      global.fetch = mockFetch;

      const getRetryPath = vi
        .fn()
        .mockReturnValueOnce('https://retry1.example.com')
        .mockReturnValueOnce('https://retry2.example.com');

      const response = await fetchWithRetry({
        manifestUrl: 'https://example.com',
        retryTimes: 2,
        retryDelay: 0,
        getRetryPath,
      });

      expect(fetch).toHaveBeenCalledTimes(3);
      expect(fetch).toHaveBeenNthCalledWith(1, 'https://example.com', {});
      expect(fetch).toHaveBeenNthCalledWith(
        2,
        'https://retry1.example.com',
        {},
      );
      expect(fetch).toHaveBeenNthCalledWith(
        3,
        'https://retry2.example.com',
        {},
      );
      expect(getRetryPath).toHaveBeenCalledTimes(2);
      expect(getRetryPath).toHaveBeenNthCalledWith(1, 'https://example.com');
      expect(getRetryPath).toHaveBeenNthCalledWith(2, 'https://example.com');
    });

    it('should handle getRetryPath returning undefined or null', async () => {
      const mockFetch = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockResponse(200, { success: true }));

      global.fetch = mockFetch;
      const getRetryPath = vi.fn().mockReturnValue(undefined);
      const response = await fetchWithRetry({
        manifestUrl: 'https://example.com',
        retryTimes: 1,
        retryDelay: 0,
        getRetryPath,
      });

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenNthCalledWith(1, 'https://example.com', {});
      expect(fetch).toHaveBeenNthCalledWith(2, 'https://example.com', {});
      expect(getRetryPath).toHaveBeenCalledWith('https://example.com');
    });
  });

  describe('retry count and timing', () => {
    it('should execute exactly retryTimes + 1 attempts when retryTimes = 3', async () => {
      const mockFetch = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'));

      global.fetch = mockFetch;

      const responsePromise = fetchWithRetry({
        manifestUrl: 'https://example.com',
        retryTimes: 3,
        retryDelay: 0,
      });

      vi.advanceTimersByTime(1000);

      await expect(responsePromise).rejects.toThrow(
        'The request failed three times and has now been abandoned',
      );
      expect(fetch).toHaveBeenCalledTimes(4);
    });

    it.skip('should respect retryDelay timing', async () => {
      const mockFetch = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockResponse(200, { success: true }));

      global.fetch = mockFetch;

      const response = await fetchWithRetry({
        manifestUrl: 'https://example.com',
        retryTimes: 1,
        retryDelay: 100,
      });

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenNthCalledWith(1, 'https://example.com', {});
      expect(fetch).toHaveBeenNthCalledWith(2, 'https://example.com', {});

      expect(response).toBeDefined();
    }, 10000);
  });
});
