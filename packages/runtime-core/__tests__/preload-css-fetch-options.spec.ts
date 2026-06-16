import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as sdk from '@module-federation/sdk';
import { preloadAssets } from '../src/utils/preload';

describe('preloadAssets CSS with fetchOptions', () => {
  let spy: any;
  beforeEach(() => {
    spy = vi.spyOn(sdk, 'loadCssWithFetch').mockResolvedValue(undefined as any);
  });
  afterEach(() => {
    spy.mockRestore();
    vi.clearAllMocks();
  });

  it('routes manifest CSS through the blob loader when fetchOptions is set', async () => {
    const remoteInfo: any = {
      name: 'a',
      entry: 'http://x/e.js',
      type: 'module',
      entryGlobalName: 'a',
      shareScope: 'default',
      fetchOptions: { headers: { Authorization: 'Bearer t' } },
    };
    const host: any = {
      options: { inBrowser: true },
      loaderHook: { lifecycle: { fetch: { emit: vi.fn() } } },
    };
    const assets: any = {
      cssAssets: ['http://x/a.css'],
      jsAssetsWithoutEntry: [],
      entryAssets: [],
    };
    await preloadAssets(remoteInfo, host, assets, false);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        href: 'http://x/a.css',
        fetchOptions: remoteInfo.fetchOptions,
      }),
    );
  });

  it('does NOT use the blob loader when fetchOptions is absent', async () => {
    const remoteInfo: any = {
      name: 'b',
      entry: 'http://x/e.js',
      type: 'module',
      entryGlobalName: 'b',
      shareScope: 'default',
    };
    const host: any = {
      options: { inBrowser: true },
      loaderHook: {
        lifecycle: {
          fetch: { emit: vi.fn() },
          createLink: { emit: vi.fn() },
          createScript: { emit: vi.fn() },
        },
      },
    };
    const assets: any = {
      cssAssets: ['http://x/b.css'],
      jsAssetsWithoutEntry: [],
      entryAssets: [],
    };
    // jsdom env (see vitest.config.ts) provides DOM, so the no-fetchOptions
    // else-branch (waitForLinkPreload -> createLink) runs cleanly without a
    // swallowing .catch. createLink resolves on the <link> load event, which
    // jsdom does not dispatch on its own, so we fire it (as a real browser
    // would) to let the branch settle. A genuine crash before/during the
    // branch would still reject and fail the test.
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
      await preloadAssets(remoteInfo, host, assets, false);
    } finally {
      observer.disconnect();
    }
    expect(spy).not.toHaveBeenCalled();
  });
});
