import { it, expect, describe } from 'vitest';
import { addGlobalSnapshot } from '@module-federation/enhanced/runtime-core';
import correctSSRPublicPathPlugin from './correct-ssr-public-path';

describe('correctSSRPublicPathPlugin', () => {
  const args = {
    userOptions: {
      version: '0.0.1',
    },
    options: {
      name: 'remote',
    },
  };
  it('should not handle publicPath if window is defined', () => {
    const mockWebpackRequire = { p: 'http://localhost:8080/test-public-path/' };
    (global as any).__webpack_require__ = mockWebpackRequire;
    global.window = {} as any;

    const plugin = correctSSRPublicPathPlugin();
    // @ts-ignore
    plugin.beforeInit(args);
    expect(mockWebpackRequire.p).toBe(
      'http://localhost:8080/test-public-path/',
    );
    // @ts-ignore
    delete global.window;
  });

  it('should not handle publicPath if userOptions.version is not provided', () => {
    const mockWebpackRequire = { p: 'http://localhost:8080/test-public-path/' };
    (global as any).__webpack_require__ = mockWebpackRequire;
    const argsWithoutVersion = {
      options: { name: 'remote' },
      userOptions: { version: undefined },
    };
    const plugin = correctSSRPublicPathPlugin();
    // @ts-ignore
    plugin.beforeInit(argsWithoutVersion);

    expect(mockWebpackRequire.p).toBe(
      'http://localhost:8080/test-public-path/',
    );
  });

  it('should not handle publicPath if __webpack_require__ is not defined', () => {
    (global as any).__webpack_require__ = undefined;
    const plugin = correctSSRPublicPathPlugin();
    // @ts-ignore
    const result = plugin.beforeInit(args);

    expect((global as any).__webpack_require__).toBe(undefined);
  });

  it('should not handle publicPath if snapshot is not available', () => {
    const mockWebpackRequire = { p: 'http://localhost:8080/test-public-path/' };
    (global as any).__webpack_require__ = mockWebpackRequire;

    const plugin = correctSSRPublicPathPlugin();
    // @ts-ignore
    plugin.beforeInit(args);

    expect(mockWebpackRequire.p).toBe(
      'http://localhost:8080/test-public-path/',
    );
  });

  it('should update __webpack_require__.p if publicPath does not end with ssrPath', () => {
    const mockWebpackRequire = { p: 'http://localhost:8080/test-public-path/' };
    (global as any).__webpack_require__ = mockWebpackRequire;

    const reset = addGlobalSnapshot({
      'remote:0.0.1': {
        globalName: '',
        publicPath: '',
        remoteTypes: '',
        shared: [],
        buildVersion: 'custom',
        remotesInfo: {},
        remoteEntryType: 'global',
        modules: [],
        version: '0.0.1',
        remoteEntry: '',
        ssrRemoteEntry: 'bundles/remote-entry.js',
      },
    });

    const plugin = correctSSRPublicPathPlugin();
    // @ts-ignore
    plugin.beforeInit(args);
    const ssrPath = 'bundles/';
    expect(mockWebpackRequire.p).toBe(
      'http://localhost:8080/test-public-path/' + ssrPath,
    );
    reset();
  });
});
