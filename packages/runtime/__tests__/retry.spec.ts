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
    // expect(document.head.appendChild).toHaveBeenCalledWith(mockScriptElement);
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
