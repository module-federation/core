import { describe, expect, it, rs } from '@rstest/core';

import {
  createLazyChunkLoadController,
  type InstalledChunk,
  type LynxChunk,
} from './lazyChunkLoadController';
import { LYNX_BUNDLE_REGISTRY, patchLynxChunkLoading } from './runtimePlugin';
import {
  createGlobalObject,
  createWebpackRequire,
  makeSynchronousThenable,
  remoteRegistry,
} from './runtimeChunkLoading.testUtils';

describe('patchLynxChunkLoading lazy bundle loading', () => {
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

  it('controller installs a synchronous bundle before returning and notifies its observer synchronously', () => {
    const installedChunks: Record<string, InstalledChunk | undefined> = {};
    const modules: Record<string, unknown> = {};
    const factory = rs.fn();
    const chunk = {
      ids: ['feature'],
      modules: { factory },
    } satisfies LynxChunk;
    const controller = createLazyChunkLoadController({
      chunkKey: 'feature',
      installedChunks,
      timeout: 5,
      loadQueryComponent: () => makeSynchronousThenable(chunk),
      isChunk: (value): value is LynxChunk => value === chunk,
      installChunkAfterConsumes: (value, isCurrent) => {
        if (isCurrent()) {
          Object.assign(modules, value.modules);
          for (const id of value.ids) {
            installedChunks[String(id)] = 0;
          }
        }
      },
    });

    const promise = controller.load('async/Card.bundle');
    expect(modules.factory).toBe(factory);
    let observed = false;
    promise.then(() => {
      observed = true;
    });
    expect(observed).toBe(true);
  });

  it('controller cannot delete a later retry tuple after stale timed-out consumes reject', async () => {
    const installedChunks: Record<string, InstalledChunk | undefined> = {};
    const modules: Record<string, unknown> = {};
    const factory = rs.fn();
    const chunk = {
      ids: ['feature'],
      modules: { factory },
    } satisfies LynxChunk;
    const controller = (consumes: Promise<void>) =>
      createLazyChunkLoadController({
        chunkKey: 'feature',
        installedChunks,
        timeout: 5,
        loadQueryComponent: () => makeSynchronousThenable(chunk),
        isChunk: (value): value is LynxChunk => value === chunk,
        installChunkAfterConsumes: (value, isCurrent) =>
          consumes.then(() => {
            if (isCurrent()) {
              Object.assign(modules, value.modules);
              for (const id of value.ids) {
                installedChunks[String(id)] = 0;
              }
            }
          }),
      });
    let rejectExpired!: (error: Error) => void;
    const expiredConsumes = new Promise<void>((_resolve, reject) => {
      rejectExpired = reject;
    });
    const expired = controller(expiredConsumes).load('async/Card.bundle');
    await expect(expired).rejects.toThrow('Timed out loading Lynx lazy bundle');

    let resolveFresh!: () => void;
    const freshConsumes = new Promise<void>((resolve) => {
      resolveFresh = resolve;
    });
    const fresh = controller(freshConsumes).load('async/Card.bundle');
    const freshTuple = installedChunks.feature;
    rejectExpired(new Error('stale consume failed'));
    await Promise.resolve();
    expect(installedChunks.feature).toBe(freshTuple);
    resolveFresh();
    await expect(fresh).resolves.toBeDefined();
    expect(modules.factory).toBe(factory);
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
    const promises: PromiseLike<unknown>[] = [];
    webpackRequire.f.j!('feature', promises);
    await Promise.all(promises);

    expect(loadLazyBundle).toHaveBeenCalledWith(
      'https://cdn.example/remotes/async/Card.bundle',
    );
    expect(fetchBundle).not.toHaveBeenCalled();
    expect(loadScript).not.toHaveBeenCalled();
    expect(webpackRequire.m.factory).toBe(factory);
  });

  it('uses the Web native Lynx lazy-bundle API before React starts', async () => {
    const webpackRequire = createWebpackRequire();
    webpackRequire.lynx_aci = { feature: 'lazy-bundle/Feature.bundle' };
    const factory = rs.fn();
    const loadLazyBundle = rs.fn(async () => ({
      ids: ['feature'],
      modules: { factory },
    }));
    const globalObject = {
      lynx: {
        getNativeLynx: () => ({ loadLazyBundle }),
        loadScript: rs.fn(),
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
    const promises: PromiseLike<unknown>[] = [];
    webpackRequire.f.j!('feature', promises);
    await Promise.all(promises);

    expect(loadLazyBundle).toHaveBeenCalledWith(
      'https://cdn.example/remotes/lazy-bundle/Feature.bundle',
    );
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
      const promises: PromiseLike<unknown>[] = [];
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
    const promises: PromiseLike<unknown>[] = [];
    webpackRequire.f.j!('feature', promises);
    await expect(Promise.all(promises)).rejects.toThrow(
      'requires QueryComponent',
    );

    expect(fetchBundle).not.toHaveBeenCalled();
    expect(loadScript).not.toHaveBeenCalled();
  });

  it('loads split chunks through QueryComponent when loadLazyBundle is not callable', async () => {
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
      lynxCoreInject: {
        tt: { getDynamicComponentExports: () => chunk },
      },
      lynx: {
        loadScript,
        loadLazyBundle: true as never,
        QueryComponent,
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
    const promises: PromiseLike<unknown>[] = [];
    webpackRequire.f.j!('feature', promises);
    await Promise.all(promises);

    expect(QueryComponent).toHaveBeenCalledWith(
      'https://cdn.example/remotes/async/Card.123.bundle',
      expect.any(Function),
    );
    expect(loadScript).not.toHaveBeenCalled();
    expect(webpackRequire.m.factory).toBe(factory);
  });

  it('rejects direct chunk exports from background QueryComponent', async () => {
    const webpackRequire = createWebpackRequire();
    webpackRequire.lynx_aci = {
      feature: 'lazy-bundle/Feature.bundle',
    };
    const factory = rs.fn();
    const chunk = {
      ids: ['feature'],
      modules: { factory },
    };
    const QueryComponent = rs.fn((_source, callback) => callback(chunk));
    const globalObject = {
      lynx: {
        loadScript: rs.fn(),
        QueryComponent,
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
    const promises: PromiseLike<unknown>[] = [];
    webpackRequire.f.j!('feature', promises);
    await expect(Promise.all(promises)).rejects.toThrow(
      'Failed to load Lynx lazy bundle',
    );

    expect(QueryComponent).toHaveBeenCalledWith(
      'https://cdn.example/remotes/lazy-bundle/Feature.bundle',
      expect.any(Function),
    );
    expect(webpackRequire.m.factory).toBeUndefined();
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
    const promises: PromiseLike<unknown>[] = [];
    webpackRequire.f.j!('feature', promises);
    await Promise.all(promises);

    expect(queryComponent).toHaveBeenCalledWith(
      'https://cdn.example/remotes/async/Card.bundle',
      expect.any(Function),
    );
    expect(webpackRequire.m.factory).toBe(factory);
  });
});
