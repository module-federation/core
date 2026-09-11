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
          remove: jest.fn(),
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
    installClearCache({ webpackRequire: webpackRequire as any });
    webpackRequire.federation.clearCache = clearCache;

    await createClearCacheRuntimePlugin().removeRemote?.({
      remote: { name: 'remoteA' },
      origin: webpackRequire.federation.instance,
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

  test.each(
    [false, true].flatMap((loading) =>
      ['remoteA', 'containerA', 'manifest-provider'].flatMap((providerName) =>
        ['bundler', 'runtime'].map((source) => ({
          loading,
          providerName,
          source,
        })),
      ),
    ),
  )(
    'should invalidate host caches while preserving shared provider: %j',
    async ({ loading, providerName, source }) => {
      const { instance, webpackRequire } = createWebpackRequire();
      const remoteEntryClear = jest.fn();
      const selectiveClear = jest.fn();
      const previousFederation = (globalThis as any).__FEDERATION__;
      const globalName =
        providerName === 'manifest-provider'
          ? '__FEDERATION_custom:custom__'
          : providerName;
      const shared = {
        from: providerName,
        loaded: !loading,
        loading: loading ? Promise.resolve() : undefined,
        lib: loading ? undefined : () => ({ value: 'shared from remoteA' }),
        useIn: [providerName, 'anotherRemote'],
      };

      instance.moduleCache.set('remoteA', {
        remoteInfo: {
          name: 'remoteA',
          entryGlobalName: globalName,
          providerName,
        },
        remoteEntryExports: {
          __webpack_clear_cache__: remoteEntryClear,
          __webpack_clear_exposed_cache__: selectiveClear,
        },
      });
      (globalThis as any)[globalName] = {
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
            entryGlobalName: globalName,
          },
        ],
      };
      if (source === 'runtime') {
        instance.options.remotes = [
          {
            name: 'remoteA',
            entry: 'http://localhost:3001/remoteEntry.js',
            entryGlobalName: globalName,
          },
        ] as any;
        webpackRequire.federation.bundlerRuntimeOptions.remotes.remoteInfos =
          {};
      }
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
        expect((globalThis as any)[globalName]).toBeDefined();
        expect(shared.from).toBe(providerName);
      } finally {
        (globalThis as any).__FEDERATION__ = previousFederation;
        delete (globalThis as any)[globalName];
        (globalThis as any).window = previousWindow;
        (globalThis as any).document = previousDocument;
      }
    },
  );

  test('resolved container identity never deletes a registration-named business global', async () => {
    const { instance, webpackRequire } = createWebpackRequire();
    const business = { dispose: jest.fn() };
    const container = { __webpack_clear_cache__: jest.fn() };
    const globals = globalThis as any;
    const previous = globals.dynamic;
    globals.dynamic = business;
    globals.__test_resolved_container__ = container;
    instance.options.remotes = [
      {
        name: 'dynamic',
        entry: 'https://example.com/mf-manifest.json',
        entryGlobalName: 'dynamic',
      },
    ] as any;
    instance.moduleCache.set('dynamic', {
      remoteInfo: {
        name: 'dynamic',
        entryGlobalName: '__test_resolved_container__',
      },
      remoteEntryExports: container,
    });
    try {
      await clearCache({
        name: 'dynamic',
        webpackRequire: webpackRequire as any,
      });
      expect(globals.dynamic).toBe(business);
      expect(business.dispose).not.toHaveBeenCalled();
      expect(globals.__test_resolved_container__).toBeUndefined();
      expect(container.__webpack_clear_cache__).toHaveBeenCalled();
    } finally {
      if (previous === undefined) delete globals.dynamic;
      else globals.dynamic = previous;
      delete globals.__test_resolved_container__;
    }
  });

  test('remove hook retains resolved identity after an earlier hook deletes moduleCache', async () => {
    const { instance, webpackRequire } = createWebpackRequire();
    const business = { dispose: jest.fn() };
    const container = { __webpack_clear_cache__: jest.fn() };
    const globals = globalThis as any;
    const previous = globals.dynamic;
    globals.dynamic = business;
    globals.__test_resolved_container__ = container;
    instance.options.remotes = [
      {
        name: 'dynamic',
        entry: 'https://example.com/mf-manifest.json',
        entryGlobalName: 'dynamic',
      },
    ] as any;
    instance.moduleCache.set('dynamic', {
      remoteInfo: {
        name: 'dynamic',
        entryGlobalName: '__test_resolved_container__',
      },
      remoteEntryExports: container,
    });
    try {
      const remoteInfo = { ...instance.moduleCache.get('dynamic').remoteInfo };
      instance.moduleCache.delete('dynamic');
      installClearCache({ webpackRequire: webpackRequire as any });
      await createClearCacheRuntimePlugin().removeRemote({
        remote: instance.options.remotes[0],
        origin: instance,
        remoteInfo: remoteInfo as any,
      });
      expect(globals.dynamic).toBe(business);
      expect(business.dispose).not.toHaveBeenCalled();
      expect(globals.__test_resolved_container__).toBeUndefined();
      expect(container.__webpack_clear_cache__).toHaveBeenCalled();
    } finally {
      if (previous === undefined) delete globals.dynamic;
      else globals.dynamic = previous;
      delete globals.__test_resolved_container__;
    }
  });

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

describe('cache adapter lifecycle', () => {
  test('attaches once and restores exact methods and its listener on disposal', () => {
    const { instance, webpackRequire } = createWebpackRequire();
    const originalLoad = instance.loadRemote;
    const originalRegister = instance.registerRemotes;
    const originalSet = instance.moduleCache.set;
    const dispose = installClearCache({
      webpackRequire: webpackRequire as any,
    })!;
    const load = instance.loadRemote;
    expect(installClearCache({ webpackRequire: webpackRequire as any })).toBe(
      dispose,
    );
    expect(instance.loadRemote).toBe(load);
    const hook = instance.loaderHook.lifecycle.createScript;
    expect(hook.on).toHaveBeenCalledTimes(1);
    dispose();
    dispose();
    expect(instance.loadRemote).toBe(originalLoad);
    expect(instance.registerRemotes).toBe(originalRegister);
    expect(instance.moduleCache.set).toBe(originalSet);
    expect(hook.remove).toHaveBeenCalledTimes(1);
    expect(hook.remove).toHaveBeenCalledWith(hook.on.mock.calls[0][0]);
    expect(Object.hasOwn(webpackRequire.federation, 'clearCache')).toBe(false);
    expect(Object.hasOwn(webpackRequire.federation, 'disposeClearCache')).toBe(
      false,
    );
  });

  test('routes removal to every live binding, including a different bundled copy', async () => {
    const { instance, webpackRequire: first } = createWebpackRequire();
    const { webpackRequire: second } = createWebpackRequire();
    second.federation.instance = instance;
    const disposeFirst = installClearCache({ webpackRequire: first as any })!;
    const wrappedLoad = instance.loadRemote;
    let other: typeof import('../src/clearCache');
    jest.isolateModules(() => {
      other = require('../src/clearCache');
    });
    expect(other!.installClearCache({ webpackRequire: first as any })).toBe(
      disposeFirst,
    );
    const disposeSecond = other!.installClearCache({
      webpackRequire: second as any,
    })!;
    expect(instance.loadRemote).toBe(wrappedLoad);
    const firstClear = jest.fn(async () => ({
      name: 'remoteA',
      cleared: true as const,
    }));
    const secondClear = jest.fn(async () => ({
      name: 'remoteA',
      cleared: true as const,
    }));
    first.federation.clearCache = firstClear;
    second.federation.clearCache = secondClear;
    const plugin = createClearCacheRuntimePlugin();
    await plugin.removeRemote({
      origin: instance,
      remote: { name: 'remoteA' },
    });
    expect(firstClear).toHaveBeenCalledTimes(1);
    expect(secondClear).toHaveBeenCalledTimes(1);
    disposeFirst();
    await plugin.removeRemote({
      origin: instance,
      remote: { name: 'remoteA' },
    });
    expect(firstClear).toHaveBeenCalledTimes(1);
    expect(secondClear).toHaveBeenCalledTimes(2);
    expect(instance.loadRemote).toBe(wrappedLoad);
    disposeSecond();
    await plugin.removeRemote({
      origin: instance,
      remote: { name: 'remoteA' },
    });
    expect(secondClear).toHaveBeenCalledTimes(2);
  });

  test('preserves later third-party wrappers without reviving a disposed registry', async () => {
    const { instance, webpackRequire } = createWebpackRequire();
    const original = instance.loadRemote;
    const dispose = installClearCache({
      webpackRequire: webpackRequire as any,
    })!;
    const ours = instance.loadRemote;
    const thirdParty = jest.fn((...args: any[]) => (ours as any)(...args));
    instance.loadRemote = thirdParty;
    dispose();
    expect(instance.loadRemote).toBe(thirdParty);
    const again = installClearCache({ webpackRequire: webpackRequire as any })!;
    await instance.loadRemote('remoteA/X', {});
    expect(original).toHaveBeenCalledTimes(1);
    expect(thirdParty).toHaveBeenCalledTimes(1);
    again();
    expect(instance.loadRemote).toBe(thirdParty);
    await instance.loadRemote('remoteA/Y', {});
    expect(original).toHaveBeenCalledTimes(2);
  });

  test('rejects disposal during cleanup and rejects saved entry points after disposal', async () => {
    const { webpackRequire } = createWebpackRequire();
    const dispose = installClearCache({
      webpackRequire: webpackRequire as any,
    })!;
    const clear = webpackRequire.federation.clearCache!;
    const pending = clear({ name: 'remoteA' });
    expect(dispose).toThrow('cleanup is pending');
    await pending;
    dispose();
    await expect(clear({ name: 'remoteA' })).rejects.toThrow('detached');
  });
});

describe('cache adapter ownership and removal coordination', () => {
  test('rejects changing the owner of a live binding', () => {
    const { webpackRequire } = createWebpackRequire();
    const dispose = installClearCache({
      webpackRequire: webpackRequire as any,
    })!;
    const { instance: other } = createWebpackRequire();
    expect(() =>
      installClearCache({
        webpackRequire: webpackRequire as any,
        instance: other as any,
      }),
    ).toThrow('another MF instance');
    dispose();
  });

  test('starts every live cleanup and waits for all outcomes before rejecting', async () => {
    const { instance, webpackRequire: first } = createWebpackRequire();
    const { webpackRequire: second } = createWebpackRequire();
    second.federation.instance = instance;
    const disposeFirst = installClearCache({ webpackRequire: first as any })!;
    const disposeSecond = installClearCache({ webpackRequire: second as any })!;
    const deferred = createDeferred();
    const error = new Error('first cleanup failed');
    first.federation.clearCache = jest.fn(async () => {
      throw error;
    });
    second.federation.clearCache = jest.fn(() => deferred.promise as any);
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const pending = createClearCacheRuntimePlugin().removeRemote({
        origin: instance,
        remote: { name: 'remoteA' },
      });
      const observed = expect(pending).rejects.toBe(error);
      let settled = false;
      pending.then(
        () => {
          settled = true;
        },
        () => {
          settled = true;
        },
      );
      await Promise.resolve();
      await Promise.resolve();
      expect(first.federation.clearCache).toHaveBeenCalledTimes(1);
      expect(second.federation.clearCache).toHaveBeenCalledTimes(1);
      expect(settled).toBe(false);
      deferred.resolve();
      await observed;
    } finally {
      warn.mockRestore();
      disposeFirst();
      disposeSecond();
    }
  });
});

test('force registration updates every attached bundler once and leaves detached mappings alone', async () => {
  const { instance, webpackRequire: first } = createWebpackRequire();
  const { webpackRequire: second } = createWebpackRequire();
  second.federation.instance = instance;
  const remote = {
    name: 'remoteA',
    entry: 'https://example.test/old.js',
    type: 'global',
  };
  instance.options.remotes.push(remote as never);
  for (const binding of [first, second]) {
    (
      binding.federation.bundlerRuntimeOptions.remotes.remoteInfos as any
    ).remoteA = [{ ...remote }];
  }
  const disposeFirst = installClearCache({ webpackRequire: first as any })!;
  const disposeSecond = installClearCache({ webpackRequire: second as any })!;
  try {
    const entry = 'https://example.test/new.js';
    await (instance.registerRemotes as any)([{ ...remote, entry }], {
      force: true,
    });
    expect(instance.options.remotes).toHaveLength(1);
    for (const binding of [first, second])
      expect(
        (binding.federation.bundlerRuntimeOptions.remotes.remoteInfos as any)
          .remoteA[0].entry,
      ).toBe(entry);
    disposeFirst();
    const finalEntry = 'https://example.test/final.js';
    await (instance.registerRemotes as any)(
      [{ ...remote, entry: finalEntry }],
      { force: true },
    );
    expect(
      (first.federation.bundlerRuntimeOptions.remotes.remoteInfos as any)
        .remoteA[0].entry,
    ).toBe(entry);
    expect(
      (second.federation.bundlerRuntimeOptions.remotes.remoteInfos as any)
        .remoteA[0].entry,
    ).toBe(finalEntry);
  } finally {
    disposeFirst();
    disposeSecond();
  }
});
