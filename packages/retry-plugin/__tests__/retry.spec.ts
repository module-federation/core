import { fetchWithRetry } from '../src/fetch-retry';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the DOM environment
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

vi.spyOn(document.head, 'appendChild').mockImplementation(() => {});

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
      url: 'https://example.com',
      retryDelay: 0,
    });
    expect(await response.json()).toEqual(mockData);
  });

  it('should succeed on the first try', async () => {
    const mockData = { success: true };
    mockGlobalFetch(mockData);

    const response = await fetchWithRetry({
      url: 'https://example.com',
      retryDelay: 0,
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(await response.json()).toEqual(mockData);
  });

  it('should throw an error if max retries are reached and no fallback is provided', async () => {
    mockErrorFetch();
    const retryTimes = 3;
    const responsePromise = fetchWithRetry({
      url: 'https://example.com',
      retryTimes,
      retryDelay: 0,
    });
    vi.advanceTimersByTime(2000 * retryTimes);

    await expect(responsePromise).rejects.toThrow(
      'The request failed three times and has now been abandoned',
    );
    expect(fetch).toHaveBeenCalledTimes(4); //first fetch + retryTimes fetch
  });

  it('should fall back to the fallback URL after retries fail', async () => {
    mockErrorFetch();
    const retryTimes = 3;
    const responsePromise = fetchWithRetry({
      url: 'https://example.com',
      retryTimes,
      retryDelay: 0,
      fallback: () => 'https://fallback.com',
    });
    vi.advanceTimersByTime(2000 * retryTimes);

    await expect(responsePromise).rejects.toThrow(
      'The request failed three times and has now been abandoned',
    );
    expect(fetch).toHaveBeenCalledTimes(5); //first fetch + retryTimes fetch
    expect(fetch).toHaveBeenLastCalledWith('https://fallback.com', {});
  });

  it('should build fallback URL from remote after retries fail', async () => {
    mockErrorFetch();
    const retryTimes = 3;
    const responsePromise = fetchWithRetry({
      url: 'https://example.com',
      retryTimes,
      retryDelay: 0,
      fallback: (url) => `${url}/fallback`,
    });
    vi.advanceTimersByTime(2000 * retryTimes);

    await expect(responsePromise).rejects.toThrow(
      'The request failed three times and has now been abandoned',
    );
    expect(fetch).toHaveBeenCalledTimes(5); //first fetch + retryTimes fetch
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
        url: 'https://example.com',
        retryTimes: 0,
        retryDelay: 0,
      }),
    ).rejects.toThrow('Json parse error');
  });

  it('should build fallback URL from remote after retries fail', async () => {
    mockErrorFetch();
    const retryTimes = 3;
    const responsePromise = fetchWithRetry({
      url: 'https://example.com',
      retryTimes,
      retryDelay: 0,
      fallback: (url) => `${url}/fallback`,
    });
    vi.advanceTimersByTime(2000 * retryTimes);

    await expect(responsePromise).rejects.toThrow(
      'The request failed three times and has now been abandoned',
    );
    expect(fetch).toHaveBeenCalledTimes(5); //first fetch + retryTimes fetch
    expect(fetch).toHaveBeenLastCalledWith('https://example.com/fallback', {});
  });
});
