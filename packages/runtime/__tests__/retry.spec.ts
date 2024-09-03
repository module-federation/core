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

    // 调用 scriptWithRetry 函数
    const script = scriptWithRetry({
      url,
      retryTimes: 3,
    });

    // 模拟脚本加载成功
    mockScriptElement.onload();

    // 验证
    expect(document.createElement).toHaveBeenCalledWith('script');
    expect(script.src).toEqual(url);
    expect(mockScriptElement.onload).toHaveBeenCalled();
    expect(document.head.appendChild).toHaveBeenCalledTimes(0);
  });

  it('should retry loading script on error and eventually succeed', async () => {
    const url = 'https://example.com/some-script.js';
    const retryTimes = 2;

    // 模拟脚本加载失败并重试
    const script = scriptWithRetry({
      url,
      retryTimes,
    });

    // 前两次加载失败
    mockScriptElement.onerror();
    vi.advanceTimersByTime(2000 * retryTimes);

    mockScriptElement.onerror();
    vi.advanceTimersByTime(2000 * retryTimes);

    // 模拟第三次加载成功
    mockScriptElement.onload();

    // 每调用一次 appendChild 即表示进入了一次 retry 的逻辑，所以这里可以使用 appendChild 的 calledTimes 来验证重试次数
    expect(document.head.appendChild).toHaveBeenCalledTimes(retryTimes);
  });

  it('should stop retrying after maximum retries', async () => {
    const url = 'https://example.com/some-script.js';
    const retryTimes = 3;

    const script = scriptWithRetry({
      url,
      retryTimes,
    });

    // 所有重试都失败
    for (let i = 0; i < retryTimes; i++) {
      mockScriptElement.onerror();
      vi.advanceTimersByTime(2000 * retryTimes);
    }

    // 验证
    expect(document.head.appendChild).toHaveBeenCalledTimes(retryTimes);
  });
});

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

const mockGlobalFetch = (mockData) => {
  // const mockData = { success: true };
  const mockFetch = vi.fn().mockResolvedValueOnce(mockResponse(200, mockData));
  // 替换全局 fetch 为 mockFetch
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
  const mockError = new Error('Network error');
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
  test('async test', async () => {
    const asyncMock = vi.fn().mockResolvedValueOnce('first call');

    await asyncMock(); // 'first call'
  });

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
    ); // 断言抛出特定错误
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
    ); // 断言抛出特定错误
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
    // 替换全局 fetch 为 mockFetch
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
