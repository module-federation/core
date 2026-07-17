import { describe, expect, it, rs } from '@rstest/core';

import {
  LYNX_BUNDLE_REGISTRY,
  patchLynxChunkLoading,
  type LynxWebpackRequire,
} from './runtimePlugin';

const remoteRegistry = () =>
  new Map([
    ['remote', 'lynx-cache://catalog'],
    ['remote:remote-origin', 'https://cdn.example/remotes/catalog.lynx.bundle'],
  ]);

const createWebpackRequire = (
  filename = 'chunks/feature.js?cache=1#fragment',
): LynxWebpackRequire => ({
  f: {},
  m: {},
  u: rs.fn(() => filename),
});

const createGlobalObject = (
  loadLazyBundle: (request: string) => PromiseLike<unknown>,
) => ({
  lynx: { loadLazyBundle, loadScript: rs.fn() },
  [LYNX_BUNDLE_REGISTRY]: remoteRegistry(),
});

const makeSynchronousThenable = <T>(value: T): PromiseLike<T> => {
  const thenable = {
    then(onFulfilled?: ((resolved: T) => unknown) | null) {
      if (!onFulfilled) {
        return makeSynchronousThenable(value);
      }
      try {
        return makeSynchronousThenable(onFulfilled(value));
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
  return thenable as PromiseLike<T>;
};

describe('patchLynxChunkLoading', () => {
  it('settles overlapping loads from the first bundle containing both chunks', async () => {
    const webpackRequire = createWebpackRequire();
    webpackRequire.lynx_aci = {
      first: 'async/first.bundle',
      second: 'async/second.bundle',
    };
    const resolvers = new Map<string, (value: unknown) => void>();
    const globalObject = createGlobalObject(
      (request) =>
        new Promise((resolve) => {
          resolvers.set(request, resolve);
        }),
    );

    patchLynxChunkLoading(webpackRequire, 'remote', globalObject);
    const first: PromiseLike<unknown>[] = [];
    const second: PromiseLike<unknown>[] = [];
    webpackRequire.f.j!('first', first);
    webpackRequire.f.j!('second', second);

    const firstFactory = rs.fn();
    const firstRuntime = rs.fn();
    resolvers.get('https://cdn.example/remotes/async/first.bundle')!({
      ids: ['first', 'second'],
      modules: { feature: firstFactory },
      runtime: firstRuntime,
    });
    await Promise.all([first[0], second[0]]);

    expect(webpackRequire.m.feature).toBe(firstFactory);
    expect(firstRuntime).toHaveBeenCalledTimes(1);

    const staleRuntime = rs.fn();
    resolvers.get('https://cdn.example/remotes/async/second.bundle')!({
      ids: ['second'],
      modules: { stale: rs.fn() },
      runtime: staleRuntime,
    });
    await Promise.resolve();
    expect(webpackRequire.m.stale).toBeUndefined();
    expect(staleRuntime).not.toHaveBeenCalled();
  });

  it('preserves the official synchronous lazy-bundle thenable', () => {
    const webpackRequire = createWebpackRequire();
    webpackRequire.lynx_aci = { feature: 'async/Card.bundle' };
    const factory = rs.fn();
    const globalObject = createGlobalObject(() =>
      makeSynchronousThenable({
        ids: ['feature'],
        modules: { factory },
      }),
    );

    patchLynxChunkLoading(webpackRequire, 'remote', globalObject);
    const promises: PromiseLike<unknown>[] = [];
    webpackRequire.f.j!('feature', promises);

    expect(webpackRequire.m.factory).toBe(factory);
    let observed = false;
    promises[0].then(() => {
      observed = true;
    });
    expect(observed).toBe(true);
  });

  it('evicts synchronous lazy-bundle failures so they can be retried', async () => {
    const webpackRequire = createWebpackRequire();
    webpackRequire.lynx_aci = { feature: 'async/Card.bundle' };
    const factory = rs.fn();
    let attempt = 0;
    const globalObject = createGlobalObject(() => {
      if (attempt++ === 0) {
        throw new Error('synchronous decode failed');
      }
      return makeSynchronousThenable({
        ids: ['feature'],
        modules: { factory },
      });
    });

    patchLynxChunkLoading(webpackRequire, 'remote', globalObject);
    const failed: PromiseLike<unknown>[] = [];
    webpackRequire.f.j!('feature', failed);
    await expect(failed[0]).rejects.toThrow('synchronous decode failed');

    const retried: PromiseLike<unknown>[] = [];
    webpackRequire.f.j!('feature', retried);
    await expect(retried[0]).resolves.toBeDefined();
    expect(webpackRequire.m.factory).toBe(factory);
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
    );
  });

  it('waits for shared consumes from a synchronous lazy bundle', async () => {
    const webpackRequire = createWebpackRequire();
    webpackRequire.lynx_aci = { feature: 'async/Card.bundle' };
    webpackRequire.consumesLoadingData = {
      chunkMapping: { feature: ['shared-state'] },
    };
    let resolveConsume!: () => void;
    const consume = new Promise<void>((resolve) => {
      resolveConsume = () => {
        webpackRequire.m['shared-state'] = rs.fn();
        resolve();
      };
    });
    webpackRequire.f.consumes = (_chunkId, promises) => {
      promises.push(consume);
    };
    const factory = rs.fn();
    const globalObject = createGlobalObject(() =>
      makeSynchronousThenable({
        ids: ['feature'],
        modules: { factory },
      }),
    );

    patchLynxChunkLoading(webpackRequire, 'remote', globalObject);
    const promises: PromiseLike<unknown>[] = [];
    webpackRequire.f.j!('feature', promises);

    let observed = false;
    promises[0].then(() => {
      observed = true;
    });
    expect(observed).toBe(false);
    expect(webpackRequire.m.factory).toBeUndefined();
    resolveConsume();
    await expect(promises[0]).resolves.toBeDefined();
    expect(webpackRequire.m.factory).toBe(factory);
  });

  it('does not let a stale consume rejection cancel a retry', async () => {
    const webpackRequire = createWebpackRequire();
    webpackRequire.lynx_aci = { feature: 'async/Card.bundle' };
    webpackRequire.consumesLoadingData = {
      chunkMapping: { feature: ['shared-state'] },
    };
    let rejectExpired!: (error: Error) => void;
    const expiredConsume = new Promise<void>((_resolve, reject) => {
      rejectExpired = reject;
    });
    let resolveFresh!: () => void;
    const freshConsume = new Promise<void>((resolve) => {
      resolveFresh = () => {
        webpackRequire.m['shared-state'] = rs.fn();
        resolve();
      };
    });
    let consumeAttempt = 0;
    webpackRequire.f.consumes = (_chunkId, promises) => {
      promises.push(consumeAttempt++ === 0 ? expiredConsume : freshConsume);
    };
    const factory = rs.fn();
    const globalObject = createGlobalObject(() =>
      makeSynchronousThenable({
        ids: ['feature'],
        modules: { factory },
      }),
    );

    patchLynxChunkLoading(webpackRequire, 'remote', globalObject, 5);
    const expired: PromiseLike<unknown>[] = [];
    webpackRequire.f.j!('feature', expired);
    await expect(expired[0]).rejects.toThrow(
      'Timed out loading Lynx lazy bundle',
    );

    const fresh: PromiseLike<unknown>[] = [];
    webpackRequire.f.j!('feature', fresh);
    rejectExpired(new Error('stale consume failed'));
    await Promise.resolve();
    resolveFresh();
    await expect(fresh[0]).resolves.toBeDefined();
    expect(webpackRequire.m.factory).toBe(factory);
  });

  it('ignores a stale lazy bundle that resolves after timeout', async () => {
    const webpackRequire = createWebpackRequire();
    webpackRequire.lynx_aci = { feature: 'async/Card.bundle' };
    const resolvers: Array<(value: unknown) => void> = [];
    const globalObject = createGlobalObject(
      () =>
        new Promise((resolve) => {
          resolvers.push(resolve);
        }),
    );

    patchLynxChunkLoading(webpackRequire, 'remote', globalObject, 5);
    const expired: PromiseLike<unknown>[] = [];
    webpackRequire.f.j!('feature', expired);
    await expect(expired[0]).rejects.toThrow(
      'Timed out loading Lynx lazy bundle',
    );

    const fresh: PromiseLike<unknown>[] = [];
    webpackRequire.f.j!('feature', fresh);
    resolvers[0]({
      ids: ['feature'],
      modules: { factory: rs.fn() },
    });
    await Promise.resolve();
    expect(webpackRequire.m.factory).toBeUndefined();

    const freshFactory = rs.fn();
    resolvers[1]({ ids: ['feature'], modules: { factory: freshFactory } });
    await expect(fresh[0]).resolves.toBeDefined();
    expect(webpackRequire.m.factory).toBe(freshFactory);
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
      [LYNX_BUNDLE_REGISTRY]: remoteRegistry(),
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
    ['/', 'async/Card.bundle', 'https://cdn.example/async/Card.bundle'],
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
      'http://assets.example/v4/',
      'async/Card.bundle',
      'http://assets.example/v4/async/Card.bundle',
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
      const promises: Promise<unknown>[] = [];
      webpackRequire.f.j!('feature', promises);
      await Promise.all(promises);

      expect(loadLazyBundle).toHaveBeenCalledWith(expected);
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
    const promises: Promise<unknown>[] = [];
    webpackRequire.f.j!('feature', promises);
    await Promise.all(promises);

    expect(loadLazyBundle).toHaveBeenCalledWith(
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
    const promises: Promise<unknown>[] = [];
    webpackRequire.f.j!('feature', promises);
    await Promise.all(promises);

    expect(loadLazyBundle).toHaveBeenCalledWith(
      '//cdn.example/async/Card.bundle',
    );
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
