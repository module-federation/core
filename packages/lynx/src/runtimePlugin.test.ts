import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { ModuleFederation } from '@module-federation/runtime-core';
import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime-core/types';

import lynxRuntimePlugin, { LYNX_BUNDLE_REGISTRY } from './runtimePlugin';

type NativeCallback = (error: unknown, value: unknown) => void;

interface TestLynx {
  fetchBundle?(entry: string): PromiseLike<unknown>;
  getNativeApp?(): unknown;
  loadScript?(sectionPath: string, options: { bundleName: string }): unknown;
  requireModuleAsync?(entry: string, callback: NativeCallback): void;
}

const PREPARE_REMOTE_ENTRY_MTS = 'rModuleFederationPrepareRemoteEntryMTS';

type LoadEntryArgs = Parameters<
  NonNullable<ModuleFederationRuntimePlugin['loadEntry']>
>[0];
type GeneratePreloadAssetsArgs = Parameters<
  NonNullable<ModuleFederationRuntimePlugin['generatePreloadAssets']>
>[0];

const remoteInfo = {
  name: 'remote',
  entry: 'https://example.test/remoteEntry.js',
  entryGlobalName: 'remote',
  type: 'lynx-js',
  shareScope: 'default',
};

const bundleRemoteInfo = {
  ...remoteInfo,
  entry: 'https://example.test/remote.lynx.bundle',
};

const createContainer = () => ({
  get: rs.fn(),
  init: rs.fn(),
});

const setLynx = (lynx: TestLynx): void => {
  (globalThis as unknown as Record<string, unknown>).lynx = lynx;
};

const loadEntry = (plugin: ModuleFederationRuntimePlugin, info = remoteInfo) =>
  plugin.loadEntry!({ remoteInfo: info } as LoadEntryArgs);

afterEach(() => {
  const globalRecord = globalThis as unknown as Record<PropertyKey, unknown>;
  delete globalRecord.lynx;
  delete globalRecord.remote;
  delete globalRecord.globDynamicComponentEntry;
  delete globalRecord[PREPARE_REMOTE_ENTRY_MTS];
  delete globalRecord[LYNX_BUNDLE_REGISTRY];
  const globalLoading = globalRecord.__GLOBAL_LOADING_REMOTE_ENTRY__ as
    | Record<string, Promise<unknown> | undefined>
    | undefined;
  if (globalLoading) {
    for (const key of Object.keys(globalLoading)) {
      delete globalLoading[key];
    }
  }
  rs.restoreAllMocks();
});

describe('lynxRuntimePlugin entry loading', () => {
  it('loads plain JavaScript entries in the background realm', async () => {
    const container = createContainer();
    const requireModuleAsync = rs.fn(
      (_entry: string, callback: NativeCallback) => callback(null, container),
    );
    setLynx({ requireModuleAsync });

    await expect(loadEntry(lynxRuntimePlugin())).resolves.toBe(container);
    expect(requireModuleAsync).toHaveBeenCalledWith(
      remoteInfo.entry,
      expect.any(Function),
    );
  });

  it('accepts default and global container exports', async () => {
    const defaultContainer = createContainer();
    setLynx({
      requireModuleAsync: (_entry, callback) =>
        callback(null, { default: defaultContainer }),
    });
    await expect(loadEntry(lynxRuntimePlugin())).resolves.toBe(
      defaultContainer,
    );

    const globalContainer = createContainer();
    setLynx({
      requireModuleAsync: (_entry, callback) => {
        (globalThis as unknown as Record<string, unknown>).remote = {
          default: globalContainer,
        };
        callback(null, undefined);
      },
    });
    await expect(loadEntry(lynxRuntimePlugin())).resolves.toBe(globalContainer);
  });

  it('rejects a pre-existing container global for a newly loaded URL', async () => {
    const staleContainer = createContainer();
    (globalThis as unknown as Record<string, unknown>).remote = staleContainer;
    setLynx({
      fetchBundle: async () => ({ code: 0, url: 'lynx-cache://new-remote' }),
      loadScript: () => undefined,
    });

    await expect(
      loadEntry(lynxRuntimePlugin(), bundleRemoteInfo),
    ).rejects.toThrow('did not export a Module Federation container');
  });

  it('deduplicates concurrent entry loads', async () => {
    const container = createContainer();
    let finishLoad: NativeCallback | undefined;
    const requireModuleAsync = rs.fn(
      (_entry: string, callback: NativeCallback) => {
        finishLoad = callback;
      },
    );
    setLynx({ requireModuleAsync });

    const plugin = lynxRuntimePlugin();
    const first = loadEntry(plugin);
    const second = loadEntry(plugin);
    finishLoad!(null, container);

    await expect(first).resolves.toBe(container);
    await expect(second).resolves.toBe(container);
    expect(requireModuleAsync).toHaveBeenCalledTimes(1);
  });

  it('loads bundle entries from the background section', async () => {
    const container = createContainer();
    const callLepusMethod = rs.fn(
      (_name: string, _payload: unknown, callback: () => void) => callback(),
    );
    const fetchBundle = rs.fn(async () => ({
      code: 0,
      url: 'lynx-cache://remote',
    }));
    const loadScript = rs.fn(async () => container);
    setLynx({
      fetchBundle,
      getNativeApp: () => ({ callLepusMethod }),
      loadScript,
    });

    const loadedContainer = await loadEntry(
      lynxRuntimePlugin(),
      bundleRemoteInfo,
    );
    expect(loadedContainer).not.toBe(container);
    loadedContainer.get('./Card');
    expect(container.get).toHaveBeenCalledWith('./Card');
    expect(fetchBundle).toHaveBeenCalledWith(bundleRemoteInfo.entry);
    expect(loadScript).toHaveBeenCalledWith('remote', {
      bundleName: 'lynx-cache://remote',
    });
    expect(callLepusMethod).toHaveBeenCalledWith(
      PREPARE_REMOTE_ENTRY_MTS,
      {
        bundleName: 'lynx-cache://remote',
        entry: bundleRemoteInfo.entry,
        sectionPath: 'remote__main-thread',
      },
      expect.any(Function),
    );
    expect(
      (
        globalThis as unknown as Record<
          PropertyKey,
          Map<string, string> | undefined
        >
      )[LYNX_BUNDLE_REGISTRY]?.get('remote'),
    ).toBe('lynx-cache://remote');
  });

  it('prepares paired remote containers in the main-thread realm', () => {
    const container = createContainer();
    const globalRecord = globalThis as unknown as Record<string, unknown>;
    globalRecord.globDynamicComponentEntry = '__Card__';
    const loadScript = rs.fn(() => {
      expect(globalRecord.globDynamicComponentEntry).toBe(
        bundleRemoteInfo.entry,
      );
      return container;
    });
    setLynx({ loadScript });

    lynxRuntimePlugin();
    const prepare = globalRecord[PREPARE_REMOTE_ENTRY_MTS] as (
      payload: Record<string, string>,
    ) => unknown;

    expect(prepare).toBeTypeOf('function');
    expect(
      prepare({
        bundleName: 'lynx-cache://remote',
        entry: bundleRemoteInfo.entry,
        sectionPath: 'remote__main-thread',
      }),
    ).toBe(true);
    expect(loadScript).toHaveBeenCalledWith('remote__main-thread', {
      bundleName: 'lynx-cache://remote',
    });
    expect(globalRecord.globDynamicComponentEntry).toBe('__Card__');
  });

  it('reports paired main-thread preparation failures immediately', async () => {
    const registry = new Map<string, string>();
    (
      globalThis as unknown as Record<
        PropertyKey,
        Map<string, string> | undefined
      >
    )[LYNX_BUNDLE_REGISTRY] = registry;
    setLynx({
      fetchBundle: async () => ({ code: 0, url: 'lynx-cache://remote' }),
      getNativeApp: () => ({
        callLepusMethod: () => {
          throw new Error('main-thread preparation failed');
        },
      }),
      loadScript: () => createContainer(),
    });

    await expect(
      loadEntry(lynxRuntimePlugin(), bundleRemoteInfo),
    ).rejects.toThrow('main-thread preparation failed');
    expect(registry.size).toBe(0);
  });

  it('loads bundle entries from the main-thread section', async () => {
    const container = createContainer();
    const globalRecord = globalThis as unknown as Record<string, unknown>;
    globalRecord.globDynamicComponentEntry = '__Card__';
    const loadScript = rs.fn(() => {
      expect(globalRecord.globDynamicComponentEntry).toBe(
        bundleRemoteInfo.entry,
      );
      return { default: container };
    });
    setLynx({
      fetchBundle: async () => ({ code: 0, url: 'lynx-cache://remote' }),
      loadScript,
    });

    const loadedContainer = await loadEntry(
      lynxRuntimePlugin(),
      bundleRemoteInfo,
    );
    expect(loadedContainer).not.toBe(container);
    loadedContainer.get('./Card');
    expect(container.get).toHaveBeenCalledWith('./Card__main_thread');
    expect(loadScript).toHaveBeenCalledWith('remote__main-thread', {
      bundleName: 'lynx-cache://remote',
    });
    expect(globalRecord.globDynamicComponentEntry).toBe('__Card__');
    expect(
      (
        globalThis as unknown as Record<
          PropertyKey,
          Map<string, string> | undefined
        >
      )[LYNX_BUNDLE_REGISTRY]?.get('remote__main_thread'),
    ).toBe('lynx-cache://remote');
    expect(
      (
        globalThis as unknown as Record<
          PropertyKey,
          Map<string, string> | undefined
        >
      )[LYNX_BUNDLE_REGISTRY]?.get('remote'),
    ).toBe('lynx-cache://remote');
  });

  it.each([
    ['camel-case', { errorMsg: 'not found' }, -1, 'not found'],
    ['native snake-case', { error_msg: 'decode failed' }, -2, 'decode failed'],
  ] as const)(
    'reports %s bundle errors',
    async (_name, error, code, message) => {
      const loadScript = rs.fn();
      setLynx({
        fetchBundle: async () => ({
          code,
          url: 'https://example.test/remote.lynx.bundle',
          ...error,
        }),
        loadScript,
      });

      await expect(
        loadEntry(lynxRuntimePlugin(), bundleRemoteInfo),
      ).rejects.toThrow(`code ${code}: ${message}`);
      expect(loadScript).not.toHaveBeenCalled();
    },
  );

  it('rolls back bundle registry mappings after evaluation fails', async () => {
    const registry = new Map([
      ['remote', 'lynx-cache://previous'],
      ['remote:remote-origin', 'https://previous.test/remote.lynx.bundle'],
      ['remote__main_thread', 'lynx-cache://previous'],
    ]);
    (
      globalThis as unknown as Record<
        PropertyKey,
        Map<string, string> | undefined
      >
    )[LYNX_BUNDLE_REGISTRY] = registry;
    setLynx({
      fetchBundle: async () => ({ code: 0, url: 'lynx-cache://failed' }),
      loadScript: async () => {
        expect(registry.get('remote')).toBe('lynx-cache://failed');
        throw new Error('evaluation failed');
      },
    });

    await expect(
      loadEntry(lynxRuntimePlugin(), bundleRemoteInfo),
    ).rejects.toThrow('evaluation failed');
    expect(Object.fromEntries(registry)).toEqual({
      remote: 'lynx-cache://previous',
      'remote:remote-origin': 'https://previous.test/remote.lynx.bundle',
      remote__main_thread: 'lynx-cache://previous',
    });
  });

  it('evicts timed-out entry loads so they can be retried', async () => {
    const container = {
      get: rs.fn(async () => () => ({ default: 'loaded' })),
      init: rs.fn(),
    };
    const requireModuleAsync = rs
      .fn<(entry: string, callback: NativeCallback) => void>()
      .mockImplementationOnce(() => undefined)
      .mockImplementationOnce((_entry, callback) => callback(null, container));
    setLynx({ requireModuleAsync });

    const federation = new ModuleFederation({
      name: 'lynx-retry-host',
      plugins: [lynxRuntimePlugin({ timeout: 5 })],
      remotes: [remoteInfo],
    });
    await expect(federation.loadRemote('remote/Card')).rejects.toThrow(
      'Timed out',
    );
    await expect(federation.loadRemote('remote/Card')).resolves.toEqual({
      default: 'loaded',
    });
    expect(requireModuleAsync).toHaveBeenCalledTimes(2);
  });

  it('isolates cached entries by global name and realm', async () => {
    const backgroundContainer = createContainer();
    const mainContainer = createContainer();
    const backgroundFetch = rs.fn(async () => ({
      code: 0,
      url: 'lynx-cache://background',
    }));
    setLynx({
      requireModuleAsync: () => undefined,
      fetchBundle: backgroundFetch,
      loadScript: () => backgroundContainer,
    });

    const plugin = lynxRuntimePlugin();
    const loadedBackground = await loadEntry(plugin, bundleRemoteInfo);
    loadedBackground.get('./Card');
    expect(backgroundContainer.get).toHaveBeenCalledWith('./Card');

    const mainFetch = rs.fn(async () => ({
      code: 0,
      url: 'lynx-cache://main',
    }));
    setLynx({
      fetchBundle: mainFetch,
      loadScript: () => mainContainer,
    });
    const loadedMain = await loadEntry(plugin, bundleRemoteInfo);
    loadedMain.get('./Card');
    expect(mainContainer.get).toHaveBeenCalledWith('./Card__main_thread');

    const alternateInfo = {
      ...bundleRemoteInfo,
      entryGlobalName: 'alternate',
    };
    await expect(loadEntry(plugin, alternateInfo)).resolves.toMatchObject({
      get: expect.any(Function),
      init: expect.any(Function),
    });
    expect(backgroundFetch).toHaveBeenCalledTimes(1);
    expect(mainFetch).toHaveBeenCalledTimes(2);
  });

  it('preserves every share scope for the active realm', async () => {
    const container = createContainer();
    setLynx({
      fetchBundle: async () => ({ code: 0, url: 'lynx-cache://remote' }),
      loadScript: () => container,
    });
    const loaded = await loadEntry(lynxRuntimePlugin(), bundleRemoteInfo);
    const scopes = {
      'default:react:background': { defaultBackground: true },
      'default:react:main-thread': { defaultMain: true },
      'custom:react:background': { customBackground: true },
      'custom:react:main-thread': { customMain: true },
    };

    loaded.init(scopes['default:react:main-thread'] as never, [], {
      version: 'test',
      shareScopeKeys: Object.keys(scopes),
      shareScopeMap: scopes as never,
    });

    expect(container.init).toHaveBeenCalledWith(
      scopes['default:react:main-thread'],
      [],
      expect.objectContaining({
        shareScopeKeys: [
          'default:react:main-thread',
          'custom:react:main-thread',
        ],
      }),
    );
  });

  it('filters custom DSL share-scope layers for each runtime realm', async () => {
    const backgroundContainer = createContainer();
    const mainContainer = createContainer();
    const plugin = lynxRuntimePlugin({
      realmLayers: {
        background: 'worker:realm',
        'main-thread': 'ui:realm',
      },
    });
    const scopes = {
      'default:react:worker:realm': { worker: true },
      'default:react:ui:realm': { ui: true },
    };
    const initOptions = {
      version: 'test',
      shareScopeKeys: Object.keys(scopes),
      shareScopeMap: scopes as never,
    };

    setLynx({
      fetchBundle: async () => ({ code: 0, url: 'lynx-cache://worker' }),
      getNativeApp: () => ({}),
      loadScript: () => backgroundContainer,
    });
    const background = await loadEntry(plugin, bundleRemoteInfo);
    background.init(scopes['default:react:worker:realm'] as never, [], {
      ...initOptions,
    });
    expect(backgroundContainer.init).toHaveBeenCalledWith(
      scopes['default:react:worker:realm'],
      [],
      expect.objectContaining({
        shareScopeKeys: 'default:react:worker:realm',
      }),
    );

    setLynx({
      fetchBundle: async () => ({ code: 0, url: 'lynx-cache://ui' }),
      loadScript: () => mainContainer,
    });
    const main = await loadEntry(plugin, bundleRemoteInfo);
    main.init(scopes['default:react:ui:realm'] as never, [], {
      ...initOptions,
    });
    expect(mainContainer.init).toHaveBeenCalledWith(
      scopes['default:react:ui:realm'],
      [],
      expect.objectContaining({
        shareScopeKeys: 'default:react:ui:realm',
      }),
    );
  });

  it('does not infer realm share scopes from array positions', async () => {
    const container = createContainer();
    setLynx({
      fetchBundle: async () => ({ code: 0, url: 'lynx-cache://remote' }),
      loadScript: () => container,
    });
    const loaded = await loadEntry(lynxRuntimePlugin(), bundleRemoteInfo);
    const shareScope = { shared: true };
    const options = {
      version: 'test',
      shareScopeKeys: ['default', 'custom'],
      shareScopeMap: {
        default: { defaultScope: true },
        custom: { customScope: true },
      },
    };

    loaded.init(shareScope as never, [], options as never);

    expect(container.init).toHaveBeenCalledWith(shareScope, [], options);
  });

  it('leaves non-Lynx remote types to the runtime-core loaders', () => {
    expect(
      loadEntry(lynxRuntimePlugin(), {
        ...remoteInfo,
        type: 'module',
      }),
    ).toBeUndefined();
  });

  it('leaves preload assets for non-Lynx remotes to other runtime plugins', async () => {
    const generatePreloadAssets = lynxRuntimePlugin().generatePreloadAssets!;
    await expect(
      generatePreloadAssets({
        remoteInfo: { ...remoteInfo, type: 'module' },
      } as GeneratePreloadAssetsArgs),
    ).resolves.toBeUndefined();
    await expect(
      generatePreloadAssets({
        remoteInfo: bundleRemoteInfo,
      } as GeneratePreloadAssetsArgs),
    ).resolves.toEqual({
      cssAssets: [],
      entryAssets: [],
      jsAssetsWithoutEntry: [],
    });
  });

  it('loads type lynx even when the bundle URL has an opaque suffix', async () => {
    const container = createContainer();
    const fetchBundle = rs.fn(async () => ({
      code: 0,
      url: 'lynx-cache://remote',
    }));
    setLynx({ fetchBundle, loadScript: () => container });

    await expect(
      loadEntry(lynxRuntimePlugin(), {
        ...bundleRemoteInfo,
        entry: 'https://example.test/artifact?id=remote',
        type: 'lynx',
      }),
    ).resolves.toMatchObject({
      get: expect.any(Function),
      init: expect.any(Function),
    });
    expect(fetchBundle).toHaveBeenCalledWith(
      'https://example.test/artifact?id=remote',
    );
  });
});
