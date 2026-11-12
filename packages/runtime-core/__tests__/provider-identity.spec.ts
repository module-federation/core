import { describe, expect, it, rs } from '@rstest/core';
import { ModuleFederation, Module, helpers } from '../src';
import { CurrentGlobal, setGlobalFederationInstance } from '../src/global';
import type { RemoteInfo } from '../src/type';

const info = (buildVersion?: string): RemoteInfo => ({
  name: 'registered-catalog',
  providerName: 'catalog',
  buildVersion,
  entry: `https://example.test/${buildVersion || 'runtime'}/entry.js`,
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
    remotes: [{ name: remoteInfo.name, entry: remoteInfo.entry }],
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
  it('binds the actual container runtime independently of its release or compilation ID', async () => {
    const first = provider('same-release', 'catalog:node:1');
    const second = provider('same-release', 'catalog:node:2');
    const a = consumer('manifest-a');
    const b = consumer('manifest-b');
    for (const [consumer, runtime] of [
      [a, first],
      [b, second],
    ] as const) {
      consumer.container.init = (_share, _scope, options) => {
        expect(Object.keys(options)).not.toContain(
          'module-federation.bind-provider',
        );
        options[Symbol.for('module-federation.bind-provider')](runtime);
      };
      await consumer.host.loadRemote('registered-catalog/Button');
      expect(
        helpers.global.getRemoteFederationInstance(
          consumer.host.moduleCache.get(info().name)!.remoteInfo,
          undefined,
          consumer.container,
        ),
      ).toBe(runtime);
    }
    const record = second.shareScopeMap.default.library['same-release'];
    await a.host.removeRemote(info().name);
    expect(a.container.__webpack_clear_cache__).toHaveBeenCalled();
    expect(b.container.__webpack_clear_cache__).not.toHaveBeenCalled();
    expect(CurrentGlobal.__FEDERATION__.__INSTANCES__).toContain(second);
    expect(second.shareScopeMap.default.library['same-release']).toBe(record);
    await expect(
      b.host.loadRemote('registered-catalog/Another'),
    ).resolves.toEqual({ build: 'manifest-b' });
    await b.host.removeRemote(info().name);
  });

  it('uses the manifest URL when adopting a retained provider before loading an expose', async () => {
    const runtime = provider('release', 'catalog:node:1');
    const other = provider('release', 'catalog:node:2');
    const a = consumer('manifest');
    const remoteInfo = a.host.moduleCache.get(info().name)!.remoteInfo;
    remoteInfo.version = 'https://one.test/mf-manifest.json';
    a.container.init = (_share, _scope, options) =>
      options[Symbol.for('module-federation.bind-provider')](runtime);
    await a.host.loadRemote('registered-catalog/Button');
    const selected = {
      ...info('manifest'),
      entry: undefined,
      version: remoteInfo.version,
    };
    expect(helpers.global.getRemoteFederationInstance(selected)).toBe(runtime);
    expect(
      helpers.global.getRemoteFederationInstance({
        ...selected,
        version: 'https://two.test/mf-manifest.json',
      }),
    ).toBeUndefined();
    expect(
      helpers.global.getRemoteFederationInstance(
        remoteInfo,
        [other],
        a.container,
      ),
    ).toBeUndefined();
  });

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

  it('resolves the manifest provider build and rejects ambiguous instances', () => {
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
    expect(() => resolve(info(), [first, second])).toThrow('Ambiguous');
    const duplicate = provider('1');
    expect(() => resolve(info('1'), [first, duplicate])).toThrow('Ambiguous');
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

  it('rejects ambiguous removal before changing registrations or containers', async () => {
    provider('1');
    provider('1');
    const { host, container } = consumer('1');
    await expect(host.removeRemote(info('1').name)).rejects.toThrow(
      'Ambiguous',
    );
    expect(host.options.remotes).toHaveLength(1);
    expect(host.moduleCache.has(info('1').name)).toBe(true);
    expect(container.__webpack_clear_cache__).not.toHaveBeenCalled();
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
