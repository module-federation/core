import { afterEach, describe, expect, it, rs } from '@rstest/core';
import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime-core/types';

import lynxRuntimePlugin, { LYNX_BUNDLE_REGISTRY } from './runtimePlugin';

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
