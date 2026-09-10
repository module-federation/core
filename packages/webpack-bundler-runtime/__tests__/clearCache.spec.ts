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

function createDeferred() {
  let resolve!: (value?: unknown) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
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

  test('should clear remote entry internal module cache', async () => {
    const { instance, webpackRequire } = createWebpackRequire();
    const remoteEntryClear = jest.fn();
    const libClear = jest.fn();
    const globalClear = jest.fn();

    instance.moduleCache.set('remoteA', {
      remoteEntryExports: {
        __webpack_clear_cache__: remoteEntryClear,
      },
      lib: {
        __webpack_clear_cache__: libClear,
      },
    });
    (globalThis as any).remoteA = {
      __webpack_clear_cache__: globalClear,
    };
    webpackRequire.federation.bundlerRuntimeOptions.remotes.remoteInfos = {
      remoteA: [
        {
          name: 'remoteA',
          entry: 'http://localhost:3001/remoteEntry.js',
          entryGlobalName: 'remoteA',
        },
      ],
    };
    webpackRequire.remotesLoadingData = {
      moduleIdToRemoteDataMapping: {
        101: {
          shareScope: 'default',
          name: './Widget',
          externalModuleId: 201,
          remoteName: 'remoteA',
        },
      },
      remoteKeyToRemoteModuleIds: {
        remoteA: [101],
      },
      remoteKeyToExternalModuleIds: {
        remoteA: [201],
      },
      remoteKeyToChunkIds: {
        remoteA: [],
      },
    };

    await clearCache({
      name: 'remoteA',
      webpackRequire: webpackRequire as any,
    });

    expect(remoteEntryClear).toHaveBeenCalledTimes(1);
    expect(libClear).toHaveBeenCalledTimes(1);
    expect(globalClear).toHaveBeenCalledTimes(1);
    expect(instance.moduleCache.has('remoteA')).toBe(false);
    expect((globalThis as any).remoteA).toBeUndefined();
  });

  test.each([{ loading: false }, { loading: true }])(
    'should invalidate host caches while preserving shared provider: %j',
    async ({ loading }) => {
      const { instance, webpackRequire } = createWebpackRequire();
      const remoteEntryClear = jest.fn();
      const selectiveClear = jest.fn();
      const previousFederation = (globalThis as any).__FEDERATION__;
      const shared = {
        from: 'remoteA',
        loaded: !loading,
        loading: loading ? Promise.resolve() : undefined,
        lib: loading ? undefined : () => ({ value: 'shared from remoteA' }),
        useIn: ['remoteA', 'anotherRemote'],
      };

      instance.moduleCache.set('remoteA', {
        remoteEntryExports: {
          __webpack_clear_cache__: remoteEntryClear,
          __webpack_clear_exposed_cache__: selectiveClear,
        },
      });
      (globalThis as any).remoteA = {
        __webpack_clear_cache__: remoteEntryClear,
        __webpack_clear_exposed_cache__: selectiveClear,
      };
      (globalThis as any).__FEDERATION__ = {
        ...(previousFederation || {}),
        __SHARE__: {
          remoteA: {
            default: {
              'shared-from-remoteA': {
                '1.0.0': shared,
              },
            },
          },
        },
      };
      webpackRequire.federation.bundlerRuntimeOptions.remotes.remoteInfos = {
        remoteA: [
          {
            name: 'remoteA',
            entry: 'http://localhost:3001/remoteEntry.js',
            entryGlobalName: 'remoteA',
          },
        ],
      };
      webpackRequire.remotesLoadingData = {
        moduleIdToRemoteDataMapping: {
          101: {
            externalModuleId: 201,
            remoteName: 'remoteA',
          },
        },
        remoteKeyToRemoteModuleIds: {
          remoteA: [101],
        },
        remoteKeyToExternalModuleIds: {
          remoteA: [201],
        },
        remoteKeyToChunkIds: {
          remoteA: [],
        },
      };

      webpackRequire.remotesLoadingData.remoteModuleIdToConsumerModuleIds = {
        101: [301],
      };
      webpackRequire.m[101] = () => null;
      for (const id of [101, 201, 301, 302])
        webpackRequire.c[id] = { exports: {} };
      const previousWindow = globalThis.window;
      const previousDocument = globalThis.document;
      delete (globalThis as any).window;
      delete (globalThis as any).document;
      try {
        await clearCache({
          name: 'remoteA',
          webpackRequire: webpackRequire as any,
        });

        expect(remoteEntryClear).not.toHaveBeenCalled();
        expect(selectiveClear).toHaveBeenCalled();
        expect(instance.moduleCache.has('remoteA')).toBe(false);
        expect(webpackRequire.m[101]).toBeUndefined();
        expect(webpackRequire.c[101]).toBeUndefined();
        expect(webpackRequire.c[201]).toBeUndefined();
        expect(webpackRequire.c[301]).toBeUndefined();
        expect(webpackRequire.c[302]).toBeDefined();
        expect(
          (globalThis as any).__FEDERATION__.__SHARE__.remoteA.default[
            'shared-from-remoteA'
          ]['1.0.0'],
        ).toBe(shared);
        expect((globalThis as any).remoteA).toBeDefined();
        expect(shared.from).toBe('remoteA');
      } finally {
        (globalThis as any).__FEDERATION__ = previousFederation;
        delete (globalThis as any).remoteA;
        (globalThis as any).window = previousWindow;
        (globalThis as any).document = previousDocument;
      }
    },
  );

  test('should evict old caches before pending remote load settles', async () => {
    const { instance, webpackRequire } = createWebpackRequire();
    const pendingLoad = createDeferred();
    const remoteEntryClear = jest.fn();
    const hadWindow = Object.prototype.hasOwnProperty.call(
      globalThis,
      'window',
    );
    const hadDocument = Object.prototype.hasOwnProperty.call(
      globalThis,
      'document',
    );
    const previousWindow = (globalThis as any).window;
    const previousDocument = (globalThis as any).document;

    instance.moduleCache.set('remoteA', {
      remoteEntryExports: {
        __webpack_clear_cache__: remoteEntryClear,
      },
    });
    webpackRequire.federation.bundlerRuntimeOptions.remotes.remoteInfos = {
      remoteA: [
        {
          name: 'remoteA',
          entry: 'http://localhost:3001/remoteEntry.js',
          entryGlobalName: 'remoteA',
        },
      ],
    };
    webpackRequire.remotesLoadingData = {
      moduleIdToRemoteDataMapping: {
        101: {
          shareScope: 'default',
          name: './Widget',
          externalModuleId: 201,
          remoteName: 'remoteA',
          p: pendingLoad.promise,
        },
      },
      remoteKeyToRemoteModuleIds: {
        remoteA: [101],
      },
      remoteKeyToExternalModuleIds: {
        remoteA: [201],
      },
      remoteKeyToChunkIds: {
        remoteA: [],
      },
      remoteModuleIdToConsumerModuleIds: {
        101: [301],
      },
    };
    webpackRequire.m[101] = () => null;
    webpackRequire.c[101] = { exports: {} };
    webpackRequire.c[201] = { exports: {} };
    webpackRequire.c[301] = { exports: {} };

    delete (globalThis as any).window;
    delete (globalThis as any).document;
    try {
      const clearPromise = clearCache({
        name: 'remoteA',
        webpackRequire: webpackRequire as any,
      });
      let settled = false;
      void clearPromise.then(() => {
        settled = true;
      });
      await Promise.resolve();
      await Promise.resolve();

      expect(webpackRequire.m[101]).toBeUndefined();
      expect(webpackRequire.c[101]).toBeUndefined();
      expect(webpackRequire.c[201]).toBeUndefined();
      expect(webpackRequire.c[301]).toBeUndefined();
      expect(instance.moduleCache.has('remoteA')).toBe(false);
      expect(remoteEntryClear).toHaveBeenCalledTimes(1);
      expect(settled).toBe(false);

      pendingLoad.resolve();
      await clearPromise;
      await Promise.resolve();
      await Promise.resolve();

      expect(settled).toBe(true);
      expect(
        webpackRequire.remotesLoadingData.moduleIdToRemoteDataMapping[101].p,
      ).toBeUndefined();
      expect(webpackRequire.m[101]).toBeUndefined();
      expect(webpackRequire.c[101]).toBeUndefined();
      expect(webpackRequire.c[201]).toBeUndefined();
      expect(webpackRequire.c[301]).toBeUndefined();
      expect(instance.moduleCache.has('remoteA')).toBe(false);
    } finally {
      if (hadWindow) {
        (globalThis as any).window = previousWindow;
      }
      if (hadDocument) {
        (globalThis as any).document = previousDocument;
      }
    }
  });
});
