import { getResourceUrl } from '../src/utils';
import { ModuleInfo } from '../src/types';
import { isBrowserEnv, isReactNativeEnv } from '../src/env';

jest.mock('../src/env', () => ({
  isBrowserEnv: jest.fn(),
  isReactNativeEnv: jest.fn(),
}));

describe('getResourceUrl', () => {
  let module: ModuleInfo;
  let sourceUrl: string;

  beforeEach(() => {
    sourceUrl = 'test.js';
    (isBrowserEnv as jest.Mock).mockReset();
    (isReactNativeEnv as jest.Mock).mockReset();
  });

  test('should return url with getPublicPath', () => {
    const getPublicPath = 'return "https://example.com/"';
    module = { getPublicPath } as ModuleInfo;
    const result = getResourceUrl(module, sourceUrl);
    expect(result).toBe('https://example.com/test.js');
  });

  test('should handle getPublicPath starting with function', () => {
    const getPublicPath = 'function() { return "https://test.com/" }';
    module = { getPublicPath } as ModuleInfo;
    const result = getResourceUrl(module, sourceUrl);
    expect(result).toBe('https://test.com/test.js');
  });

  test('should return url with publicPath in browser or RN env', () => {
    const publicPath = 'https://public.com/';
    module = { publicPath } as ModuleInfo;
    (isBrowserEnv as jest.Mock).mockReturnValue(true);
    const result = getResourceUrl(module, sourceUrl);
    expect(result).toBe('https://public.com/test.js');
  });

  test('should return url with ssrPublicPath', () => {
    const publicPath = 'https://public.com/';
    const ssrPublicPath = 'https://ssr.com/';
    module = { publicPath, ssrPublicPath } as ModuleInfo;
    (isBrowserEnv as jest.Mock).mockReturnValue(false);
    (isReactNativeEnv as jest.Mock).mockReturnValue(false);
    const result = getResourceUrl(module, sourceUrl);
    expect(result).toBe('https://ssr.com/test.js');
  });

  test('should log warning and return empty string when no public path info', () => {
    module = {} as ModuleInfo;
    const consoleWarnSpy = jest.spyOn(console, 'warn');
    const result = getResourceUrl(module, sourceUrl);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Cannot get resource URL. If in debug mode, please ignore.',
      module,
      sourceUrl,
    );
    expect(result).toBe('');
    consoleWarnSpy.mockRestore();
  });
});
