import { describe, expect, it, rs } from '@rstest/core';

import { LYNX_BUNDLE_REGISTRY, patchLynxChunkLoading } from './runtimePlugin';
import {
  createWebpackRequire,
  remoteRegistry,
} from './runtimeChunkLoading.testUtils';

describe('patchLynxChunkLoading chunk URLs', () => {
  it('loads host lazy bundles before a bundle registry exists', async () => {
    const webpackRequire = createWebpackRequire();
    webpackRequire.lynx_aci = { feature: 'lazy-bundle/Feature.bundle' };
    webpackRequire.p = 'https://app.example/dist/host-web/';
    const loadLazyBundle = rs.fn(async () => ({
      ids: ['feature'],
      modules: {},
    }));
    const globalObject = {
      globDynamicComponentEntry:
        'https://app.example/dist/host-web/main.lynx.bundle',
      lynx: { loadLazyBundle, loadScript: rs.fn() },
    };

    expect(patchLynxChunkLoading(webpackRequire, 'host', globalObject)).toBe(
      true,
    );
    const promises: PromiseLike<unknown>[] = [];
    webpackRequire.f.j!('feature', promises);
    await Promise.all(promises);

    expect(loadLazyBundle).toHaveBeenCalledWith(
      'https://app.example/dist/host-web/lazy-bundle/Feature.bundle',
      undefined,
      'https://app.example/dist/host-web/main.lynx.bundle',
    );
  });

  it('leaves assetless host chunks to other webpack handlers', () => {
    const webpackRequire = createWebpackRequire();
    webpackRequire.lynx_aci = {
      local: 'lazy-bundle/Local.bundle',
    };
    const loadLazyBundle = rs.fn();
    const globalObject = {
      lynx: { loadLazyBundle, loadScript: rs.fn() },
    };

    patchLynxChunkLoading(webpackRequire, 'host', globalObject);
    const promises: PromiseLike<unknown>[] = [];
    webpackRequire.f.j!('remote-only', promises);

    expect(promises).toEqual([]);
    expect(loadLazyBundle).not.toHaveBeenCalled();
  });

  it('captures the remote origin when the container runtime is patched', async () => {
    const webpackRequire = createWebpackRequire();
    webpackRequire.lynx_aci = { feature: 'async/Card.bundle' };
    const loadLazyBundle = rs.fn(async () => ({
      ids: ['feature'],
      modules: {},
    }));
    const registry = remoteRegistry();
    const globalObject = {
      globDynamicComponentEntry: '__Card__',
      lynx: { loadLazyBundle, loadScript: rs.fn() },
      [LYNX_BUNDLE_REGISTRY]: registry,
    };

    patchLynxChunkLoading(webpackRequire, 'remote', globalObject);
    registry.set(
      'remote:remote-origin',
      'https://other.example/remotes/catalog.lynx.bundle',
    );
    const promises: PromiseLike<unknown>[] = [];
    webpackRequire.f.j!('feature', promises);
    await Promise.all(promises);

    expect(loadLazyBundle).toHaveBeenCalledWith(
      'https://cdn.example/remotes/async/Card.bundle',
      undefined,
      'https://cdn.example/remotes/catalog.lynx.bundle',
    );
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
      globDynamicComponentEntry:
        'https://cdn.example/remotes/catalog.lynx.bundle',
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
    const promises: PromiseLike<unknown>[] = [];
    webpackRequire.f.j!('feature', promises);

    await expect(Promise.all(promises)).resolves.toBeDefined();
    expect(loadLazyBundle).toHaveBeenCalledWith(
      'https://cdn.example/remote-assets/async/catalog__background_Card.123.bundle',
      undefined,
      'https://cdn.example/remotes/catalog.lynx.bundle',
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
    const publicPathPromises: PromiseLike<unknown>[] = [];
    publicPathRequire.f.j!('feature', publicPathPromises);
    await Promise.all(publicPathPromises);

    const assetRequire = createWebpackRequire();
    assetRequire.lynx_aci = {
      feature: '//assets.example/chunks/Card.bundle',
    };
    patchLynxChunkLoading(assetRequire, 'remote', globalObject);
    const assetPromises: PromiseLike<unknown>[] = [];
    assetRequire.f.j!('feature', assetPromises);
    await Promise.all(assetPromises);

    expect(loadLazyBundle.mock.calls[0]?.[0]).toBe(
      '//cdn.example/assets/async/Card.bundle',
    );
    expect(loadLazyBundle.mock.calls[1]?.[0]).toBe(
      '//assets.example/chunks/Card.bundle',
    );
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
    ['/', 'async/Card.bundle', 'https://cdn.example/async/Card.bundle'],
    [
      'assets/',
      'async/Card.bundle',
      'https://cdn.example/remotes/assets/async/Card.bundle',
    ],
    [
      'assets',
      'async/Card.bundle',
      'https://cdn.example/remotes/assets/async/Card.bundle',
    ],
    [
      'assets/',
      '/async/Card.bundle',
      'https://cdn.example/remotes/assets/async/Card.bundle',
    ],
    ['/v2/', 'async/Card.bundle', 'https://cdn.example/v2/async/Card.bundle'],
    ['/v2', '/async/Card.bundle', 'https://cdn.example/v2/async/Card.bundle'],
    [
      'https://assets.example/v3/',
      'async/Card.bundle',
      'https://assets.example/v3/async/Card.bundle',
    ],
    [
      'https://assets.example/v3',
      'async/Card.bundle',
      'https://assets.example/v3/async/Card.bundle',
    ],
    [
      'http://assets.example/v4/',
      'async/Card.bundle',
      'http://assets.example/v4/async/Card.bundle',
    ],
    [
      '//assets.example/v5',
      'async/Card.bundle',
      '//assets.example/v5/async/Card.bundle',
    ],
    [
      '/ignored/',
      'https://assets.example/Card.bundle',
      'https://assets.example/Card.bundle',
    ],
    [
      '/ignored/',
      'http://assets.example/Card.bundle',
      'http://assets.example/Card.bundle',
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
      const promises: PromiseLike<unknown>[] = [];
      webpackRequire.f.j!('feature', promises);
      await Promise.all(promises);

      expect(loadLazyBundle.mock.calls[0]?.[0]).toBe(expected);
    },
  );

  it('uses the manifest entry directory when Webpack auto-detects the Lynx Web client path', async () => {
    const webpackRequire = createWebpackRequire();
    webpackRequire.lynx_aci = { feature: 'async/Card.bundle' };
    webpackRequire.lynx_public_path_auto = true;
    webpackRequire.p =
      'http://host.example/node_modules/@lynx-js/web-core/dist/client_prod/static/js/';
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
          'https://cdn.example/remotes/catalog.lynx.bundle',
        ],
      ]),
    };

    patchLynxChunkLoading(webpackRequire, 'remote', globalObject);
    const promises: PromiseLike<unknown>[] = [];
    webpackRequire.f.j!('feature', promises);
    await Promise.all(promises);

    expect(loadLazyBundle.mock.calls[0]?.[0]).toBe(
      'https://cdn.example/remotes/async/Card.bundle',
    );
  });

  it('preserves a protocol-relative remote origin for root public paths', async () => {
    const webpackRequire = createWebpackRequire();
    webpackRequire.lynx_aci = { feature: 'async/Card.bundle' };
    webpackRequire.p = '/';
    const loadLazyBundle = rs.fn(async () => ({
      ids: ['feature'],
      modules: {},
    }));
    const globalObject = {
      lynx: { loadLazyBundle, loadScript: rs.fn() },
      [LYNX_BUNDLE_REGISTRY]: new Map([
        ['remote', 'lynx-cache://catalog'],
        ['remote:remote-origin', '//cdn.example/remotes/catalog.lynx.bundle'],
      ]),
    };

    patchLynxChunkLoading(webpackRequire, 'remote', globalObject);
    const promises: PromiseLike<unknown>[] = [];
    webpackRequire.f.j!('feature', promises);
    await Promise.all(promises);

    expect(loadLazyBundle.mock.calls[0]?.[0]).toBe(
      '//cdn.example/async/Card.bundle',
    );
  });
});
