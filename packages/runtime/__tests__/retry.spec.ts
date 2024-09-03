import { scriptWithRetry } from '../src/plugins/retry-plugin/script-retry';
import { fetchWithRetry } from '../src/plugins/retry-plugin/fetch-retry';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the DOM environment
beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

// Mock document.createElement to return a mock script element
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

vi.spyOn(document.head, 'appendChild').mockImplementation(() => {
  // 这个模拟方法可以不用执行任何内容
});

// Test Cases
describe('scriptWithRetry', () => {
  it('should create and append script element successfully', async () => {
    const url = 'https://example.com/some-script.js';
    const script = scriptWithRetry({
      url,
      retryTimes: 3,
    });
    // mock the script load
    mockScriptElement.onload();

    expect(document.createElement).toHaveBeenCalledWith('script');
    expect(script.src).toEqual(url);
    expect(mockScriptElement.onload).toHaveBeenCalled();
    expect(document.head.appendChild).toHaveBeenCalledTimes(0);
  });

  it('should retry loading script on error and eventually succeed', async () => {
    const url = 'https://example.com/some-script.js';
    const retryTimes = 2;

    const script = scriptWithRetry({
      url,
      retryTimes,
    });

    // 前两次加载失败
    mockScriptElement.onerror();
    vi.advanceTimersByTime(2000 * retryTimes);

    mockScriptElement.onerror();
    vi.advanceTimersByTime(2000 * retryTimes);

    mockScriptElement.onload();

    // each call to appendChild represents one retry, so we can use the calledTimes of appendChild to verify the number of retries
    expect(document.head.appendChild).toHaveBeenCalledTimes(retryTimes);
  });

  it('should stop retrying after maximum retries', async () => {
    const url = 'https://example.com/some-script.js';
    const retryTimes = 3;

    const script = scriptWithRetry({
      url,
      retryTimes,
    });

    // all retries fail
    for (let i = 0; i < retryTimes; i++) {
      mockScriptElement.onerror();
      vi.advanceTimersByTime(2000 * retryTimes);
    }

    expect(document.head.appendChild).toHaveBeenCalledTimes(retryTimes);
  });
});

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

// Test cases
describe('fetchWithRetry', () => {
  it('mockFetch should resolve correctly', async () => {
    const mockData = { success: true };
    mockGlobalFetch(mockData);
    const response = await fetchWithRetry({
      url: 'https://example.com',
      retryDelay: 0,
    });
    expect(await response.json()).toEqual(mockData); // 确保解析响应
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
    expect(fetch).toHaveBeenCalledTimes(4); // 首次 fetch + retryTimes 次 fetch
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
    expect(fetch).toHaveBeenCalledTimes(5); // 首次 fetch + retryTimes 次 fetch
    expect(fetch).toHaveBeenLastCalledWith('https://fallback.com', {});
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
});
