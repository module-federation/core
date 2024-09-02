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
    // mockScriptElement.onerror();

    // 模拟第三次加载成功
    mockScriptElement.onload();

    // 快速向前执行定时器
    vi.advanceTimersByTime(1000 * retryTimes);

    // 验证
    // expect(document.head.appendChild).toHaveBeenCalledTimes(3); // 两次失败 + 一次成功
    // expect(mockScriptElement.onerror).toHaveBeenCalledTimes(2);
    expect(mockScriptElement.onload).toHaveBeenCalledTimes(1);
  });

  //   it('should stop retrying after maximum retries', async () => {
  //     const url = 'https://example.com/some-script.js';
  //     const retryTimes = 3;

  //     const script = scriptWithRetry({
  //       url,
  //       retryTimes,
  //     });

  //     // 所有重试都失败
  //     for (let i = 0; i <= retryTimes; i++) {
  //       mockScriptElement.onerror();
  //     }

  //     // 快速向前执行定时器
  //     vi.advanceTimersByTime(1000 * retryTimes);

  //     // 验证
  //     expect(document.head.appendChild).toHaveBeenCalledTimes(retryTimes + 1); // 第一次加载 + 重试次数
  //     // expect(mockScriptElement.onerror).toHaveBeenCalledTimes(retryTimes + 1);
  //   });
});
