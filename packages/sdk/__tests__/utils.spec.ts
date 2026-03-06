import { getResourceUrl } from '../src/utils';
import { ModuleInfo } from '../src/types';
import * as env from '../src/env';

jest.mock('../src/env', () => {
  const mock = {
    isBrowserEnvValue: false,
    isBrowserEnv: jest.fn(() => mock.isBrowserEnvValue),
    isReactNativeEnv: jest.fn(),
  };
  return mock;
});

const mockedEnv = env as unknown as {
  isBrowserEnvValue: boolean;
  isBrowserEnv: jest.Mock;
  isReactNativeEnv: jest.Mock;
};

describe('getResourceUrl', () => {
  let module: ModuleInfo;
  let sourceUrl: string;

  beforeEach(() => {
    sourceUrl = 'test.js';
    mockedEnv.isBrowserEnvValue = false;
    mockedEnv.isBrowserEnv.mockClear();
    mockedEnv.isReactNativeEnv.mockReset();
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
    mockedEnv.isBrowserEnvValue = true;
    const result = getResourceUrl(module, sourceUrl);
    expect(result).toBe('https://public.com/test.js');
  });

  test('should return url with ssrPublicPath', () => {
    const publicPath = 'https://public.com/';
    const ssrPublicPath = 'https://ssr.com/';
    module = { publicPath, ssrPublicPath } as ModuleInfo;
    mockedEnv.isBrowserEnvValue = false;
    mockedEnv.isReactNativeEnv.mockReturnValue(false);
    const result = getResourceUrl(module, sourceUrl);
    expect(result).toBe('https://ssr.com/test.js');
  });

  test('should fallback to publicPath when ssrPublicPath is undefined', () => {
    const publicPath = 'https://public.com/';
    module = { publicPath, ssrPublicPath: undefined } as ModuleInfo;
    (isBrowserEnv as jest.Mock).mockReturnValue(false);
    (isReactNativeEnv as jest.Mock).mockReturnValue(false);
    const result = getResourceUrl(module, sourceUrl);
    expect(result).toBe('https://public.com/test.js');
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
