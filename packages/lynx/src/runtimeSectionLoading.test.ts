import { describe, expect, it, rs } from '@rstest/core';

import {
  LYNX_BUNDLE_REGISTRY,
  patchLynxChunkLoading,
  type LynxWebpackRequire,
} from './runtimePlugin';
import { createWebpackRequire } from './runtimeChunkLoading.testUtils';

describe('patchLynxChunkLoading section loading', () => {
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
    const promises: PromiseLike<unknown>[] = [];
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

  it('preserves CommonJS factory this while restoring bundle identity', async () => {
    const webpackRequire = createWebpackRequire();
    webpackRequire.lynx_aci = { feature: 'async/Card.bundle' };
    const observedThis: unknown[] = [];
    const factory = function (this: unknown) {
      observedThis.push(this);
    };
    const globalObject = {
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
    const promises: PromiseLike<unknown>[] = [];
    webpackRequire.f.j!('feature', promises);
    await Promise.all(promises);
    const module = { exports: {} };
    (
      webpackRequire.m.factory as (
        this: unknown,
        module: unknown,
        exports: unknown,
        runtimeRequire: LynxWebpackRequire,
      ) => unknown
    ).call(module.exports, module, module.exports, webpackRequire);

    expect(observedThis).toEqual([module.exports]);
  });

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
