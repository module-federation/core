import type { ModuleInfo } from '@module-federation/sdk';
import { describe, it, rs } from '@rstest/core';
import { ModuleFederation } from '../src/core';
import { Global, setPreloadedAsset } from '../src/global';
import type { RemoteInfo } from '../src/type';
import type {
  ResourceLoadContext,
  ResourceLoadInitiator,
} from '../src/type/preload';
import type { ModuleFederationRuntimePlugin } from '../src/type/plugin';
import { preloadAssets } from '../src/utils/preload';

type ResourceCall = {
  url: string;
  attrs: Record<string, unknown>;
  remoteInfo: RemoteInfo;
  resourceContext?: ResourceLoadContext;
};

type ResourceCalls = {
  links: ResourceCall[];
  scripts: ResourceCall[];
};

function createResourceCalls(): ResourceCalls {
  return { links: [], scripts: [] };
}

function completeLoadWhenHandlerIsAttached(element: HTMLElement): void {
  let onload: GlobalEventHandlers['onload'] | null = null;
  Object.defineProperty(element, 'onload', {
    configurable: true,
    get() {
      return onload;
    },
    set(handler: GlobalEventHandlers['onload'] | null) {
      onload = handler;
      if (handler) {
        queueMicrotask(() => handler.call(element, new Event('load')));
      }
    },
  });
}

function applyAttrs(
  element: HTMLElement,
  attrs: Record<string, unknown>,
): void {
  Object.entries(attrs).forEach(([name, value]) => {
    element.setAttribute(name, String(value));
  });
}

function createResourceCapturePlugin(
  calls: ResourceCalls,
): ModuleFederationRuntimePlugin {
  return {
    name: 'capture-preload-resources',
    beforeInit(args) {
      args.options.inBrowser = true;
      return args;
    },
    createLink({ url, attrs = {}, remoteInfo, resourceContext }) {
      calls.links.push({ url, attrs, remoteInfo, resourceContext });
      const link = document.createElement('link');
      link.href = url;
      applyAttrs(link, attrs);
      completeLoadWhenHandlerIsAttached(link);
      return link;
    },
    createScript({ url, attrs = {}, remoteInfo, resourceContext }) {
      calls.scripts.push({ url, attrs, remoteInfo, resourceContext });
      const script = document.createElement('script');
      script.src = url;
      applyAttrs(script, attrs);
      completeLoadWhenHandlerIsAttached(script);
      return script;
    },
  };
}

function createHost(calls: ResourceCalls): ModuleFederation {
  return new ModuleFederation({
    name: 'preload-assets-host',
    plugins: [createResourceCapturePlugin(calls)],
  });
}

function createRemoteInfo(type: RemoteInfo['type']): RemoteInfo {
  return {
    name: 'preload-assets-remote',
    entry: 'https://remote.test/remoteEntry.js',
    type,
    entryGlobalName: 'preload_assets_remote',
    shareScope: 'default',
  };
}

async function runPreload({
  type,
  cssAssets = [],
  jsAssetsWithoutEntry = [],
  useLinkPreload = false,
  initiator = 'loadRemote',
}: {
  type: RemoteInfo['type'];
  cssAssets?: string[];
  jsAssetsWithoutEntry?: string[];
  useLinkPreload?: boolean;
  initiator?: ResourceLoadInitiator;
}): Promise<ResourceCalls> {
  const calls = createResourceCalls();
  const host = createHost(calls);

  await preloadAssets(
    createRemoteInfo(type),
    host,
    {
      cssAssets,
      jsAssetsWithoutEntry,
      entryAssets: [],
    },
    useLinkPreload,
    {
      initiator,
      id: 'preload-assets-remote/Expose',
    },
  );

  return calls;
}

describe('preloadAssets', () => {
  it.each(['module', 'esm'] as const)(
    'preloads %s chunks without executing them during loadRemote',
    async (type) => {
      const moduleUrl = 'https://remote.test/expose.js';
      const calls = await runPreload({
        type,
        jsAssetsWithoutEntry: [moduleUrl],
      });

      expect(calls.scripts).toHaveLength(0);
      expect(calls.links).toHaveLength(1);
      expect(calls.links[0]).toMatchObject({
        url: moduleUrl,
        attrs: {
          rel: 'modulepreload',
          fetchpriority: 'high',
        },
        remoteInfo: {
          name: 'preload-assets-remote',
          type,
        },
        resourceContext: {
          initiator: 'loadRemote',
          id: 'preload-assets-remote/Expose',
          resourceType: 'js',
          url: moduleUrl,
        },
      });
    },
  );

  it('keeps module chunks non-executing through loadRemote initialization', async () => {
    const remoteName = 'preload-assets-integration-remote';
    const moduleUrl = 'https://remote.test/expose.js';
    const calls = createResourceCalls();
    const lifecycle: string[] = [];
    let automaticPreloadDefault: boolean | undefined;
    let automaticPreloadArgs:
      | Parameters<
          NonNullable<ModuleFederationRuntimePlugin['beforePreloadRemote']>
        >[0]
      | undefined;
    const remoteSnapshot: ModuleInfo = {
      version: '1.0.0',
      buildVersion: '',
      remoteEntry: 'https://remote.test/remoteEntry.js',
      remoteEntryType: 'module',
      remoteTypes: '',
      remoteTypesZip: '',
      globalName: remoteName,
      publicPath: 'https://remote.test/',
      remotesInfo: {},
      shared: [],
      modules: [],
    };

    const host = new ModuleFederation({
      name: 'preload-assets-integration-host',
      remotes: [
        {
          name: remoteName,
          entry: 'https://remote.test/mf-manifest.json',
        },
      ],
      plugins: [
        createResourceCapturePlugin(calls),
        {
          name: 'capture-container-initialization',
          beforePreloadRemote(args) {
            automaticPreloadArgs = args;
            automaticPreloadDefault = args.preloadOps[0].recordPreloadedAssets;
            args.preloadOps[0].recordPreloadedAssets = false;
          },
          loadEntry() {
            return {
              init() {
                lifecycle.push('init');
              },
              get() {
                lifecycle.push('get');
                return () => Promise.resolve('loaded');
              },
            };
          },
        },
      ],
    });

    rs.spyOn(host.snapshotHandler, 'loadRemoteSnapshotInfo').mockResolvedValue({
      remoteSnapshot,
      globalSnapshot: {},
    });
    rs.spyOn(
      host.remoteHandler.hooks.lifecycle.generatePreloadAssets,
      'emit',
    ).mockImplementation(async ({ preloadOptions }) => {
      expect(preloadOptions.preloadConfig.recordPreloadedAssets).toBe(false);
      return {
        cssAssets: [],
        jsAssetsWithoutEntry: [moduleUrl],
        entryAssets: [],
      };
    });

    await expect(host.loadRemote<string>(`${remoteName}/Expose`)).resolves.toBe(
      'loaded',
    );

    expect(lifecycle).toEqual(['init', 'get']);
    expect(automaticPreloadDefault).toBe(true);
    expect(automaticPreloadArgs).toMatchObject({
      preloadOps: [
        {
          nameOrAlias: remoteName,
          exposes: ['./Expose'],
          resourceCategory: 'sync',
          share: false,
          depsRemote: false,
          recordPreloadedAssets: false,
        },
      ],
      options: host.options,
      origin: host,
    });
    expect(calls.scripts).toHaveLength(0);
    expect(calls.links).toHaveLength(1);
    expect(calls.links[0]).toMatchObject({
      url: moduleUrl,
      attrs: {
        rel: 'modulepreload',
        fetchpriority: 'high',
      },
      remoteInfo: {
        name: remoteName,
        type: 'module',
      },
      resourceContext: {
        initiator: 'loadRemote',
        id: `${remoteName}/Expose`,
        resourceType: 'js',
        url: moduleUrl,
      },
    });
    expect(Global.__FEDERATION__.__PRELOADED_ASSETS__.has(moduleUrl)).toBe(
      false,
    );
  });

  it('keeps executing classic chunks during loadRemote', async () => {
    const scriptUrl = 'https://remote.test/expose.js';
    const calls = await runPreload({
      type: 'global',
      jsAssetsWithoutEntry: [scriptUrl],
    });

    expect(calls.links).toHaveLength(0);
    expect(calls.scripts).toHaveLength(1);
    expect(calls.scripts[0]).toMatchObject({
      url: scriptUrl,
      attrs: {
        fetchpriority: 'high',
        type: 'text/javascript',
      },
      resourceContext: {
        initiator: 'loadRemote',
        id: 'preload-assets-remote/Expose',
        resourceType: 'js',
        url: scriptUrl,
      },
    });
  });

  it('keeps applying stylesheets during loadRemote', async () => {
    const stylesheetUrl = 'https://remote.test/expose.css';
    const calls = await runPreload({
      type: 'module',
      cssAssets: [stylesheetUrl],
    });

    expect(calls.scripts).toHaveLength(0);
    expect(calls.links).toHaveLength(1);
    expect(calls.links[0]).toMatchObject({
      url: stylesheetUrl,
      attrs: {
        rel: 'stylesheet',
        type: 'text/css',
      },
      resourceContext: {
        initiator: 'loadRemote',
        id: 'preload-assets-remote/Expose',
        resourceType: 'css',
        url: stylesheetUrl,
      },
    });

    const attachedStylesheet = Array.from(
      document.head.querySelectorAll('link'),
    ).find((link) => link.href === stylesheetUrl);
    expect(attachedStylesheet).toBeDefined();
    attachedStylesheet?.remove();
  });

  it('keeps explicit preloadRemote chunks as preload links', async () => {
    const scriptUrl = 'https://remote.test/expose.js';
    const calls = await runPreload({
      type: 'module',
      jsAssetsWithoutEntry: [scriptUrl],
      useLinkPreload: true,
      initiator: 'preloadRemote',
    });

    expect(calls.scripts).toHaveLength(0);
    expect(calls.links).toHaveLength(1);
    expect(calls.links[0]).toMatchObject({
      url: scriptUrl,
      attrs: {
        rel: 'preload',
        as: 'script',
      },
      resourceContext: {
        initiator: 'preloadRemote',
        id: 'preload-assets-remote/Expose',
        resourceType: 'js',
        url: scriptUrl,
      },
    });
  });

  it('skips loading and loaded preload asset URLs without changing tag cleanup', async () => {
    const moduleUrl = 'https://remote.test/deduplicated-expose.js';
    const calls = createResourceCalls();
    const host = createHost(calls);
    const assets = {
      cssAssets: [],
      jsAssetsWithoutEntry: [moduleUrl],
      entryAssets: [],
    };
    const context = {
      initiator: 'preloadRemote' as const,
      id: 'preload-assets-remote/DeduplicatedExpose',
    };

    const loadingResults = preloadAssets(
      createRemoteInfo('module'),
      host,
      assets,
      true,
      context,
    );
    const duplicateLoadingResults = await preloadAssets(
      createRemoteInfo('module'),
      host,
      assets,
      true,
      context,
    );

    expect(duplicateLoadingResults).toMatchObject([
      {
        url: moduleUrl,
        status: 'cached',
        resourceType: 'js',
      },
    ]);
    expect(calls.links).toHaveLength(1);
    expect(Global.__FEDERATION__.__PRELOADED_ASSETS__.has(moduleUrl)).toBe(
      true,
    );

    await expect(loadingResults).resolves.toMatchObject([
      {
        url: moduleUrl,
        status: 'success',
        resourceType: 'js',
      },
    ]);
    await expect(
      preloadAssets(createRemoteInfo('module'), host, assets, true, context),
    ).resolves.toMatchObject([
      {
        url: moduleUrl,
        status: 'cached',
        resourceType: 'js',
      },
    ]);

    expect(calls.links).toHaveLength(1);
    expect(
      Array.from(document.head.querySelectorAll('link')).some(
        (link) => link.href === moduleUrl,
      ),
    ).toBe(false);
  });

  it('loads duplicate assets without recording their URLs when disabled', async () => {
    const moduleUrl = 'https://remote.test/unrecorded-expose.js';
    const calls = createResourceCalls();
    const host = createHost(calls);
    const assets = {
      cssAssets: [],
      jsAssetsWithoutEntry: [moduleUrl],
      entryAssets: [],
    };
    const context = {
      initiator: 'preloadRemote' as const,
      id: 'preload-assets-remote/UnrecordedExpose',
    };

    await preloadAssets(
      createRemoteInfo('module'),
      host,
      assets,
      true,
      context,
      false,
    );
    await preloadAssets(
      createRemoteInfo('module'),
      host,
      assets,
      true,
      context,
      false,
    );

    expect(calls.links).toHaveLength(2);
    expect(Global.__FEDERATION__.__PRELOADED_ASSETS__.has(moduleUrl)).toBe(
      false,
    );
  });

  it('evicts the oldest preload asset URL when the cache reaches its limit', () => {
    const maximumPreloadedAssets = 2000;
    const urls = Array.from(
      { length: maximumPreloadedAssets + 1 },
      (_, index) => `https://remote.test/preloaded-asset-${index}.js`,
    );

    urls.forEach(setPreloadedAsset);

    const preloadedAssets = Global.__FEDERATION__.__PRELOADED_ASSETS__;
    expect(preloadedAssets.size).toBe(maximumPreloadedAssets);
    expect(preloadedAssets.has(urls[0])).toBe(false);
    expect(preloadedAssets.has(urls[1])).toBe(true);
    expect(preloadedAssets.has(urls[urls.length - 1])).toBe(true);
  });
});
