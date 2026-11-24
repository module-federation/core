import { describe, expect, it, rs } from '@rstest/core';
import { ModuleFederation } from './runtimeTestUtils';
import { Module, helpers } from '../../../runtime-core/src';
import {
  installClearCache,
  installNodeCacheRuntime,
} from '../../../webpack-bundler-runtime/src/clearCache';

const entry = 'https://example.test/remote.js';
function createHost() {
  const host = new ModuleFederation({
    name: 'node-cache-host',
    remotes: [{ name: 'provider', alias: 'registered', entry }],
  });
  const remoteInfo = {
    name: 'provider',
    alias: 'registered',
    buildVersion: '1',
    entry,
    type: 'global' as const,
    shareScope: 'default',
    entryGlobalName: '__resolved_container__',
  };
  const clearContainer = rs.fn(() => true);
  const container = {
    init() {},
    get: async () => () => 'loaded',
  };
  const containerClearers: WeakMap<
    object,
    (preserveShared: boolean) => boolean
  > = ((globalThis as any)[
    Symbol.for('module-federation.clear-cache.containers')
  ] ||= new WeakMap());
  containerClearers.set(container.get, clearContainer);
  const module = new Module({ host, remoteInfo });
  module.remoteEntryExports = container;
  host.moduleCache.set('provider', module);
  const runtime: any = {
    federation: {
      instance: host,
      bundlerRuntimeOptions: {
        remotes: {
          remoteInfos: { registered: [remoteInfo] },
          idToRemoteMap: {},
          idToExternalAndNameMapping: {},
        },
      },
    },
    m: { 101: () => {} },
    c: { 101: { exports: 'cached' }, 201: { exports: container } },
  };
  runtime.remotesLoadingData = {
    moduleIdToRemoteDataMapping: {
      101: { remoteName: 'registered', externalModuleId: 201 },
    },
    cache: {
      moduleIdToParentModuleIds: {},
      modules: runtime.c,
      factories: runtime.m,
    },
  };
  const dispose = installClearCache({ webpackRequire: runtime })!;
  return {
    host,
    remoteInfo,
    container,
    clearContainer,
    module,
    runtime,
    dispose,
  };
}

describe('Node runtime and bundler lifecycle integration', () => {
  it('removes resolved container state and clears compiled modules without deleting a registration-named business global', async () => {
    const { host, remoteInfo, container, clearContainer, runtime, dispose } =
      createHost();
    const globals = globalThis as any;
    const business = {};
    globals.registered = business;
    globals[remoteInfo.entryGlobalName] = container;
    try {
      await host.removeRemote('registered');
      expect(host.moduleCache.has('provider')).toBe(false);
      expect(host.options.remotes).toHaveLength(0);
      expect(runtime.c[101]).toBeUndefined();
      expect(runtime.c[201]).toBeUndefined();
      expect(runtime.m[101]).toBeUndefined();
      expect(globals.registered).toBe(business);
      expect(globals[remoteInfo.entryGlobalName]).toBeUndefined();
      expect(clearContainer).toHaveBeenCalledWith(false);
    } finally {
      dispose();
      delete globals.registered;
      delete globals[remoteInfo.entryGlobalName];
    }
  });

  it.each(['entry-hook', 'bundler-clear'])(
    'a failed %s leaves the remote registered and preserves another publication',
    async (failure) => {
      const {
        host,
        remoteInfo,
        module,
        container,
        clearContainer,
        runtime,
        dispose,
      } = createHost();
      const globals = globalThis as any;
      const first = new ModuleFederation({
        name: 'provider',
        id: 'provider:1',
      });
      const second = new ModuleFederation({
        name: 'provider',
        id: 'provider:2',
      });
      helpers.global.setGlobalFederationInstance(first);
      const newContainer = { get() {} };
      const newLoading = Promise.resolve(newContainer);
      const loading = globals.__GLOBAL_LOADING_REMOTE_ENTRY__;
      const key = helpers.utils.getRemoteEntryUniqueKey(remoteInfo);
      loading[key] = Promise.resolve(container);
      globals[remoteInfo.entryGlobalName] = container;
      const publishAndFail = () => {
        helpers.global.setGlobalFederationInstance(second);
        globals[remoteInfo.entryGlobalName] = newContainer;
        loading[key] = newLoading;
        throw Error('clear failed after publication');
      };
      if (failure === 'entry-hook')
        clearContainer.mockImplementation(publishAndFail);
      else
        rs.spyOn(runtime.federation, 'clearCache').mockImplementationOnce(
          async () => publishAndFail(),
        );
      try {
        await expect(host.removeRemote('registered')).rejects.toThrow(
          'clear failed after publication',
        );
        expect(host.options.remotes[0].name).toBe('provider');
        expect(host.moduleCache.get('provider')).toBe(module);
        expect(globals.__FEDERATION__.__INSTANCES__).toContain(first);
        expect(globals.__FEDERATION__.__INSTANCES__).toContain(second);
        expect(globals[remoteInfo.entryGlobalName]).toBe(newContainer);
        expect(loading[key]).toBe(newLoading);
        clearContainer.mockReset();
        await host.removeRemote('registered');
        expect(host.moduleCache.has('provider')).toBe(false);
        expect(globals[remoteInfo.entryGlobalName]).toBe(newContainer);
      } finally {
        dispose();
        delete globals[remoteInfo.entryGlobalName];
      }
    },
  );

  it('drains in-flight loads before clearing caches and holds new direct or compiled loads until replacement finishes', async () => {
    const { host, runtime, dispose } = createHost();
    let releaseOld!: () => void;
    const oldGate = new Promise<void>((resolve) => {
      releaseOld = resolve;
    });
    let releaseHook!: () => void;
    const hookGate = new Promise<void>((resolve) => {
      releaseHook = resolve;
    });
    const calls: string[] = [];
    const seenEntries: Array<string | undefined> = [];
    host.registerPlugins([
      {
        name: 'slow-remove',
        async removeRemote() {
          calls.push('remove');
          await hookGate;
        },
      },
    ]);
    const bundled = rs.fn(({ promises }: any) => {
      promises.push(
        oldGate.then(() => {
          calls.push('compiled');
          seenEntries.push(host.options.remotes[0]?.entry);
        }),
      );
    });
    runtime.federation.bundlerRuntime = {
      init: () => host,
      remotes: bundled,
    };
    installNodeCacheRuntime(runtime);
    const compiledLoad = () => {
      const promises: Promise<unknown>[] = [];
      runtime.federation.bundlerRuntime.remotes({
        webpackRequire: runtime,
        chunkId: 10,
        chunkMapping: { 10: [101] },
        promises,
      });
      return Promise.all(promises);
    };
    let update: Promise<void> | undefined;
    try {
      const firstCompiled = compiledLoad();
      update = host.updateRemotes([
        {
          name: 'provider',
          alias: 'registered',
          entry: 'https://example.test/v2.js',
        },
      ]);
      const secondCompiled = compiledLoad();
      expect(bundled).toHaveBeenCalledTimes(1);
      expect(calls).toEqual([]);
      releaseOld();
      await firstCompiled;
      expect(seenEntries).toEqual([entry]);
      await rs.waitFor(() => expect(calls).toEqual(['compiled', 'remove']));
      expect(bundled).toHaveBeenCalledTimes(1);
      releaseHook();
      await update;
      await secondCompiled;
      expect(seenEntries).toEqual([entry, 'https://example.test/v2.js']);
      expect(bundled).toHaveBeenCalledTimes(2);
    } finally {
      releaseOld();
      releaseHook();
      await update?.catch(() => {});
      dispose();
    }
  });
});
