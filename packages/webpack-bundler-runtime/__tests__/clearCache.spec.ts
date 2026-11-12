import { Module, ModuleFederation } from '@module-federation/runtime';
import helpers from '@module-federation/runtime/helpers';
import {
  clearCache,
  createClearCacheRuntimePlugin,
  installClearCache,
} from '../src/clearCache';
import { init } from '../src/init';

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
  test('shares one adapter across require facades without accepting another instance', () => {
    const { webpackRequire } = createWebpackRequire();
    const facade = () =>
      new Proxy(() => {}, {
        get: (_, key) => (webpackRequire as any)[key],
        set: (_, key, value) => {
          (webpackRequire as any)[key] = value;
          return true;
        },
      });
    const first = installClearCache({ webpackRequire: facade() as any });
    try {
      expect(installClearCache({ webpackRequire: facade() as any })).toBe(
        first,
      );
      expect(() =>
        installClearCache({
          webpackRequire: facade() as any,
          instance: createWebpackRequire().instance as any,
        }),
      ).toThrow('another MF instance');
    } finally {
      first!();
    }
  });

  test('registers an unresolved replacement without selecting a same-name provider build', () => {
    const previous = globalThis.__FEDERATION__;
    const { instance, webpackRequire } = createWebpackRequire();
    const providers = ['v1', 'v2'].map((buildVersion) => ({
      name: 'remoteA',
      options: { id: `remoteA:${buildVersion}` },
    }));
    globalThis.__FEDERATION__ = {
      ...previous,
      __INSTANCES__: providers as any,
    };
    try {
      installClearCache({ webpackRequire: webpackRequire as any });
      expect(() =>
        createClearCacheRuntimePlugin().registerRemote({
          remote: { name: 'remoteA', entry: 'https://example.test/new.json' },
          origin: instance,
        }),
      ).not.toThrow();
      expect(globalThis.__FEDERATION__.__INSTANCES__).toEqual(providers);
    } finally {
      globalThis.__FEDERATION__ = previous;
    }
  });

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

  test('clears only the resolved provider build and keeps the other build loadable', async () => {
    const globals = globalThis as any;
    const previousFederation = globals.__FEDERATION__;
    const previousLoading = globals.__GLOBAL_LOADING_REMOTE_ENTRY__;
    globals.__FEDERATION__ = {
      ...previousFederation,
      __INSTANCES__: [],
      __SHARE__: {},
      moduleInfo: {},
    };
    globals.__GLOBAL_LOADING_REMOTE_ENTRY__ = {};
    const providerName = 'clear-cache-provider';
    const globalName = '__clear_cache_versions__';
    const entry = 'https://example.test/fixed-entry.js';
    const builds = ['v1', 'v2'].map((buildVersion) => {
      const provider = new ModuleFederation({
        name: providerName,
        id: `${providerName}:${buildVersion}`,
      });
      const shared = {
        from: providerName,
        useIn: [],
        loaded: false,
        loading: buildVersion === 'v2' ? Promise.resolve() : undefined,
      };
      provider.shareScopeMap.default = {
        library: { '1.0.0': shared as any },
      };
      globals.__FEDERATION__.__SHARE__[provider.options.id!] =
        provider.shareScopeMap;
      const host = new ModuleFederation({
        name: `clear-host-${buildVersion}`,
        remotes: [{ name: 'registered', entry }],
      });
      let cleared = false;
      const container = {
        init() {},
        get: jest.fn(async (expose: string) => {
          if (cleared) throw Error(`Retired container ${buildVersion}`);
          return () => ({ buildVersion, expose });
        }),
        __webpack_clear_cache__: jest.fn(() => {
          cleared = true;
        }),
      };
      const remoteInfo = {
        name: 'registered',
        providerName,
        entry,
        entryGlobalName: globalName,
        buildVersion,
        type: 'global' as const,
        shareScope: 'default',
      };
      const module = new Module({ host, remoteInfo });
      module.remoteEntryExports = container;
      host.moduleCache.set('registered', module);
      helpers.global.setGlobalFederationInstance(provider);
      helpers.global.setGlobalFederationInstance(host);
      const key = helpers.utils.getRemoteEntryUniqueKey(remoteInfo);
      const loading =
        buildVersion === 'v2'
          ? createDeferred().promise
          : Promise.resolve(container);
      globals.__GLOBAL_LOADING_REMOTE_ENTRY__[key] = loading;
      return { provider, host, module, container, shared, key, loading };
    });
    const [first, second] = builds;
    const legacyKey = `registered:${entry}`;
    const legacyLoading = Promise.resolve('legacy');
    globals.__GLOBAL_LOADING_REMOTE_ENTRY__[legacyKey] = legacyLoading;
    globals[globalName] = second.container;
    const { webpackRequire } = createWebpackRequire();
    webpackRequire.federation.instance = first.host as any;
    try {
      expect(await second.host.loadRemote('registered/Before')).toEqual({
        buildVersion: 'v2',
        expose: './Before',
      });
      await clearCache({
        name: 'registered',
        webpackRequire: webpackRequire as any,
      });
      expect(globals.__FEDERATION__.__INSTANCES__).not.toContain(
        first.provider,
      );
      expect(globals.__FEDERATION__.__INSTANCES__).toContain(second.provider);
      expect(
        globals.__GLOBAL_LOADING_REMOTE_ENTRY__[first.key],
      ).toBeUndefined();
      expect(globals.__GLOBAL_LOADING_REMOTE_ENTRY__[second.key]).toBe(
        second.loading,
      );
      expect(globals.__GLOBAL_LOADING_REMOTE_ENTRY__[legacyKey]).toBe(
        legacyLoading,
      );
      expect(globals[globalName]).toBe(second.container);
      expect(
        first.provider.shareScopeMap.default.library['1.0.0'],
      ).toBeUndefined();
      expect(second.provider.shareScopeMap.default.library['1.0.0']).toBe(
        second.shared,
      );
      expect(first.container.__webpack_clear_cache__).toHaveBeenCalled();
      expect(second.container.__webpack_clear_cache__).not.toHaveBeenCalled();
      expect(first.host.moduleCache.has('registered')).toBe(false);
      expect(second.host.moduleCache.get('registered')).toBe(second.module);
      expect(await second.host.loadRemote('registered/After')).toEqual({
        buildVersion: 'v2',
        expose: './After',
      });
    } finally {
      globals.__FEDERATION__ = previousFederation;
      globals.__GLOBAL_LOADING_REMOTE_ENTRY__ = previousLoading;
      delete globals[globalName];
    }
  });

  test('retains a provider and its unused shared records while another host owns its container', async () => {
    const globals = globalThis as any;
    const previousFederation = globals.__FEDERATION__;
    globals.__FEDERATION__ = {
      ...previousFederation,
      __INSTANCES__: [],
      __SHARE__: {},
      moduleInfo: {},
    };
    const provider = new ModuleFederation({
      name: 'retained-provider',
      id: 'retained-provider:v1',
    });
    const shared = { from: provider.name, useIn: [], loaded: false };
    provider.shareScopeMap.default = { library: { '1.0.0': shared as any } };
    globals.__FEDERATION__.__SHARE__[provider.options.id!] =
      provider.shareScopeMap;
    helpers.global.setGlobalFederationInstance(provider);
    let cleared = false;
    const container = {
      init() {},
      get: async () => {
        if (cleared) throw Error('Cleared active provider');
        return () => ({ value: 'still live' });
      },
      __webpack_clear_cache__: jest.fn(() => {
        cleared = true;
      }),
      __webpack_clear_exposed_cache__: jest.fn(() => {
        cleared = true;
      }),
    };
    const remoteInfo = {
      name: 'registered',
      providerName: provider.name,
      buildVersion: 'v1',
      entry: 'https://example.test/retained.js',
      type: 'global' as const,
      entryGlobalName: '__retained_container__',
      shareScope: 'default',
    };
    const hosts = ['owner-a', 'owner-b'].map((name) => {
      const host = new ModuleFederation({
        name,
        remotes: [{ name: 'registered', entry: remoteInfo.entry }],
      });
      const module = new Module({ host, remoteInfo });
      module.remoteEntryExports = container;
      host.moduleCache.set('registered', module);
      helpers.global.setGlobalFederationInstance(host);
      return host;
    });
    globals[remoteInfo.entryGlobalName] = container;
    const { webpackRequire } = createWebpackRequire();
    webpackRequire.federation.instance = hosts[0] as any;
    try {
      await clearCache({
        name: 'registered',
        webpackRequire: webpackRequire as any,
      });
      expect(hosts[0].moduleCache.has('registered')).toBe(false);
      expect(globals.__FEDERATION__.__INSTANCES__).toContain(provider);
      expect(provider.shareScopeMap.default.library['1.0.0']).toBe(shared);
      expect(container.__webpack_clear_cache__).not.toHaveBeenCalled();
      expect(container.__webpack_clear_exposed_cache__).not.toHaveBeenCalled();
      expect(await hosts[1].loadRemote('registered/After')).toEqual({
        value: 'still live',
      });
    } finally {
      globals.__FEDERATION__ = previousFederation;
      delete globals[remoteInfo.entryGlobalName];
    }
  });

  test.each(['entry-hook', 'second-clear'])(
    'rollback after %s preserves another application publication',
    async (failure) => {
      const globals = globalThis as any;
      const previousFederation = globals.__FEDERATION__;
      const previousLoading = globals.__GLOBAL_LOADING_REMOTE_ENTRY__;
      globals.__FEDERATION__ = {
        ...previousFederation,
        __INSTANCES__: [],
        __SHARE__: {},
        moduleInfo: {},
      };
      globals.__GLOBAL_LOADING_REMOTE_ENTRY__ = {};
      const provider = new ModuleFederation({
        name: 'rollback-provider',
        id: 'rollback-provider:v1',
      });
      const newProvider = new ModuleFederation({
        name: provider.name,
        id: 'rollback-provider:v2',
      });
      helpers.global.setGlobalFederationInstance(provider);
      const info = {
        name: 'registered',
        providerName: provider.name,
        buildVersion: 'v1',
        entry: 'https://example.test/rollback.js',
        entryGlobalName: '__rollback_container__',
      };
      const loadingKey = helpers.utils.getRemoteEntryUniqueKey(info);
      const oldLoading = Promise.resolve('old');
      const newLoading = Promise.resolve('new');
      const newContainer = { get() {} };
      const publishAndFail = () => {
        helpers.global.setGlobalFederationInstance(newProvider);
        globals[info.entryGlobalName] = newContainer;
        // Even the same loading key must not be overwritten by an old rollback.
        globals.__GLOBAL_LOADING_REMOTE_ENTRY__[loadingKey] = newLoading;
        throw Error('clear failed after another publication');
      };
      const container = {
        __webpack_clear_cache__:
          failure === 'entry-hook' ? publishAndFail : () => {},
      };
      globals[info.entryGlobalName] = container;
      globals.__GLOBAL_LOADING_REMOTE_ENTRY__[loadingKey] = oldLoading;
      const { instance, webpackRequire } = createWebpackRequire();
      const module = { remoteInfo: info, remoteEntryExports: container };
      instance.moduleCache.set('registered', module);
      let clears = 0;
      (webpackRequire as any).chunkCacheControls = {
        node: {
          clear() {
            if (++clears === 2 && failure === 'second-clear') publishAndFail();
          },
        },
      };
      webpackRequire.remotesLoadingData = {
        remoteKeyToChunkIds: { registered: [10] },
        remoteKeyToRemoteModuleIds: { registered: [101] },
      };
      const cached = { exports: 'old local module' };
      webpackRequire.c[101] = cached;
      try {
        await expect(
          clearCache({
            name: 'registered',
            webpackRequire: webpackRequire as any,
          }),
        ).rejects.toThrow('clear failed after another publication');
        expect(globals.__FEDERATION__.__INSTANCES__).toContain(provider);
        expect(globals.__FEDERATION__.__INSTANCES__).toContain(newProvider);
        expect(globals[info.entryGlobalName]).toBe(newContainer);
        expect(globals.__GLOBAL_LOADING_REMOTE_ENTRY__[loadingKey]).toBe(
          newLoading,
        );
        expect(instance.moduleCache.get('registered')).toBe(module);
        expect(webpackRequire.c[101]).toBe(cached);
      } finally {
        globals.__FEDERATION__ = previousFederation;
        globals.__GLOBAL_LOADING_REMOTE_ENTRY__ = previousLoading;
        delete globals[info.entryGlobalName];
      }
    },
  );

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
  test('shares cache state through a get/set runtime require facade', async () => {
    const { webpackRequire: context } = createWebpackRequire();
    const facade = new Proxy(() => {}, {
      get: (_target, key) => Reflect.get(context, key),
      set: (_target, key, value) => Reflect.set(context, key, value),
    });
    const webpackRequire = facade as unknown as typeof context;
    const dispose = installClearCache({
      webpackRequire: webpackRequire as any,
    })!;
    try {
      expect(installClearCache({ webpackRequire: webpackRequire as any })).toBe(
        dispose,
      );
      const stateKey = Symbol.for('module-federation.clear-cache.state');
      expect(Reflect.get(facade, stateKey)).toBe(
        Reflect.get(context, stateKey),
      );
      expect(Object.getOwnPropertyDescriptor(facade, stateKey)).toBeUndefined();
      await expect(
        webpackRequire.federation.clearCache!({ name: 'remoteA' }),
      ).resolves.toEqual({ name: 'remoteA', cleared: true });
      await expect(
        webpackRequire.federation.clearCache!({ name: 'remoteA' }),
      ).resolves.toEqual({ name: 'remoteA', cleared: true });
    } finally {
      dispose();
    }
  });

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
  test('reinitializes one bundler without transferring another binding or retaining the old owner', async () => {
    const { instance: first, webpackRequire } = createWebpackRequire();
    const { instance: second } = createWebpackRequire();
    const { webpackRequire: sibling } = createWebpackRequire();
    const firstLoadRemote = first.loadRemote;
    const secondLoadRemote = second.loadRemote;
    const runtimeInit = jest
      .fn()
      .mockReturnValueOnce(first)
      .mockReturnValueOnce(second);
    Object.assign(webpackRequire.federation, {
      initOptions: { name: 'first' },
      runtime: { init: runtimeInit },
    });
    sibling.federation.instance = first;
    const disposeSibling = installClearCache({
      webpackRequire: sibling as any,
    })!;
    try {
      webpackRequire.federation.instance = init({
        webpackRequire: webpackRequire as any,
      }) as any;
      const disposeFirst = webpackRequire.federation.disposeClearCache!;
      const firstClear = webpackRequire.federation.clearCache!;
      Object.assign(webpackRequire.federation, {
        instance: undefined,
        initOptions: { name: 'second' },
      });
      webpackRequire.federation.instance = init({
        webpackRequire: webpackRequire as any,
      }) as any;
      const secondClear = webpackRequire.federation.clearCache!;
      expect(runtimeInit).toHaveBeenCalledTimes(2);
      expect(webpackRequire.federation.instance).toBe(second);
      await expect(firstClear({ name: 'remoteA' })).rejects.toThrow('detached');
      disposeFirst();
      expect(webpackRequire.federation.clearCache).toBe(secondClear);
      expect(first.loadRemote).not.toBe(firstLoadRemote);
      createClearCacheRuntimePlugin().dispose({ origin: first });
      expect(first.loadRemote).toBe(firstLoadRemote);
      expect(webpackRequire.federation.instance).toBe(second);
      expect(webpackRequire.federation.clearCache).toBe(secondClear);
      await expect(secondClear({ name: 'remoteA' })).resolves.toEqual({
        name: 'remoteA',
        cleared: true,
      });
    } finally {
      disposeSibling();
      webpackRequire.federation.disposeClearCache?.();
    }
    expect(second.loadRemote).toBe(secondLoadRemote);
  });

  test('rejects bundler reinitialization before invoking runtime init during cleanup', async () => {
    const { instance, webpackRequire } = createWebpackRequire();
    const runtimeInit = jest.fn(() => instance);
    Object.assign(webpackRequire.federation, {
      initOptions: { name: 'container' },
      runtime: { init: runtimeInit },
    });
    init({ webpackRequire: webpackRequire as any });
    const clear = webpackRequire.federation.clearCache!;
    const pending = clear({ name: 'remoteA' });
    expect(() => init({ webpackRequire: webpackRequire as any })).toThrow(
      'cleanup is pending',
    );
    expect(runtimeInit).toHaveBeenCalledTimes(1);
    expect(webpackRequire.federation.clearCache).toBe(clear);
    await pending;
    try {
      expect(init({ webpackRequire: webpackRequire as any })).toBe(instance);
      expect(runtimeInit).toHaveBeenCalledTimes(2);
    } finally {
      webpackRequire.federation.disposeClearCache?.();
    }
  });

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

test('retains synchronous force registration when the cache adapter is installed', () => {
  const { webpackRequire } = createWebpackRequire();
  const remote = { name: 'remoteA', entry: 'https://example.test/old.js' };
  const instance = new ModuleFederation({
    name: 'legacy-force-with-adapter',
    remotes: [remote],
    plugins: [createClearCacheRuntimePlugin()],
  });
  webpackRequire.federation.instance = instance as any;
  const original = instance.registerRemotes;
  const dispose = installClearCache({ webpackRequire: webpackRequire as any })!;
  const clear = jest.fn();
  webpackRequire.federation.clearCache = clear;
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    const entry = 'https://example.test/new.js';
    expect(instance.registerRemotes).toBe(original);
    expect(
      instance.registerRemotes([{ ...remote, entry }], { force: true }),
    ).toBeUndefined();
    expect(instance.options.remotes[0].entry).toBe(entry);
    expect(clear).not.toHaveBeenCalled();
  } finally {
    warn.mockRestore();
    dispose();
  }
});

test('explicit update updates every attached bundler once and leaves detached mappings alone', async () => {
  const { webpackRequire: first } = createWebpackRequire();
  const { webpackRequire: second } = createWebpackRequire();
  const remote = {
    name: 'remoteA',
    entry: 'https://example.test/old.js',
    type: 'global',
  };
  const instance = new ModuleFederation({
    name: 'multi-bundler-update',
    remotes: [remote],
    plugins: [createClearCacheRuntimePlugin()],
  });
  first.federation.instance = instance as any;
  second.federation.instance = instance as any;
  for (const binding of [first, second]) {
    (
      binding.federation.bundlerRuntimeOptions.remotes.remoteInfos as any
    ).remoteA = [{ ...remote }];
  }
  const disposeFirst = installClearCache({ webpackRequire: first as any })!;
  const disposeSecond = installClearCache({ webpackRequire: second as any })!;
  try {
    const entry = 'https://example.test/new.js';
    await instance.updateRemotes([{ ...remote, entry }]);
    expect(instance.options.remotes).toHaveLength(1);
    for (const binding of [first, second])
      expect(
        (binding.federation.bundlerRuntimeOptions.remotes.remoteInfos as any)
          .remoteA[0].entry,
      ).toBe(entry);
    disposeFirst();
    const finalEntry = 'https://example.test/final.js';
    await instance.updateRemotes([{ ...remote, entry: finalEntry }]);
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
