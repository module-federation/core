import { ModuleFederation } from '@module-federation/runtime';
import {
  clearCache,
  clearContainerCache,
  ensureRemoteChunks,
  planRemoteCache,
  createClearCacheRuntimePlugin,
  installClearCache,
  installNodeCacheRuntime,
} from '../src/clearCache';
import { init } from '../src/init';
import { remotes } from '../src/remotes';
import type { WebpackRequire } from '../src/types';

function fixture(
  instance: any = {
    options: { remotes: [{ name: 'remoteA', alias: 'aliasA' }] },
    moduleCache: new Map(),
    loadRemote: jest.fn(async (id) => ({ id })),
  },
) {
  const runtime = {
    federation: {
      instance,
      bundlerRuntime: { init, remotes },
      bundlerRuntimeOptions: {
        remotes: {
          remoteInfos: { remoteA: [{ name: 'remoteA', alias: 'aliasA' }] },
          idToExternalAndNameMapping: { 101: ['default', './A', 201] },
          idToRemoteMap: { 101: [{ name: 'remoteA' }] },
        },
      },
    },
    remotesLoadingData: {
      moduleIdToRemoteDataMapping: {
        101: { remoteName: 'remoteA', externalModuleId: 201 },
      },
    },
    m: { 101: () => {}, 201: () => {}, 999: () => {} },
    c: Object.fromEntries(
      [101, 201, 301, 401, 999].map((id) => [id, { exports: id }]),
    ),
  } as unknown as WebpackRequire;
  runtime.remotesLoadingData = {
    ...runtime.remotesLoadingData!,
    chunkMapping: { 10: [101] },
    cache: {
      moduleIdToParentModuleIds: { 101: [301], 301: [401], 401: [301] },
      modules: runtime.c,
      factories: runtime.m,
    },
  };
  return { instance, runtime };
}
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
const plugin = createClearCacheRuntimePlugin;

describe('optional bundler cache runtime', () => {
  test('clears only the runtime of the loaded container and preserves retiring shared providers', () => {
    const { instance, runtime } = fixture();
    const sibling = fixture(instance).runtime;
    const clearChunks = jest.fn(async () => {});
    runtime.federation.clearNodeChunks = clearChunks;
    for (const entry of [runtime, sibling]) {
      entry.getContainer = jest.fn(async () => () => ({}));
      entry.federation.bundlerRuntime!.init = () => instance;
      installNodeCacheRuntime(entry);
      entry.federation.bundlerRuntime!.init({
        webpackRequire: entry,
        libraryType: 'commonjs-module',
      });
    }
    const container = { get: runtime.getContainer };
    clearContainerCache(container, true);
    expect(Object.keys(runtime.c)).toEqual(['101', '201', '301', '401', '999']);
    clearContainerCache(container, false);
    expect(Object.keys(runtime.c)).toEqual([]);
    expect(clearChunks).toHaveBeenCalledWith({ remoteOnly: false });
    expect(Object.keys(sibling.c)).toEqual(['101', '201', '301', '401', '999']);
    runtime.federation.disposeClearCache?.();
    sibling.federation.disposeClearCache?.();
  });

  test('re-installs evicted startup remote factories when mfAsyncStartup or ensureRemoteChunks runs', async () => {
    const { runtime } = fixture();
    let version = 'v1';
    runtime.f = {
      remotes: (chunkId, promises) => {
        if (String(chunkId) === '10') {
          promises.push(
            Promise.resolve().then(() => {
              const current = version;
              runtime.m[101] = (mod) => {
                mod.exports = current;
              };
            }),
          );
        }
      },
    };
    runtime.mfAsyncStartup = (() => {
      let ran = false;
      let cached: Promise<unknown> | undefined;
      return () => {
        if (ran) return cached;
        ran = true;
        const promises: unknown[] = [];
        runtime.f!.remotes(10, promises);
        cached = Promise.all(promises);
        return cached;
      };
    })();
    const dispose = installClearCache({ webpackRequire: runtime })!;
    try {
      await runtime.mfAsyncStartup();
      const firstMod = { exports: undefined };
      runtime.m[101](firstMod);
      expect(firstMod.exports).toBe('v1');

      version = 'v2';
      await runtime.federation.clearCache!({ name: 'remoteA' });
      expect(runtime.m[101]).toBeUndefined();

      await runtime.mfAsyncStartup();
      expect(runtime.m[101]).toBeDefined();
      const secondMod = { exports: undefined };
      runtime.m[101](secondMod);
      expect(secondMod.exports).toBe('v2');

      version = 'v3';
      await runtime.federation.clearCache!({ name: 'remoteA' });
      await ensureRemoteChunks(runtime, [10]);
      const thirdMod = { exports: undefined };
      runtime.m[101](thirdMod);
      expect(thirdMod.exports).toBe('v3');
    } finally {
      dispose();
    }
  });

  test('default init does not install Node cache policy', () => {
    const { instance, runtime } = fixture();
    const load = instance.loadRemote;
    runtime.federation.initOptions = { name: 'host' };
    runtime.federation.runtime = { init: () => instance } as any;
    expect(init({ webpackRequire: runtime })).toBe(instance);
    expect(runtime.federation.clearCache).toBeUndefined();
    expect(instance.loadRemote).toBe(load);
  });

  test.each(['remoteA', 'aliasA'])(
    'clears the compiled graph for %s while leaving producer and unrelated caches intact',
    async (name) => {
      const { instance, runtime } = fixture();
      const oldModule = { remoteEntryExports: {} };
      instance.moduleCache.set('remoteA', oldModule);
      expect(planRemoteCache({ webpackRequire: runtime, name })).toEqual({
        remoteModuleIds: ['101'],
        externalModuleIds: ['201'],
        consumerModuleIds: ['301', '401'],
      });
      await expect(
        clearCache({ webpackRequire: runtime, name }),
      ).resolves.toEqual({ name, cleared: true });
      expect(Object.keys(runtime.c)).toEqual(['999']);
      expect(Object.keys(runtime.m)).toEqual(['201', '999']);
      expect(instance.moduleCache.get('remoteA')).toBe(oldModule);
    },
  );

  test('rejects an empty remote name', async () => {
    const { runtime } = fixture();
    await expect(
      clearCache({ webpackRequire: runtime, name: '' }),
    ).rejects.toThrow('requires a remote name');
  });

  test('waits for a late factory write before evicting the old remote', async () => {
    const { runtime } = fixture();
    const gate = deferred();
    const mapping =
      runtime.federation.bundlerRuntimeOptions.remotes!
        .idToExternalAndNameMapping[101];
    mapping.p = gate.promise.then(() => {
      runtime.m[101] = () => 'old';
      mapping.p = 1;
    });
    const clear = clearCache({ webpackRequire: runtime, name: 'remoteA' });
    await Promise.resolve();
    expect(runtime.c[301]).toBeDefined();
    expect(runtime.m[101]).toBeDefined();
    gate.resolve();
    await clear;
    expect(mapping.p).toBeUndefined();
    expect(runtime.m[101]).toBeUndefined();
    expect(runtime.c[301]).toBeUndefined();
  });

  test('routes compiled chunk loads through the installed Node load tracker', async () => {
    const { instance, runtime } = fixture();
    const tracker = jest.fn((run: () => Promise<unknown>) => run());
    instance[Symbol.for('module-federation.node.load-tracker')] = tracker;
    const bundled = jest.fn(({ promises }) => {
      promises.push(instance.loadRemote('aliasA/Button'));
    });
    runtime.federation.bundlerRuntime!.remotes = bundled;
    installNodeCacheRuntime(runtime);
    const dispose = installClearCache({ webpackRequire: runtime })!;
    try {
      const promises: Promise<unknown>[] = [];
      runtime.federation.bundlerRuntime!.remotes({
        webpackRequire: runtime,
        chunkId: 10,
        chunkMapping: { 10: [101] },
        promises,
      } as any);
      await Promise.all(promises);
      expect(tracker).toHaveBeenCalledTimes(1);
      expect(bundled).toHaveBeenCalledTimes(1);
    } finally {
      dispose();
    }
  });

  test('rejects unsupported compiled remotes before changing caches or loading records', async () => {
    const { runtime } = fixture();
    const options = runtime.federation.bundlerRuntimeOptions.remotes!;
    const record = options.idToExternalAndNameMapping[101];
    record.p = 1;
    delete runtime.remotesLoadingData!.cache;
    await expect(
      clearCache({ webpackRequire: runtime, name: 'remoteA' }),
    ).rejects.toThrow('compiled dependency graph and module tables');
    expect(record.p).toBe(1);
    expect(runtime.c[101]).toBeDefined();
    expect(runtime.m[101]).toBeDefined();
    delete runtime.remotesLoadingData;
    options.idToRemoteMap = {};
    await expect(
      clearCache({ webpackRequire: runtime, name: 'remoteA' }),
    ).resolves.toEqual({ name: 'remoteA', cleared: true });
  });
});

describe('cache adapter lifecycle', () => {
  test('binds every Node entry when plugin factories run before bootstrap and reuse one instance', async () => {
    const remote = { name: 'remoteA', entry: 'https://example.test/old.js' };
    const instance = new ModuleFederation({
      name: 'multi-entry-bootstrap',
      remotes: [remote],
      plugins: [plugin()],
    });
    const runtimes = [fixture(instance).runtime, fixture(instance).runtime];
    for (const runtime of runtimes) {
      const bundlerRuntime = runtime.federation.bundlerRuntime;
      delete (runtime.federation as any).bundlerRuntime;
      installNodeCacheRuntime(runtime);
      runtime.federation.bundlerRuntime = bundlerRuntime;
      runtime.federation.initOptions = { name: instance.name };
      runtime.federation.runtime = { init: () => instance } as any;
      runtime.federation.instance = runtime.federation.bundlerRuntime.init({
        webpackRequire: runtime,
      });
      expect(
        Object.getOwnPropertyDescriptor(runtime.federation, 'bundlerRuntime'),
      ).toMatchObject({ writable: true, value: expect.any(Object) });
    }
    try {
      const next = { ...remote, entry: 'https://example.test/new.js' };
      await plugin().removeRemote({ origin: instance, remote });
      instance.registerRemotes([next], { force: true });
      for (const runtime of runtimes) {
        expect(runtime.m[101]).toBeUndefined();
        expect(
          runtime.federation.bundlerRuntimeOptions.remotes!.remoteInfos!
            .remoteA[0].entry,
        ).toBe(next.entry);
      }
    } finally {
      plugin().dispose({ origin: instance });
    }
  });

  test('shares one adapter through get/set require facades and rejects another owner', () => {
    const { runtime } = fixture();
    const facade = () =>
      new Proxy(() => {}, {
        get: (_, key) => (runtime as any)[key],
        set: (_, key, value) => {
          (runtime as any)[key] = value;
          return true;
        },
      }) as unknown as WebpackRequire;
    const dispose = installClearCache({ webpackRequire: facade() })!;
    try {
      expect(installClearCache({ webpackRequire: facade() })).toBe(dispose);
      expect(() =>
        installClearCache({
          webpackRequire: facade(),
          instance: fixture().instance,
        }),
      ).toThrow('another MF instance');
    } finally {
      dispose();
    }
  });

  test('rejects detaching during active cleanup and rejects saved clear entry points after detach', async () => {
    const { instance, runtime } = fixture();
    const originalLoad = instance.loadRemote;
    const dispose = installClearCache({ webpackRequire: runtime })!;
    const clear = runtime.federation.clearCache!;
    const pending = clear({ name: 'remoteA' });
    expect(dispose).toThrow('cleanup is pending');
    await pending;
    dispose();
    dispose();
    expect(instance.loadRemote).toBe(originalLoad);
    expect(Object.hasOwn(runtime.federation, 'clearCache')).toBe(false);
    expect(Object.hasOwn(runtime.federation, 'disposeClearCache')).toBe(false);
    await expect(clear({ name: 'remoteA' })).rejects.toThrow('detached');
  });

  test('routes removal to all bindings across bundled copies and releases each independently', async () => {
    const { instance, runtime: first } = fixture();
    const { runtime: second } = fixture(instance);
    const disposeFirst = installClearCache({ webpackRequire: first })!;
    let other!: typeof import('../src/clearCache');
    jest.isolateModules(() => {
      other = require('../src/clearCache');
    });
    expect(other.installClearCache({ webpackRequire: first })).toBe(
      disposeFirst,
    );
    const disposeSecond = other.installClearCache({ webpackRequire: second })!;
    const firstClear = jest.fn(async () => ({
      name: 'remoteA',
      cleared: true as const,
    }));
    const secondClear = jest.fn(async () => ({
      name: 'remoteA',
      cleared: true as const,
    }));
    first.federation.clearCache = firstClear;
    second.federation.clearCache = secondClear;
    await plugin().removeRemote({
      origin: instance,
      remote: { name: 'remoteA' },
    });
    expect(firstClear).toHaveBeenCalledTimes(1);
    expect(secondClear).toHaveBeenCalledTimes(1);
    disposeFirst();
    await plugin().removeRemote({
      origin: instance,
      remote: { name: 'remoteA' },
    });
    expect(firstClear).toHaveBeenCalledTimes(1);
    expect(secondClear).toHaveBeenCalledTimes(2);
    disposeSecond();
    await plugin().removeRemote({
      origin: instance,
      remote: { name: 'remoteA' },
    });
    expect(secondClear).toHaveBeenCalledTimes(2);
  });

  test('waits for every binding before reporting a cleanup failure', async () => {
    const { instance, runtime: first } = fixture();
    const { runtime: second } = fixture(instance);
    const disposers = [first, second].map(
      (webpackRequire) => installClearCache({ webpackRequire })!,
    );
    const pending = deferred();
    first.federation.clearCache = jest.fn(async () => {
      throw Error('failed');
    });
    second.federation.clearCache = jest.fn(() => pending.promise as any);
    const removal = plugin().removeRemote({
      origin: instance,
      remote: { name: 'remoteA' },
    });
    const observed = expect(removal).rejects.toThrow('failed');
    let settled = false;
    void removal.catch(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(second.federation.clearCache).toHaveBeenCalledTimes(1);
    expect(settled).toBe(false);
    pending.resolve();
    await observed;
    disposers.forEach((dispose) => dispose());
  });

  test('reinitializes a binding without transferring siblings or retaining the previous owner', async () => {
    const { instance: first, runtime } = fixture();
    const { instance: second } = fixture();
    const { runtime: sibling } = fixture(first);
    const runtimeInit = jest
      .fn()
      .mockReturnValueOnce(first)
      .mockReturnValueOnce(second);
    runtime.federation.initOptions = { name: 'host' };
    runtime.federation.runtime = { init: runtimeInit } as any;
    installNodeCacheRuntime(runtime);
    const siblingDispose = installClearCache({ webpackRequire: sibling })!;
    runtime.federation.instance = runtime.federation.bundlerRuntime.init({
      webpackRequire: runtime,
    });
    const firstClear = runtime.federation.clearCache!;
    runtime.federation.instance = undefined;
    runtime.federation.instance = runtime.federation.bundlerRuntime.init({
      webpackRequire: runtime,
    });
    await expect(firstClear({ name: 'remoteA' })).rejects.toThrow('detached');
    plugin().dispose({ origin: first });
    expect(runtime.federation.instance).toBe(second);
    await runtime.federation.clearCache!({ name: 'remoteA' });
    siblingDispose();
    runtime.federation.disposeClearCache!();
  });

  test('rejects reinitialization during cleanup before invoking runtime init', async () => {
    const { instance, runtime } = fixture();
    const runtimeInit = jest.fn(() => instance);
    runtime.federation.initOptions = { name: 'host' };
    runtime.federation.runtime = { init: runtimeInit } as any;
    installNodeCacheRuntime(runtime);
    const initialize = () =>
      runtime.federation.bundlerRuntime.init({ webpackRequire: runtime });
    initialize();
    const pending = runtime.federation.clearCache!({ name: 'remoteA' });
    expect(initialize).toThrow('cleanup is pending');
    expect(runtimeInit).toHaveBeenCalledTimes(1);
    await pending;
    expect(initialize()).toBe(instance);
    runtime.federation.disposeClearCache!();
  });
});
