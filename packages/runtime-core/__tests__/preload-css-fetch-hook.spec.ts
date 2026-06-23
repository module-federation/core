import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as sdk from '@module-federation/sdk';
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
        fetch: { emit: vi.fn(), listeners },
        createLink: { emit: vi.fn() },
        createScript: { emit: vi.fn() },
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
  let loadCssWithFetch: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    loadCssWithFetch = vi
      .spyOn(sdk, 'loadCssWithFetch')
      .mockResolvedValue(undefined as any);
  });

  afterEach(() => {
    loadCssWithFetch.mockRestore();
  });

  it('uses the blob loader for manifest CSS when a fetch hook is registered', async () => {
    const host = createLoaderHook(true);
    const assets: any = {
      cssAssets: ['http://x/a.css'],
      jsAssetsWithoutEntry: [],
      entryAssets: [],
    };
    await preloadAssets(createRemoteInfo('a'), host, assets, false);
    expect(loadCssWithFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        href: 'http://x/a.css',
        customFetch: expect.any(Function),
      }),
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
    expect(loadCssWithFetch).not.toHaveBeenCalled();
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
    expect(loadCssWithFetch).not.toHaveBeenCalled();
  });
});
