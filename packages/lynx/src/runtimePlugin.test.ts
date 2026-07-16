import { afterEach, describe, expect, it, rs } from '@rstest/core';
import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime-core/types';

import lynxRuntimePlugin, {
  LYNX_BUNDLE_REGISTRY,
  patchLynxChunkLoading,
  type LynxWebpackRequire,
} from './runtimePlugin';

type NativeCallback = (error: unknown, value: unknown) => void;

interface TestLynx {
  fetchBundle?(entry: string): PromiseLike<unknown>;
  getNativeApp?(): unknown;
  loadScript?(sectionPath: string, options: { bundleName: string }): unknown;
  requireModuleAsync?(entry: string, callback: NativeCallback): void;
}

type LoadEntryArgs = Parameters<
  NonNullable<ModuleFederationRuntimePlugin['loadEntry']>
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
  delete globalRecord[LYNX_BUNDLE_REGISTRY];
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
    (globalThis as unknown as Record<string, unknown>).remote = {
      default: globalContainer,
    };
    setLynx({
      requireModuleAsync: (_entry, callback) => callback(null, undefined),
    });
    await expect(loadEntry(lynxRuntimePlugin())).resolves.toBe(globalContainer);
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
    const fetchBundle = rs.fn(async () => ({
      code: 0,
      url: 'lynx-cache://remote',
    }));
    const loadScript = rs.fn(async () => container);
    setLynx({
      fetchBundle,
      getNativeApp: () => ({}),
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
    expect(
      (
        globalThis as unknown as Record<
          PropertyKey,
          Map<string, string> | undefined
        >
      )[LYNX_BUNDLE_REGISTRY]?.get('remote'),
    ).toBe('lynx-cache://remote');
  });

  it('loads bundle entries from the main-thread section', async () => {
    const container = createContainer();
    const loadScript = rs.fn(() => ({ default: container }));
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

  it('reports unsuccessful bundle fetches', async () => {
    const loadScript = rs.fn();
    setLynx({
      fetchBundle: async () => ({
        code: -1,
        url: 'https://example.test/remote.lynx.bundle',
        errorMsg: 'not found',
      }),
      loadScript,
    });

    await expect(
      loadEntry(lynxRuntimePlugin(), bundleRemoteInfo),
    ).rejects.toThrow('code -1: not found');
    expect(loadScript).not.toHaveBeenCalled();
  });

  it('reports native snake-case bundle errors', async () => {
    const loadScript = rs.fn();
    setLynx({
      fetchBundle: async () => ({
        code: -2,
        url: 'https://example.test/remote.lynx.bundle',
        error_msg: 'decode failed',
      }),
      loadScript,
    });

    await expect(
      loadEntry(lynxRuntimePlugin(), bundleRemoteInfo),
    ).rejects.toThrow('code -2: decode failed');
    expect(loadScript).not.toHaveBeenCalled();
  });

  it('evicts timed-out entry loads so they can be retried', async () => {
    const container = createContainer();
    const requireModuleAsync = rs
      .fn<(entry: string, callback: NativeCallback) => void>()
      .mockImplementationOnce(() => undefined)
      .mockImplementationOnce((_entry, callback) => callback(null, container));
    setLynx({ requireModuleAsync });

    const plugin = lynxRuntimePlugin({ timeout: 5 });
    await expect(loadEntry(plugin)).rejects.toThrow('Timed out');
    await expect(loadEntry(plugin)).resolves.toBe(container);
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

  it('leaves non-Lynx remote types to the runtime-core loaders', () => {
    expect(
      loadEntry(lynxRuntimePlugin(), {
        ...remoteInfo,
        type: 'module',
      }),
    ).toBeUndefined();
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

describe('patchLynxChunkLoading', () => {
  const createWebpackRequire = (
    filename = 'chunks/feature.js?cache=1#fragment',
  ): LynxWebpackRequire => ({
    f: {},
    m: {},
    u: rs.fn(() => filename),
  });

  it('installs and deduplicates section chunks', async () => {
    const webpackRequire = createWebpackRequire();
    const factory = rs.fn();
    const runtime = rs.fn();
    const nestedPromises: Promise<unknown>[] = [];
    const loadScript = rs.fn(() => {
      webpackRequire.f.j!('feature', nestedPromises);
      return {
        ids: ['feature'],
        modules: { factory },
        runtime,
      };
    });
    const globalObject = {
      lynx: { requireModuleAsync: () => undefined, loadScript },
      [LYNX_BUNDLE_REGISTRY]: new Map([['remote', 'lynx-cache://remote']]),
    };

    expect(patchLynxChunkLoading(webpackRequire, 'remote', globalObject)).toBe(
      true,
    );
    const promises: Promise<unknown>[] = [];
    webpackRequire.f.j!('feature', promises);

    expect(loadScript).toHaveBeenCalledTimes(1);
    expect(loadScript).toHaveBeenCalledWith('chunks/feature', {
      bundleName: 'lynx-cache://remote',
    });
    expect(nestedPromises[0]).toBe(promises[0]);
    await expect(Promise.all(promises)).resolves.toBeDefined();
    expect(webpackRequire.m.factory).toBe(factory);
    expect(runtime).toHaveBeenCalledWith(webpackRequire);
  });

  it('loads split remote chunks as independently fetched Lynx lazy bundles', async () => {
    const webpackRequire = createWebpackRequire();
    webpackRequire.lynx_aci = {
      feature: 'async/catalog__background_Card.123.bundle',
    };
    webpackRequire.p = '/remote-assets/';
    const factory = rs.fn();
    const loadScript = rs.fn();
    const loadLazyBundle = rs.fn(async () => ({
      ids: ['feature'],
      modules: { factory },
    }));
    const globalObject = {
      lynx: { loadLazyBundle, loadScript },
      [LYNX_BUNDLE_REGISTRY]: new Map([
        ['remote', 'https://cdn.example/cache/catalog.lynx.bundle'],
        [
          'remote:remote-origin',
          'https://cdn.example/remotes/catalog.lynx.bundle',
        ],
      ]),
    };

    patchLynxChunkLoading(webpackRequire, 'remote', globalObject);
    const promises: Promise<unknown>[] = [];
    webpackRequire.f.j!('feature', promises);

    await expect(Promise.all(promises)).resolves.toBeDefined();
    expect(loadLazyBundle).toHaveBeenCalledWith(
      'https://cdn.example/remote-assets/async/catalog__background_Card.123.bundle',
    );
    expect(loadScript).not.toHaveBeenCalled();
    expect(webpackRequire.m.factory).toBe(factory);
  });

  it('preserves protocol-relative lazy bundle and public-path URLs', async () => {
    const loadLazyBundle = rs.fn(async () => ({
      ids: ['feature'],
      modules: {},
    }));
    const globalObject = {
      lynx: { loadLazyBundle, loadScript: rs.fn() },
      [LYNX_BUNDLE_REGISTRY]: new Map([
        ['remote', 'https://origin.example/catalog.lynx.bundle'],
        ['remote:remote-origin', 'https://origin.example/catalog.lynx.bundle'],
      ]),
    };
    const publicPathRequire = createWebpackRequire();
    publicPathRequire.lynx_aci = { feature: 'async/Card.bundle' };
    publicPathRequire.p = '//cdn.example/assets/';
    patchLynxChunkLoading(publicPathRequire, 'remote', globalObject);
    const publicPathPromises: Promise<unknown>[] = [];
    publicPathRequire.f.j!('feature', publicPathPromises);
    await Promise.all(publicPathPromises);

    const assetRequire = createWebpackRequire();
    assetRequire.lynx_aci = {
      feature: '//assets.example/chunks/Card.bundle',
    };
    patchLynxChunkLoading(assetRequire, 'remote', globalObject);
    const assetPromises: Promise<unknown>[] = [];
    assetRequire.f.j!('feature', assetPromises);
    await Promise.all(assetPromises);

    expect(loadLazyBundle).toHaveBeenNthCalledWith(
      1,
      '//cdn.example/assets/async/Card.bundle',
    );
    expect(loadLazyBundle).toHaveBeenNthCalledWith(
      2,
      '//assets.example/chunks/Card.bundle',
    );
  });

  it('restores the lazy-bundle identity while deferred module factories execute', async () => {
    const webpackRequire = createWebpackRequire();
    webpackRequire.lynx_aci = { feature: 'async/Card.bundle' };
    const observedEntries: unknown[] = [];
    const factory = rs.fn(() => {
      observedEntries.push(globalObject.globDynamicComponentEntry);
    });
    const globalObject: any = {
      globDynamicComponentEntry: '__Card__',
      lynx: {
        loadLazyBundle: async () => ({
          __lynx_dynamic_component_entry__: 'https://cdn.example/Card.bundle',
          ids: ['feature'],
          modules: { factory },
        }),
        loadScript: rs.fn(),
      },
      [LYNX_BUNDLE_REGISTRY]: new Map([
        ['remote', 'lynx-cache://catalog'],
        ['remote:remote-origin', 'https://cdn.example/catalog.lynx.bundle'],
      ]),
    };

    patchLynxChunkLoading(webpackRequire, 'remote', globalObject);
    const promises: Promise<unknown>[] = [];
    webpackRequire.f.j!('feature', promises);
    await Promise.all(promises);
    (
      webpackRequire.m.factory as (
        module: unknown,
        exports: unknown,
        require: unknown,
      ) => unknown
    )({}, {}, webpackRequire);

    expect(observedEntries).toEqual(['https://cdn.example/Card.bundle']);
    expect(globalObject.globDynamicComponentEntry).toBe('__Card__');
  });

  it('loads atomic chunks from sections in the already-fetched container', async () => {
    const webpackRequire = createWebpackRequire(
      'async/catalog__background_Card.js',
    );
    webpackRequire.lynx_aci = { feature: 'async/Card.bundle' };
    webpackRequire.lynx_chunking = 'single';
    const factory = rs.fn();
    const loadLazyBundle = rs.fn();
    const loadScript = rs.fn(() => ({
      ids: ['feature'],
      modules: { factory },
    }));
    const globalObject = {
      lynx: { loadLazyBundle, loadScript, requireModuleAsync: rs.fn() },
      [LYNX_BUNDLE_REGISTRY]: new Map([['remote', 'lynx-cache://catalog']]),
    };

    patchLynxChunkLoading(webpackRequire, 'remote', globalObject);
    const promises: Promise<unknown>[] = [];
    webpackRequire.f.j!('feature', promises);
    await Promise.all(promises);

    expect(loadLazyBundle).not.toHaveBeenCalled();
    expect(loadScript).toHaveBeenCalledWith('async/catalog__background_Card', {
      bundleName: 'lynx-cache://catalog',
    });
  });

  it('uses the official lazy-bundle API for split chunks', async () => {
    const webpackRequire = createWebpackRequire();
    webpackRequire.lynx_aci = { feature: 'async/Card.bundle' };
    const factory = rs.fn();
    const fetchBundle = rs.fn(async () => ({
      code: 0,
      url: 'lynx-cache://Card',
    }));
    const loadLazyBundle = rs.fn(async () => ({
      ids: ['feature'],
      modules: { factory },
    }));
    const loadScript = rs.fn(() => ({
      ids: ['feature'],
      modules: { factory },
    }));
    const globalObject = {
      lynx: {
        fetchBundle,
        loadLazyBundle,
        loadScript,
        requireModuleAsync: rs.fn(),
      },
      [LYNX_BUNDLE_REGISTRY]: new Map([
        ['remote', 'lynx-cache://catalog'],
        [
          'remote:remote-origin',
          'https://cdn.example/remotes/catalog.lynx.bundle',
        ],
      ]),
    };

    patchLynxChunkLoading(webpackRequire, 'remote', globalObject);
    const promises: Promise<unknown>[] = [];
    webpackRequire.f.j!('feature', promises);
    await Promise.all(promises);

    expect(loadLazyBundle).toHaveBeenCalledWith(
      'https://cdn.example/remotes/async/Card.bundle',
    );
    expect(fetchBundle).not.toHaveBeenCalled();
    expect(loadScript).not.toHaveBeenCalled();
    expect(webpackRequire.m.factory).toBe(factory);
  });

  it('times out split chunks and permits retry', async () => {
    const webpackRequire = createWebpackRequire();
    webpackRequire.lynx_aci = { feature: 'async/Card.bundle' };
    const loadLazyBundle = rs.fn(() => new Promise<unknown>(() => undefined));
    const globalObject = {
      lynx: { loadLazyBundle, loadScript: rs.fn() },
      [LYNX_BUNDLE_REGISTRY]: new Map([
        ['remote', 'lynx-cache://catalog'],
        [
          'remote:remote-origin',
          'https://cdn.example/remotes/catalog.lynx.bundle',
        ],
      ]),
    };

    patchLynxChunkLoading(webpackRequire, 'remote', globalObject, 5);
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const promises: Promise<unknown>[] = [];
      webpackRequire.f.j!('feature', promises);
      await expect(Promise.all(promises)).rejects.toThrow(
        'Timed out loading Lynx lazy bundle',
      );
    }
    expect(loadLazyBundle).toHaveBeenCalledTimes(2);
  });

  it('rejects split chunks when no DynamicComponent API exists', async () => {
    const webpackRequire = createWebpackRequire();
    webpackRequire.lynx_aci = { feature: 'async/Card.bundle' };
    const fetchBundle = rs.fn(async () => ({
      code: 0,
      url: 'lynx-cache://Card',
    }));
    const loadScript = rs.fn();
    const globalObject = {
      lynx: { fetchBundle, loadScript, requireModuleAsync: rs.fn() },
      [LYNX_BUNDLE_REGISTRY]: new Map([
        ['remote', 'lynx-cache://catalog'],
        [
          'remote:remote-origin',
          'https://cdn.example/remotes/catalog.lynx.bundle',
        ],
      ]),
    };

    patchLynxChunkLoading(webpackRequire, 'remote', globalObject);
    const promises: Promise<unknown>[] = [];
    webpackRequire.f.j!('feature', promises);
    await expect(Promise.all(promises)).rejects.toThrow(
      'requires QueryComponent and getDynamicComponentExports',
    );

    expect(fetchBundle).not.toHaveBeenCalled();
    expect(loadScript).not.toHaveBeenCalled();
  });

  it('loads split chunks through QueryComponent when loadLazyBundle is unavailable', async () => {
    const webpackRequire = createWebpackRequire();
    webpackRequire.lynx_aci = {
      feature: 'async/Card.123.bundle',
    };
    const factory = rs.fn();
    const chunk = {
      ids: ['feature'],
      modules: { factory },
    };
    const QueryComponent = rs.fn((_source, callback) =>
      callback({ code: 0, detail: { schema: 'Card' } }),
    );
    const loadScript = rs.fn();
    const globalObject = {
      lynx: {
        loadScript,
        QueryComponent,
        requireModuleAsync: rs.fn(),
      },
      lynxCoreInject: {
        tt: { getDynamicComponentExports: () => chunk },
      },
      [LYNX_BUNDLE_REGISTRY]: new Map([
        ['remote', 'lynx-cache://catalog'],
        [
          'remote:remote-origin',
          'https://cdn.example/remotes/catalog.lynx.bundle',
        ],
      ]),
    };

    patchLynxChunkLoading(webpackRequire, 'remote', globalObject);
    const promises: Promise<unknown>[] = [];
    webpackRequire.f.j!('feature', promises);
    await Promise.all(promises);

    expect(QueryComponent).toHaveBeenCalledWith(
      'https://cdn.example/remotes/async/Card.123.bundle',
      expect.any(Function),
    );
    expect(loadScript).not.toHaveBeenCalled();
    expect(webpackRequire.m.factory).toBe(factory);
  });

  it('loads main-thread split chunks through the asynchronous Web QueryComponent API', async () => {
    const webpackRequire = createWebpackRequire();
    webpackRequire.lynx_aci = { feature: 'async/Card.bundle' };
    const factory = rs.fn();
    const chunk = { ids: ['feature'], modules: { factory } };
    const queryComponent = rs.fn((_source, callback) => {
      queueMicrotask(() =>
        callback({
          code: 0,
          data: { evalResult: chunk, url: 'https://cdn.example/Card.bundle' },
        }),
      );
      return null;
    });
    const globalObject = {
      __QueryComponent: queryComponent,
      lynx: { loadScript: rs.fn() },
      [LYNX_BUNDLE_REGISTRY]: new Map([
        ['remote', 'lynx-cache://catalog'],
        [
          'remote:remote-origin',
          'https://cdn.example/remotes/catalog.lynx.bundle',
        ],
      ]),
    };

    patchLynxChunkLoading(webpackRequire, 'remote', globalObject);
    const promises: Promise<unknown>[] = [];
    webpackRequire.f.j!('feature', promises);
    await Promise.all(promises);

    expect(queryComponent).toHaveBeenCalledWith(
      'https://cdn.example/remotes/async/Card.bundle',
      expect.any(Function),
    );
    expect(webpackRequire.m.factory).toBe(factory);
  });

  it.each([
    [
      undefined,
      'async/Card.bundle',
      'https://cdn.example/remotes/async/Card.bundle',
    ],
    [
      'auto',
      'async/Card.bundle',
      'https://cdn.example/remotes/async/Card.bundle',
    ],
    ['/', 'async/Card.bundle', 'https://cdn.example/remotes/async/Card.bundle'],
    [
      'assets/',
      'async/Card.bundle',
      'https://cdn.example/remotes/assets/async/Card.bundle',
    ],
    ['/v2/', 'async/Card.bundle', 'https://cdn.example/v2/async/Card.bundle'],
    [
      'https://assets.example/v3/',
      'async/Card.bundle',
      'https://assets.example/v3/async/Card.bundle',
    ],
    [
      '/ignored/',
      'https://assets.example/Card.bundle',
      'https://assets.example/Card.bundle',
    ],
  ])(
    'resolves split public path %s against the manifest entry',
    async (publicPath, assetPath, expected) => {
      const webpackRequire = createWebpackRequire();
      webpackRequire.lynx_aci = { feature: assetPath };
      webpackRequire.p = publicPath;
      const loadLazyBundle = rs.fn(async () => ({
        ids: ['feature'],
        modules: {},
      }));
      const globalObject = {
        lynx: { loadLazyBundle, loadScript: rs.fn() },
        [LYNX_BUNDLE_REGISTRY]: new Map([
          ['remote', 'lynx-cache://catalog'],
          [
            'remote:remote-origin',
            'https://cdn.example/remotes/catalog.lynx.bundle?version=1',
          ],
        ]),
      };

      patchLynxChunkLoading(webpackRequire, 'remote', globalObject);
      const promises: Promise<unknown>[] = [];
      webpackRequire.f.j!('feature', promises);
      await Promise.all(promises);

      expect(loadLazyBundle).toHaveBeenCalledWith(expected);
    },
  );

  it('preserves the original chunk handler without a registered bundle', () => {
    const originalHandler = rs.fn();
    const webpackRequire = createWebpackRequire();
    webpackRequire.f.j = originalHandler;
    const globalObject = {
      lynx: { loadScript: rs.fn() },
      [LYNX_BUNDLE_REGISTRY]: new Map<string, string>(),
    };

    expect(patchLynxChunkLoading(webpackRequire, 'remote', globalObject)).toBe(
      false,
    );
    const promises: Promise<unknown>[] = [];
    webpackRequire.f.j('feature', promises);
    expect(originalHandler).toHaveBeenCalledWith('feature', promises);
  });

  it('evicts failed section loads so they can be retried', async () => {
    const webpackRequire = createWebpackRequire('feature.js');
    const loadScript = rs
      .fn<(sectionPath: string, options: { bundleName: string }) => unknown>()
      .mockImplementationOnce(() => {
        throw new Error('decode failed');
      })
      .mockImplementationOnce(() => ({
        ids: ['feature'],
        modules: {},
      }));
    const globalObject = {
      lynx: { loadScript },
      [LYNX_BUNDLE_REGISTRY]: new Map([
        ['remote__main_thread', 'lynx-cache://remote'],
      ]),
    };
    patchLynxChunkLoading(webpackRequire, 'remote', globalObject);

    const failedPromises: Promise<unknown>[] = [];
    webpackRequire.f.j!('feature', failedPromises);
    await expect(Promise.all(failedPromises)).rejects.toThrow('decode failed');

    const retriedPromises: Promise<unknown>[] = [];
    webpackRequire.f.j!('feature', retriedPromises);
    await expect(Promise.all(retriedPromises)).resolves.toBeDefined();
    expect(loadScript).toHaveBeenCalledTimes(2);
  });

  it('uses the main-thread container name without appending the realm twice', async () => {
    const webpackRequire = createWebpackRequire('feature.js');
    const loadScript = rs.fn(() => ({
      ids: ['feature'],
      modules: {},
    }));
    const globalObject = {
      lynx: { loadScript },
      [LYNX_BUNDLE_REGISTRY]: new Map([
        ['remote__main_thread', 'lynx-cache://remote'],
      ]),
    };

    expect(
      patchLynxChunkLoading(
        webpackRequire,
        'remote__main_thread',
        globalObject,
      ),
    ).toBe(true);

    const promises: Promise<unknown>[] = [];
    webpackRequire.f.j!('feature', promises);
    await expect(Promise.all(promises)).resolves.toBeDefined();
    expect(loadScript).toHaveBeenCalledWith('feature', {
      bundleName: 'lynx-cache://remote',
    });
  });

  it('replaces the Lynx require chunk handler emitted by Rspeedy', async () => {
    const webpackRequire = createWebpackRequire('feature.js');
    const originalHandler = rs.fn();
    webpackRequire.f.require = originalHandler;
    const loadScript = rs.fn(() => ({
      ids: ['feature'],
      modules: {},
    }));
    const globalObject = {
      lynx: { requireModuleAsync: rs.fn(), loadScript },
      [LYNX_BUNDLE_REGISTRY]: new Map([['remote', 'lynx-cache://remote']]),
    };

    patchLynxChunkLoading(webpackRequire, 'remote', globalObject);
    const promises: Promise<unknown>[] = [];
    webpackRequire.f.require!('feature', promises);

    await expect(Promise.all(promises)).resolves.toBeDefined();
    expect(loadScript).toHaveBeenCalledWith('feature', {
      bundleName: 'lynx-cache://remote',
    });
    expect(originalHandler).not.toHaveBeenCalled();
  });
});
