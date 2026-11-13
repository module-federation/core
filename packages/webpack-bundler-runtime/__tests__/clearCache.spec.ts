import { ModuleFederation } from '@module-federation/runtime';
import {
  clearCache,
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
  let clearing = 0;
  const runtime = {
    remoteCache: {
      clear: jest.fn(async (_keys, { pending, reset }) => {
        clearing++;
        try {
          reset();
          await Promise.allSettled(pending);
          reset();
        } finally {
          clearing--;
        }
      }),
      wait: jest.fn(),
      waitForChunk: jest.fn(),
      hasPending: () => clearing > 0,
    },
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
    'translates %s to native cache keys without editing native or MF-owned tables',
    async (name) => {
      const { instance, runtime } = fixture();
      const container = { __webpack_clear_cache__: jest.fn() };
      const module = { remoteEntryExports: container };
      instance.moduleCache.set('remoteA', module);
      (globalThis as any).remoteA = container;
      try {
        await expect(
          clearCache({ webpackRequire: runtime, name }),
        ).resolves.toEqual({ name, cleared: true });
        expect(runtime.remoteCache!.clear).toHaveBeenCalledWith(
          expect.arrayContaining(['remoteA', 'aliasA']),
          { pending: [], reset: expect.any(Function) },
        );
        expect(Object.keys(runtime.c)).toEqual([
          '101',
          '201',
          '301',
          '401',
          '999',
        ]);
        expect(runtime.m[101]).toBeDefined();
        expect(runtime.m[201]).toBeDefined();
        expect(runtime.m[999]).toBeDefined();
        expect(instance.moduleCache.get('remoteA')).toBe(module);
        expect((globalThis as any).remoteA).toBe(container);
        expect(container.__webpack_clear_cache__).not.toHaveBeenCalled();
      } finally {
        delete (globalThis as any).remoteA;
      }
    },
  );

  test('rejects an empty remote name', async () => {
    const { runtime } = fixture();
    await expect(
      clearCache({ webpackRequire: runtime, name: '' }),
    ).rejects.toThrow('requires a remote name');
  });

  test('passes bridge loading promises to native and resets only bridge records', async () => {
    const { runtime } = fixture();
    const pending = deferred();
    const mapping =
      runtime.federation.bundlerRuntimeOptions.remotes!
        .idToExternalAndNameMapping[101];
    mapping.p = pending.promise;
    const clear = clearCache({ webpackRequire: runtime, name: 'remoteA' });
    expect(runtime.remoteCache!.clear).toHaveBeenCalledWith(
      expect.arrayContaining(['remoteA']),
      { pending: [pending.promise], reset: expect.any(Function) },
    );
    expect(mapping.p).toBeUndefined();
    let settled = false;
    void clear.then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);
    pending.promise.then(() => {
      mapping.p = 1;
    });
    pending.resolve();
    await clear;
    expect(mapping.p).toBeUndefined();
  });

  test('gates loadRemote and bundled remote loads while clearing', async () => {
    const { instance, runtime } = fixture();
    const originalLoad = instance.loadRemote;
    const bundledLoad = jest.fn();
    runtime.federation.bundlerRuntime.remotes = bundledLoad;
    runtime.remotesLoadingData!.chunkMapping = { 10: [101] };
    const pending = deferred();
    runtime.federation.bundlerRuntimeOptions.remotes!.idToExternalAndNameMapping[101].p =
      pending.promise;
    (runtime.remoteCache!.wait as jest.Mock).mockReturnValue(pending.promise);
    (runtime.remoteCache!.waitForChunk as jest.Mock).mockReturnValue(
      pending.promise,
    );
    installNodeCacheRuntime(runtime);
    const dispose = installClearCache({ webpackRequire: runtime })!;
    const clear = runtime.federation.clearCache!({ name: 'remoteA' });
    const load = instance.loadRemote('aliasA/Button');
    const promises: Promise<unknown>[] = [];
    runtime.federation.bundlerRuntime.remotes({
      webpackRequire: runtime,
      chunkId: 10,
      promises,
    } as any);
    expect(originalLoad).not.toHaveBeenCalled();
    expect(bundledLoad).not.toHaveBeenCalled();
    expect(runtime.remoteCache!.wait).toHaveBeenCalledWith(
      expect.arrayContaining(['remoteA', 'aliasA']),
    );
    expect(runtime.remoteCache!.waitForChunk).toHaveBeenCalledWith(10);
    pending.resolve();
    await clear;
    await load;
    await Promise.all(promises);
    expect(originalLoad).toHaveBeenCalledTimes(1);
    expect(bundledLoad).toHaveBeenCalledTimes(1);
    dispose();
  });

  test('rejects unsupported compiled remotes but supports pure-runtime hosts', async () => {
    const { runtime } = fixture();
    delete runtime.remoteCache;
    await expect(
      clearCache({ webpackRequire: runtime, name: 'remoteA' }),
    ).rejects.toThrow('native bundler remoteCache support');
    delete runtime.remotesLoadingData;
    runtime.federation.bundlerRuntimeOptions.remotes!.idToRemoteMap = {};
    await expect(
      clearCache({ webpackRequire: runtime, name: 'remoteA' }),
    ).resolves.toEqual({ name: 'remoteA', cleared: true });
  });

  test('restores bridge loading records when native cleanup rejects', async () => {
    const { runtime } = fixture();
    const mapping =
      runtime.federation.bundlerRuntimeOptions.remotes!
        .idToExternalAndNameMapping[101];
    mapping.p = Promise.resolve() as any;
    const promise = mapping.p;
    (runtime.remoteCache!.clear as jest.Mock).mockImplementation(
      async (_keys, loading) => {
        loading.reset();
        throw Error('chunk cleanup failed');
      },
    );
    await expect(
      clearCache({ webpackRequire: runtime, name: 'remoteA' }),
    ).rejects.toThrow('chunk cleanup failed');
    expect(mapping.p).toBe(promise);
  });
});

describe('cache adapter lifecycle', () => {
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

  test('restores exact methods and rejects saved clear entry points after detach', async () => {
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

  test('preserves third-party wrappers without reviving a detached adapter', async () => {
    const { instance, runtime } = fixture();
    const original = instance.loadRemote;
    const dispose = installClearCache({ webpackRequire: runtime })!;
    const ours = instance.loadRemote;
    const thirdParty = jest.fn((...args: any[]) => ours(...args));
    instance.loadRemote = thirdParty;
    dispose();
    const again = installClearCache({ webpackRequire: runtime })!;
    await instance.loadRemote('remoteA/Button');
    again();
    expect(instance.loadRemote).toBe(thirdParty);
    await instance.loadRemote('remoteA/Other');
    expect(original).toHaveBeenCalledTimes(2);
    expect(thirdParty).toHaveBeenCalledTimes(2);
  });

  test('routes removal to all bindings across bundled copies and releases each independently', async () => {
    const { instance, runtime: first } = fixture();
    const { runtime: second } = fixture(instance);
    const disposeFirst = installClearCache({ webpackRequire: first })!;
    const wrapped = instance.loadRemote;
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
    expect(instance.loadRemote).toBe(wrapped);
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
    const firstLoad = first.loadRemote;
    const secondLoad = second.loadRemote;
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
    expect(first.loadRemote).not.toBe(firstLoad);
    plugin().dispose({ origin: first });
    expect(first.loadRemote).toBe(firstLoad);
    expect(runtime.federation.instance).toBe(second);
    await runtime.federation.clearCache!({ name: 'remoteA' });
    siblingDispose();
    runtime.federation.disposeClearCache!();
    expect(second.loadRemote).toBe(secondLoad);
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

  test('keeps force registration synchronous and coordinates explicit updates across attached bindings', async () => {
    const remote = { name: 'remoteA', entry: 'https://example.test/old.js' };
    const instance = new ModuleFederation({
      name: 'multi-bundler',
      remotes: [remote],
      plugins: [plugin()],
    });
    const { runtime: first } = fixture(instance);
    const { runtime: second } = fixture(instance);
    const disposeFirst = installClearCache({ webpackRequire: first })!;
    const disposeSecond = installClearCache({ webpackRequire: second })!;
    const clear = jest.spyOn(first.federation, 'clearCache');
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      expect(
        instance.registerRemotes(
          [{ ...remote, entry: 'https://example.test/force.js' }],
          { force: true },
        ),
      ).toBeUndefined();
      expect(clear).not.toHaveBeenCalled();
      const next = { ...remote, entry: 'https://example.test/new.js' };
      await instance.updateRemotes([next]);
      for (const runtime of [first, second])
        expect(
          runtime.federation.bundlerRuntimeOptions.remotes!.remoteInfos!
            .remoteA[0].entry,
        ).toBe(next.entry);
      disposeFirst();
      await instance.updateRemotes([
        { ...remote, entry: 'https://example.test/final.js' },
      ]);
      expect(
        first.federation.bundlerRuntimeOptions.remotes!.remoteInfos!.remoteA[0]
          .entry,
      ).toBe(next.entry);
      expect(
        second.federation.bundlerRuntimeOptions.remotes!.remoteInfos!.remoteA[0]
          .entry,
      ).toBe('https://example.test/final.js');
    } finally {
      warn.mockRestore();
      disposeFirst();
      disposeSecond();
    }
  });
});
