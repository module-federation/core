import { describe, expect, it } from '@rstest/core';
import { ModuleFederation } from '../src/core';
import type { ShareArgs } from '../src/type';
import { setGlobalFederationInstance } from '../src/global';
import { Module } from '../src/module';
import type { ModuleInfo } from '@module-federation/sdk';
import { generatePreloadAssets } from '../src/plugins/generate-preload-assets';
import { defaultPreloadArgs } from '../src/utils/preload';

const provider = (
  value: string,
  layer?: string,
  version = '1.0.0',
): ShareArgs => ({
  version,
  scope: 'default',
  shareConfig: { layer, requiredVersion: false },
  get: () => () => value,
});
const consume = (layer?: string, config = {}) => ({
  customShareInfo: {
    scope: ['default'],
    shareConfig: { requiredVersion: false as const, layer, ...config },
  },
});
const host = (shared: ShareArgs[], name = 'layer-host') =>
  new ModuleFederation({ name, remotes: [], shared: { pkg: shared } });

describe('shared layer selection', () => {
  for (const asyncFactory of [false, true]) {
    it(`loads legacy scope entries without shareConfig (async=${asyncFactory})`, async () => {
      const mf = new ModuleFederation({ name: 'legacy-consumer', remotes: [] });
      mf.initShareScopeMap('default', {});
      Object.assign(mf.shareScopeMap.default, {
        pkg: {
          '1.0.0': {
            get: () =>
              asyncFactory ? Promise.resolve(() => 'legacy') : () => 'legacy',
          },
        },
      });
      const get = asyncFactory
        ? await mf.loadShare('pkg', consume())
        : mf.loadShareSync('pkg', consume());
      expect(get && get()).toBe('legacy');
    });
  }

  for (const reverse of [false, true]) {
    for (const asyncFactory of [false, true]) {
      it(`isolates same-version factories (reverse=${reverse}, async=${asyncFactory})`, async () => {
        const configs = [
          provider('server', 'server'),
          provider('client', 'client'),
        ];
        if (reverse) configs.reverse();
        if (asyncFactory)
          configs.forEach((config) => {
            const get = config.get!;
            config.get = async () => get();
          });
        const mf = host(configs);
        for (const layer of ['server', 'client']) {
          const get = asyncFactory
            ? await mf.loadShare('pkg', consume(layer))
            : mf.loadShareSync('pkg', consume(layer));
          expect(get && get()).toBe(layer);
        }
      });
    }
  }

  it('preserves variants across repeated initOptions', () => {
    const mf = host([provider('server', 'server')]);
    mf.initOptions({
      name: mf.name,
      remotes: [],
      shared: { pkg: provider('client', 'client') },
    });
    expect(mf.loadShareSync('pkg', consume('server'))()).toBe('server');
    expect(mf.loadShareSync('pkg', consume('client'))()).toBe('client');
  });

  it('prefers exact layer and only falls back to unlayered when it is absent', () => {
    const mf = host([
      provider('generic'),
      provider('client', 'client'),
      provider('server', 'server'),
    ]);
    expect(mf.loadShareSync('pkg', consume('server'))()).toBe('server');
    expect(mf.loadShareSync('pkg', consume('missing'))()).toBe('generic');
    expect(mf.loadShareSync('pkg', consume())()).toBe('generic');
  });

  it('does not expose a layered-only package as an empty legacy version map', async () => {
    const mf = host([provider('server', 'server')]);
    await Promise.all(mf.initializeSharing('default'));
    expect(Object.keys(mf.shareScopeMap.default)).toEqual([]);
    expect(await mf.loadShare('pkg', consume())).toBe(false);
  });

  it('does not use unlayered when an exact layer has incompatible versions', async () => {
    const mf = host([
      provider('generic-v2', undefined, '2.0.0'),
      provider('server-v1', 'server'),
    ]);
    const consumer = new ModuleFederation({ name: 'consumer', remotes: [] });
    await Promise.all(mf.initializeSharing('default'));
    consumer.initShareScopeMap('default', mf.shareScopeMap.default);
    expect(
      await consumer.loadShare(
        'pkg',
        consume('server', { requiredVersion: '^2.0.0' }),
      ),
    ).toBe(false);
  });

  it('negotiates versions and singletons independently in each layer', () => {
    const mf = host([
      provider('server-v1', 'server'),
      provider('server-v2', 'server', '2.0.0'),
      provider('client-v3', 'client', '3.0.0'),
    ]);
    expect(
      mf.loadShareSync('pkg', consume('server', { singleton: true }))(),
    ).toBe('server-v2');
    expect(
      mf.loadShareSync('pkg', consume('client', { singleton: true }))(),
    ).toBe('client-v3');
    expect(
      mf.loadShareSync(
        'pkg',
        consume('server', { requiredVersion: '^1.0.0' }),
      )(),
    ).toBe('server-v1');
    expect(() =>
      mf.loadShareSync(
        'pkg',
        consume('server', {
          singleton: true,
          strictVersion: true,
          requiredVersion: '^3.0.0',
        }),
      ),
    ).toThrow('does not satisfy');
  });

  it('keeps loaded-first singleton state within its layer', () => {
    const mf = host([
      provider('server-v1', 'server'),
      provider('server-v2', 'server', '2.0.0'),
      provider('client-v3', 'client', '3.0.0'),
    ]);
    expect(
      mf.loadShareSync(
        'pkg',
        consume('server', { requiredVersion: '^1.0.0' }),
      )(),
    ).toBe('server-v1');
    expect(
      mf.loadShareSync('pkg', {
        ...consume('server', { singleton: true }),
        customShareInfo: {
          ...consume('server', { singleton: true }).customShareInfo,
          strategy: 'loaded-first',
        },
      })(),
    ).toBe('server-v1');
    expect(
      mf.loadShareSync('pkg', consume('client', { singleton: true }))(),
    ).toBe('client-v3');
  });

  it('transfers layer variants by the existing share-scope object reference', async () => {
    const mf = host(
      [
        provider('server', 'server'),
        provider('client', 'client'),
        provider('generic'),
      ],
      'provider',
    );
    const consumer = new ModuleFederation({ name: 'consumer', remotes: [] });
    await Promise.all(mf.initializeSharing('default'));
    consumer.initShareScopeMap('default', mf.shareScopeMap.default);
    expect(consumer.loadShareSync('pkg', consume('server'))()).toBe('server');
    expect(consumer.loadShareSync('pkg', consume('client'))()).toBe('client');
    expect(consumer.loadShareSync('pkg', consume())()).toBe('generic');
    expect(Object.keys(mf.shareScopeMap.default.pkg)).toEqual(['1.0.0']);
  });

  it('removes loaded and unloaded layer variants when an unused remote is replaced', async () => {
    const mf = host(
      [provider('old-server', 'server'), provider('old-client', 'client')],
      'replace-provider',
    );
    setGlobalFederationInstance(mf);
    expect(mf.loadShareSync('pkg', consume('server'))()).toBe('old-server');
    const remote = {
      name: mf.name,
      entry: 'https://remote.test/old.js',
      type: 'global' as const,
      entryGlobalName: 'replace_provider',
      shareScope: 'default',
    };
    const consumer = new ModuleFederation({
      name: 'replace-consumer',
      remotes: [remote],
      shareStrategy: 'loaded-first',
    });
    consumer.initShareScopeMap('default', mf.shareScopeMap.default);
    consumer.moduleCache.set(
      mf.name,
      new Module({ host: consumer, remoteInfo: remote }),
    );
    consumer.registerRemotes(
      [{ ...remote, entry: 'https://remote.test/new.js' }],
      { force: true },
    );
    expect(
      Object.getOwnPropertySymbols(consumer.shareScopeMap.default),
    ).toEqual([]);
    expect(await consumer.loadShare('pkg', consume('server'))).toBe(false);
    expect(await consumer.loadShare('pkg', consume('client'))).toBe(false);
    const replacement = host(
      [provider('new-server', 'server'), provider('new-client', 'client')],
      mf.name,
    );
    await Promise.all(replacement.initializeSharing('default'));
    consumer.initShareScopeMap('default', replacement.shareScopeMap.default);
    expect(consumer.loadShareSync('pkg', consume('server'))()).toBe(
      'new-server',
    );
    expect(consumer.loadShareSync('pkg', consume('client'))()).toBe(
      'new-client',
    );
  });

  it('only suppresses preload assets belonging to the loaded shared layer', () => {
    const mf = host([
      provider('server', 'server'),
      provider('client', 'client'),
    ]);
    expect(mf.loadShareSync('pkg', consume('server'))()).toBe('server');
    const asset = (layer: string) => `${layer}.js`;
    const assets = (sync: string[]) => ({
      js: { sync, async: [] },
      css: { sync: [], async: [] },
    });
    const snapshot: ModuleInfo = {
      version: '1.0.0',
      buildVersion: '1',
      publicPath: 'https://remote.test/',
      remoteEntry: 'remoteEntry.js',
      remoteEntryType: 'global',
      globalName: 'asset_remote',
      remoteTypes: '',
      remoteTypesZip: '',
      remotesInfo: {},
      shared: ['server', 'client'].map((layer) => ({
        sharedName: 'pkg',
        version: '1.0.0',
        layer,
        shareScope: 'default',
        assets: assets([asset(layer)]),
      })),
      modules: [
        {
          moduleName: 'view',
          assets: assets([asset('server'), asset('client')]),
        },
      ],
    };
    const remote = {
      name: 'asset-remote',
      entry: 'https://remote.test/mf-manifest.json',
      type: 'global' as const,
      shareScope: 'default',
      entryGlobalName: 'asset_remote',
    };
    const result = generatePreloadAssets(
      mf,
      {
        remote,
        preloadConfig: defaultPreloadArgs({
          nameOrAlias: remote.name,
          depsRemote: false,
        }),
      },
      remote,
      {},
      snapshot,
    );
    expect(result.jsAssetsWithoutEntry).toEqual([
      'https://remote.test/client.js',
    ]);
  });
});
