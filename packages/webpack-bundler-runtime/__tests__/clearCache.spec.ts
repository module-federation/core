import {
  clearCache,
  createClearCacheRuntimePlugin,
  installClearCache,
} from '../src/clearCache';

function createWebpackRequire() {
  const instance = {
    moduleCache: new Map(),
    options: {
      remotes: [],
    },
    loadRemote: jest.fn((id, options) => Promise.resolve({ id, options })),
    registerRemotes: jest.fn(),
    loaderHook: {
      lifecycle: {
        createScript: {
          on: jest.fn(),
        },
      },
    },
  };
  const webpackRequire = {
    federation: {
      instance,
      bundlerRuntimeOptions: {
        remotes: {
          remoteInfos: {},
          idToExternalAndNameMapping: {},
          idToRemoteMap: {},
        },
      },
    },
    remotesLoadingData: {},
    m: {},
    c: {},
  };
  return { instance, webpackRequire };
}

describe('clearCache', () => {
  test('should install clearCache on federation instead of the instance', () => {
    const { instance, webpackRequire } = createWebpackRequire();

    installClearCache({ webpackRequire: webpackRequire as any });

    expect(typeof webpackRequire.federation.clearCache).toBe('function');
    expect((instance as any).clearCache).toBeUndefined();
    expect((instance as any).clearRemoteCache).toBeUndefined();
    expect(instance.loaderHook.lifecycle.createScript.on).toHaveBeenCalledTimes(
      1,
    );
  });

  test('should reject when remote name is missing', async () => {
    const { webpackRequire } = createWebpackRequire();

    await expect(
      clearCache({
        name: '',
        webpackRequire: webpackRequire as any,
      }),
    ).rejects.toThrow('clearCache requires a remote name');
  });

  test('should clear bundler cache after runtime removes a remote', async () => {
    const { webpackRequire } = createWebpackRequire();
    const clearCache = jest.fn(() =>
      Promise.resolve({
        name: 'remoteA',
        cleared: true as const,
      }),
    );
    webpackRequire.federation.clearCache = clearCache;

    await createClearCacheRuntimePlugin({
      webpackRequire: webpackRequire as any,
    }).removeRemote?.({
      remote: { name: 'remoteA' },
      origin: {},
    } as any);

    expect(clearCache).toHaveBeenCalledWith({ name: 'remoteA' });
  });
});
