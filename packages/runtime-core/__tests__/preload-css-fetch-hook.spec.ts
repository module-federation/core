import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as sdk from '@module-federation/sdk';
import { preloadAssets } from '../src/utils/preload';

// Build a host whose fetch lifecycle exposes a real `listeners` Set so
// preload.ts can gate the blob loader on `listeners.size`.
function createHost(hasFetchListener: boolean): any {
  const fetchListeners = new Set<any>();
  if (hasFetchListener) {
    fetchListeners.add(() => undefined);
  }
  return {
    options: { inBrowser: true },
    loaderHook: {
      lifecycle: {
        fetch: { emit: vi.fn(), listeners: fetchListeners },
        createLink: { emit: vi.fn() },
        createScript: { emit: vi.fn() },
      },
    },
  };
}

const remoteInfo = (name: string): any => ({
  name,
  entry: 'http://x/e.js',
  type: 'module',
  entryGlobalName: name,
  shareScope: 'default',
});

describe('preloadAssets CSS with a fetch hook', () => {
  let spy: any;
  beforeEach(() => {
    spy = vi.spyOn(sdk, 'loadCssWithFetch').mockResolvedValue(undefined as any);
  });
  afterEach(() => {
    spy.mockRestore();
    vi.clearAllMocks();
  });

  it('routes manifest CSS through the blob loader when a fetch hook is registered', async () => {
    const host = createHost(true);
    const assets: any = {
      cssAssets: ['http://x/a.css'],
      jsAssetsWithoutEntry: [],
      entryAssets: [],
    };
    await preloadAssets(remoteInfo('a'), host, assets, false);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        href: 'http://x/a.css',
        customFetch: expect.any(Function),
      }),
    );
  });

  it('does NOT apply CSS through the blob loader during a preload hint (useLinkPreload)', async () => {
    const host = createHost(true);
    const assets: any = {
      cssAssets: ['http://x/a.css'],
      jsAssetsWithoutEntry: [],
      entryAssets: [],
    };
    // useLinkPreload defaults to true (preloadRemote). The blob loader injects a
    // rel=stylesheet that would apply the remote's CSS before it is loaded, so it
    // must be skipped here rather than overriding host styles.
    await preloadAssets(remoteInfo('a'), host, assets);
    expect(spy).not.toHaveBeenCalled();
  });

  it('does NOT use the blob loader when no fetch hook is registered', async () => {
    const host = createHost(false);
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
      await preloadAssets(remoteInfo('b'), host, assets, false);
    } finally {
      observer.disconnect();
    }
    expect(spy).not.toHaveBeenCalled();
  });
});
