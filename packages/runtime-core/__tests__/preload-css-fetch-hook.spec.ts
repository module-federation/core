import { describe, it, expect, rs, beforeEach, afterEach } from '@rstest/core';
import { loadModule } from '../src/utils/blobLoad';
import { preloadAssets } from '../src/utils/preload';

// Create a mocked fetch lifecycle loader hook
function createLoaderHook(hasFetchListener: boolean) {
  const listeners = new Set<any>();
  if (hasFetchListener) {
    listeners.add(() => undefined);
  }
  return {
    options: { inBrowser: true },
    loaderHook: {
      lifecycle: {
        fetch: { emit: rs.fn(), listeners },
        createLink: { emit: rs.fn() },
        createScript: { emit: rs.fn() },
      },
    },
  } as any;
}

// Create a mocked remote info
const createRemoteInfo = (name: string): any => ({
  name,
  entry: 'http://x/e.js',
  type: 'module',
  entryGlobalName: name,
  shareScope: 'default',
});

describe('preloadAssets CSS with fetch lifecycle loader hook', () => {
  let originalFetch: typeof globalThis.fetch;
  let originalCreateObjectURL: typeof URL.createObjectURL;
  let fetchMock: ReturnType<typeof rs.fn>;

  beforeEach(() => {
    rs.clearAllMocks();
    loadModule.clearCache();
    originalFetch = globalThis.fetch;
    originalCreateObjectURL = URL.createObjectURL;
    fetchMock = rs.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: () => Promise.resolve('.a{}'),
    });
    globalThis.fetch = fetchMock as any;
    URL.createObjectURL = rs.fn(() => 'blob:css');
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    URL.createObjectURL = originalCreateObjectURL;
  });

  it('uses the blob loader for manifest CSS when a fetch hook is registered', async () => {
    const host = createLoaderHook(true);
    const assets: any = {
      cssAssets: ['http://x/a.css'],
      jsAssetsWithoutEntry: [],
      entryAssets: [],
    };
    await preloadAssets(createRemoteInfo('a'), host, assets, false);
    expect(fetchMock).toHaveBeenCalledWith('http://x/a.css', expect.anything());
    // The loader's customFetch forwards remoteInfo and the resource context so
    // the plugin can add different headers per remote/resource.
    expect(host.loaderHook.lifecycle.fetch.emit).toHaveBeenCalledWith(
      'http://x/a.css',
      { headers: {} },
      expect.objectContaining({ name: 'a' }),
      expect.anything(),
    );
  });

  it('does NOT apply CSS through the blob loader during a preload hint (useLinkPreload)', async () => {
    const host = createLoaderHook(true);
    const assets: any = {
      cssAssets: ['http://x/a.css'],
      jsAssetsWithoutEntry: [],
      entryAssets: [],
    };
    // useLinkPreload defaults to true (preloadRemote). The blob loader injects a
    // rel=stylesheet that would apply the remote's CSS before it is loaded, so it
    // must be skipped here rather than overriding host styles.
    await preloadAssets(createRemoteInfo('a'), host, assets);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(host.loaderHook.lifecycle.fetch.emit).not.toHaveBeenCalled();
  });

  it('does NOT use the blob loader for manifest CSS when no fetch hook is registered', async () => {
    const host = createLoaderHook(false);
    const assets: any = {
      cssAssets: ['http://x/b.css'],
      jsAssetsWithoutEntry: [],
      entryAssets: [],
    };
    // We must fire the load event for the <link> created by createLink function,
    // this mimics the browser behavior and let the branch settle.
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) =>
        m.addedNodes.forEach((node) => {
          if (node instanceof HTMLLinkElement) {
            node.dispatchEvent(new Event('load'));
          }
        }),
      );
    });
    observer.observe(document.head, { childList: true });
    try {
      await preloadAssets(createRemoteInfo('b'), host, assets, false);
    } finally {
      observer.disconnect();
    }
    expect(fetchMock).not.toHaveBeenCalled();
    expect(host.loaderHook.lifecycle.fetch.emit).not.toHaveBeenCalled();
  });
});
