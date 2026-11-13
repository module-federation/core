import { describe, expect, it, rs } from '@rstest/core';
import { ModuleFederation } from './runtimeTestUtils';
import { Module, helpers } from '../../../runtime-core/src';
import {
  CurrentGlobal,
  setGlobalFederationInstance,
} from '../../../runtime-core/src/global';
import type { RemoteInfo } from '../../../runtime-core/src/type';

const info = (buildVersion?: string): RemoteInfo => ({
  name: 'catalog',
  alias: 'registered-catalog',
  buildVersion,
  entry: 'https://example.test/fixed/entry.js',
  entryGlobalName: 'catalog-container',
  type: 'global',
  shareScope: 'default',
});

function provider(build: string, id = `catalog:${build}`) {
  const instance = new ModuleFederation({
    name: 'catalog',
    id,
    shared: {
      library: { version: build, lib: () => ({ build }) },
    },
  });
  setGlobalFederationInstance(instance);
  CurrentGlobal.__FEDERATION__.__SHARE__[instance.options.id!] =
    instance.shareScopeMap;
  return instance;
}

function consumer(build: string) {
  const remoteInfo = info(build);
  const host = new ModuleFederation({
    name: `consumer-${build}`,
    remotes: [
      {
        name: remoteInfo.name,
        alias: remoteInfo.alias,
        entry: remoteInfo.entry,
      },
    ],
  });
  let cleared = false;
  const container = {
    init(_share?: unknown, _scope?: unknown, _options?: any) {},
    get: async () => {
      if (cleared) throw Error(`Cleared ${build} container`);
      return () => ({ build });
    },
    __webpack_clear_cache__: rs.fn(() => {
      cleared = true;
    }),
  };
  const module = new Module({ host, remoteInfo });
  module.remoteEntryExports = container;
  host.moduleCache.set(remoteInfo.name, module);
  setGlobalFederationInstance(host);
  return { host, container };
}

describe('provider build identity', () => {
  it.each(['update', 'force'] as const)(
    '%s retains a provider used by another host until its last consumer removes it',
    async (mode) => {
      const runtime = provider('2');
      const dispose = rs.fn();
      runtime.registerPlugins([{ name: 'observe-dispose', dispose }]);
      const a = consumer('2');
      const b = consumer('2');
      b.host.moduleCache.get(info('2').name)!.remoteEntryExports = a.container;
      await expect(
        b.host.loadRemote('registered-catalog/Button'),
      ).resolves.toEqual({ build: '2' });
      const replacement = { name: info('2').name, entry: info('3').entry };
      if (mode === 'update') await a.host.updateRemotes([replacement]);
      else a.host.registerRemotes([replacement], { force: true });
      expect(CurrentGlobal.__FEDERATION__.__INSTANCES__).toContain(runtime);
      expect(a.container.__webpack_clear_cache__).not.toHaveBeenCalled();
      await a.host.destroy();
      const lastOwnerProvider = helpers.global.getRemoteFederationInstance(
        b.host.moduleCache.get(info('2').name)!.remoteInfo,
      );
      expect(lastOwnerProvider).toBe(runtime);
      await expect(
        b.host.loadRemote('registered-catalog/Another'),
      ).resolves.toEqual({ build: '2' });
      await b.host.removeRemote(info('2').name);
      expect(a.container.__webpack_clear_cache__).toHaveBeenCalled();
      await lastOwnerProvider!.destroy();
      await b.host.destroy();
      expect(dispose).toHaveBeenCalledTimes(1);
      expect(CurrentGlobal.__FEDERATION__.__INSTANCES__).not.toContain(runtime);
      expect(
        CurrentGlobal.__FEDERATION__.__SHARE__['catalog:2'],
      ).toBeUndefined();
    },
  );

  it('resolves the exact provider build independently of registration and manifest URLs', () => {
    const first = provider('1');
    const second = provider('2');
    const resolve = helpers.global.getRemoteFederationInstance;
    expect(resolve(info('1'), [second, first, first])).toBe(first);
    expect(resolve(info('missing'), [first, second])).toBeUndefined();
    const alias = new ModuleFederation({
      name: 'registered-catalog',
      id: 'registered-catalog:1',
    });
    expect(resolve(info('1'), [alias])).toBeUndefined();
    const containerGlobal = new ModuleFederation({
      name: 'catalog-container',
      id: 'catalog-container:1',
    });
    expect(resolve(info('1'), [containerGlobal])).toBeUndefined();
    expect(
      resolve({ ...info('1'), entry: 'https://mirror.test/entry.js' }),
    ).toBe(first);
    const duplicate = provider('1');
    expect(resolve(info('1'))).toBe(duplicate);
    expect(CurrentGlobal.__FEDERATION__.__INSTANCES__).not.toContain(first);
    expect(CurrentGlobal.__FEDERATION__.__INSTANCES__).toContain(second);
    const runtime = new ModuleFederation({ name: 'catalog', id: '' });
    expect(resolve(info(), [runtime])).toBe(runtime);
  });

  it.each(['remove', 'force'] as const)(
    '%s releases only the selected provider build and leaves the other usable',
    async (mode) => {
      const first = provider('1');
      const second = provider('2');
      const a = consumer('1');
      const b = consumer('2');
      const loading = CurrentGlobal.__GLOBAL_LOADING_REMOTE_ENTRY__;
      const firstKey = helpers.utils.getRemoteEntryUniqueKey(info('1'));
      const secondKey = helpers.utils.getRemoteEntryUniqueKey(info('2'));
      const legacyKey = `${info('1').name}:${info('1').entry}`;
      const secondLoad = Promise.resolve(b.container);
      const legacyLoad = Promise.resolve({});
      loading[firstKey] = Promise.resolve(a.container);
      loading[secondKey] = secondLoad;
      loading[legacyKey] = legacyLoad;
      const shared = second.shareScopeMap.default.library['2'];
      const useIn = [...shared.useIn];
      const snapshot = {
        buildVersion: '2',
        version: info('2').entry,
        remoteEntry: 'entry.js',
      };
      const snapshotKey = `${info('2').name}:${info('2').entry}`;
      CurrentGlobal.__FEDERATION__.moduleInfo[snapshotKey] = snapshot as any;
      (globalThis as any)['catalog-container'] = b.container;
      try {
        if (mode === 'remove') await a.host.removeRemote(info('1').name);
        else
          a.host.registerRemotes(
            [{ name: info('1').name, entry: 'https://example.test/next.js' }],
            { force: true },
          );
        expect(CurrentGlobal.__FEDERATION__.__INSTANCES__).not.toContain(first);
        expect(CurrentGlobal.__FEDERATION__.__INSTANCES__).toContain(second);
        expect(second.shareScopeMap.default.library['2']).toBe(shared);
        expect(shared.useIn).toEqual(useIn);
        expect(shared.from).toBe('catalog');
        expect(CurrentGlobal.__FEDERATION__.moduleInfo[snapshotKey]).toBe(
          snapshot,
        );
        expect((globalThis as any)['catalog-container']).toBe(b.container);
        expect(b.container.__webpack_clear_cache__).not.toHaveBeenCalled();
        expect(loading[firstKey]).toBeUndefined();
        expect(loading[secondKey]).toBe(secondLoad);
        expect(loading[legacyKey]).toBe(legacyLoad);
        await expect(
          b.host.loadRemote('registered-catalog/Button'),
        ).resolves.toEqual({ build: '2' });
        expect(second.loadShareSync<{ build: string }>('library')()).toEqual({
          build: '2',
        });
      } finally {
        delete (globalThis as any)['catalog-container'];
      }
    },
  );

  it('removes a duplicated build without leaving another registry entry', async () => {
    const first = provider('1');
    const duplicate = provider('1');
    const { host, container } = consumer('1');
    await host.removeRemote(info('1').name);
    expect(host.options.remotes).toHaveLength(0);
    expect(host.moduleCache.has(info('1').name)).toBe(false);
    expect(container.__webpack_clear_cache__).toHaveBeenCalled();
    expect(CurrentGlobal.__FEDERATION__.__INSTANCES__).not.toContain(first);
    expect(CurrentGlobal.__FEDERATION__.__INSTANCES__).not.toContain(duplicate);
  });

  it('destroys one same-name build without removing the peer shared owner', async () => {
    const first = provider('1');
    const second = provider('2');
    const record = second.shareScopeMap.default.library['2'];
    record.useIn.push('catalog');
    const useIn = [...record.useIn];
    await first.destroy();
    expect(first.options.shared).toEqual({});
    expect(CurrentGlobal.__FEDERATION__.__INSTANCES__).not.toContain(first);
    expect(CurrentGlobal.__FEDERATION__.__INSTANCES__).toContain(second);
    expect(record.useIn).toEqual(useIn);
    expect(second.shareScopeMap.default.library['2']).toBe(record);
    expect(second.loadShareSync<{ build: string }>('library')()).toEqual({
      build: '2',
    });
    await second.destroy();
    expect(CurrentGlobal.__FEDERATION__.__INSTANCES__).not.toContain(second);
    expect(CurrentGlobal.__FEDERATION__.__SHARE__['catalog:1']).toBeUndefined();
    expect(CurrentGlobal.__FEDERATION__.__SHARE__['catalog:2']).toBeUndefined();
  });

  it('releases retired scopes when same-name builds close concurrently', async () => {
    const first = provider('1');
    const second = provider('2');
    first.shareScopeMap.default.library['1'].useIn.push('catalog');
    second.shareScopeMap.default.library['2'].useIn.push('catalog');
    await Promise.all([first.destroy(), second.destroy()]);
    expect(CurrentGlobal.__FEDERATION__.__SHARE__['catalog:1']).toBeUndefined();
    expect(CurrentGlobal.__FEDERATION__.__SHARE__['catalog:2']).toBeUndefined();
  });
});
