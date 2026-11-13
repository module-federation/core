import { describe, expect, it, rs } from '@rstest/core';
import { ModuleFederation } from './runtimeTestUtils';
import { Module, helpers } from '../../../runtime-core/src';
import { installClearCache } from '../../../webpack-bundler-runtime/src/clearCache';

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
  const container = {
    init() {},
    get: async () => () => 'loaded',
    __webpack_clear_cache__: rs.fn(),
  };
  const module = new Module({ host, remoteInfo });
  module.remoteEntryExports = container;
  host.moduleCache.set('provider', module);
  const runtime: any = {
    remoteCache: {
      clear: rs.fn(async () => {}),
      wait() {},
      waitForChunk() {},
      hasPending: () => false,
    },
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
    remotesLoadingData: {
      remoteKeyToRemoteModuleIds: { registered: [101] },
      remoteKeyToExternalModuleIds: { registered: [201] },
      remoteKeyToChunkIds: { registered: [10] },
    },
    m: { 101: () => {} },
    c: { 101: { exports: 'cached' }, 201: { exports: container } },
  };
  const dispose = installClearCache({ webpackRequire: runtime })!;
  return { host, remoteInfo, container, module, runtime, dispose };
}

describe('Node runtime and bundler lifecycle integration', () => {
  it('removes resolved container state and invokes native invalidation without deleting a registration-named business global', async () => {
    const { host, remoteInfo, container, runtime, dispose } = createHost();
    const globals = globalThis as any;
    const business = {};
    globals.registered = business;
    globals[remoteInfo.entryGlobalName] = container;
    try {
      await host.removeRemote('registered');
      expect(host.moduleCache.has('provider')).toBe(false);
      expect(host.options.remotes).toHaveLength(0);
      expect(runtime.remoteCache.clear).toHaveBeenCalledWith(
        expect.arrayContaining(['registered']),
        expect.objectContaining({ reset: expect.any(Function) }),
      );
      expect(globals.registered).toBe(business);
      expect(globals[remoteInfo.entryGlobalName]).toBeUndefined();
      expect(container.__webpack_clear_cache__).toHaveBeenCalledTimes(1);
    } finally {
      dispose();
      delete globals.registered;
      delete globals[remoteInfo.entryGlobalName];
    }
  });

  it.each(['entry-hook', 'native-clear'])(
    'a failed %s leaves the remote registered and preserves another publication',
    async (failure) => {
      const { host, remoteInfo, module, container, runtime, dispose } =
        createHost();
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
        container.__webpack_clear_cache__.mockImplementation(publishAndFail);
      else
        runtime.remoteCache.clear.mockImplementationOnce(async () =>
          publishAndFail(),
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
        container.__webpack_clear_cache__.mockReset();
        await host.removeRemote('registered');
        expect(host.moduleCache.has('provider')).toBe(false);
        expect(globals[remoteInfo.entryGlobalName]).toBe(newContainer);
      } finally {
        dispose();
        delete globals[remoteInfo.entryGlobalName];
      }
    },
  );
});
