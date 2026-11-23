import { describe, expect, it } from '@rstest/core';
import type {
  GlobalModuleInfo,
  Manifest,
  ProviderModuleInfo,
} from '@module-federation/sdk';
import { ModuleFederation } from './runtimeTestUtils';
import { Module, helpers } from '../../../runtime-core/src';
import { installClearCache } from '../../../webpack-bundler-runtime/src/clearCache';
import {
  applyNodeGlobalModuleInfo,
  diffNodeGlobalModuleInfo,
  manifestFingerprint,
  moduleInfoFingerprint,
  resolveTargetModuleInfo,
} from '../lifecycle';

function makeManifest(version: string): Manifest {
  return {
    id: 'provider_a',
    name: 'provider_a',
    metaData: {
      name: 'provider_a',
      type: 'app',
      buildInfo: { buildVersion: version, buildName: 'provider_a' },
      publicPath: `https://cdn.example.test/${version}/`,
      ssrPublicPath: `https://ssr.example.test/${version}/`,
      remoteEntry: {
        name: 'remoteEntry.js',
        path: '',
        type: 'global',
      },
      ssrRemoteEntry: {
        name: 'ssr/remoteEntry.js',
        path: '',
        type: 'commonjs-module',
      },
      types: { path: '', name: '', zip: '', api: '' },
      globalName: 'provider_a',
      pluginVersion: '2.0.0',
    },
    shared: [],
    remotes: [],
    exposes: [
      {
        id: 'provider_a:Widget',
        name: 'Widget',
        path: './Widget',
        assets: {
          js: { sync: [`widget.${version}.js`], async: [] },
          css: { sync: [], async: [] },
        },
      },
    ],
  };
}

function makeProviderInfo(
  name: string,
  version: string,
  extra: Record<string, unknown> = {},
): ProviderModuleInfo {
  return {
    version,
    buildVersion: version,
    globalName: name,
    remoteEntry: 'remoteEntry.js',
    remoteEntryType: 'global',
    ssrRemoteEntry: 'ssr/remoteEntry.js',
    ssrRemoteEntryType: 'commonjs-module',
    publicPath: `https://cdn.example.test/${name}/${version}/`,
    ssrPublicPath: `https://ssr.example.test/${name}/${version}/`,
    remoteTypes: '',
    remoteTypesZip: '',
    remotesInfo: {},
    shared: [],
    modules: [
      {
        moduleName: 'Widget',
        modulePath: './Widget',
        assets: {
          js: { sync: [`widget.${version}.js`], async: [] },
          css: { sync: [], async: [] },
        },
      },
    ],
    ...extra,
  } as ProviderModuleInfo;
}

describe('Node snapshot fingerprinting and GlobalModuleInfo diffing', () => {
  it('enforces strict separation between raw manifest and resolved moduleInfo', () => {
    const manifest = makeManifest('1.0.0');
    const info = resolveTargetModuleInfo({
      entry: 'https://cdn.example.test/1.0.0/mf-manifest.json',
      manifest,
    })!;
    expect(info.buildVersion).toBe('1.0.0');
    expect(
      manifestFingerprint(
        manifest,
        'https://cdn.example.test/1.0.0/mf-manifest.json',
      ),
    ).toBe(moduleInfoFingerprint(info));

    // Mutable runtime bookkeeping must not affect the deployment fingerprint.
    expect(
      moduleInfoFingerprint({
        ...(info as unknown as Record<string, unknown>),
        consumerList: ['host:1.0.0'],
      }),
    ).toBe(moduleInfoFingerprint(info));

    // Passing a raw Manifest to moduleInfo or a ModuleInfo to manifest must throw.
    expect(() =>
      moduleInfoFingerprint(manifest as unknown as ProviderModuleInfo),
    ).toThrow(/not a raw Manifest/);
    expect(() =>
      manifestFingerprint(info as unknown as Manifest, 'entry'),
    ).toThrow(/metaData/);
    expect(() =>
      resolveTargetModuleInfo({
        entry: 'https://cdn.example.test/1.0.0/mf-manifest.json',
        manifest,
        moduleInfo: info,
      }),
    ).toThrow(/not both/);
  });

  it('classifies changed providers into loaded vs unloaded and updates unloaded moduleInfo without leaking old keys', () => {
    helpers.global.resetFederationGlobalInfo();
    const host = new ModuleFederation({
      name: 'host_app',
      remotes: [
        {
          name: 'provider_a',
          alias: 'providerA',
          entry: 'https://cdn.example.test/provider_a/mf-manifest.json',
        },
        {
          name: 'provider_b',
          alias: 'providerB',
          entry: 'https://cdn.example.test/provider_b/mf-manifest.json',
        },
      ],
    });

    const initialGlobal: GlobalModuleInfo = {
      host_app: {
        version: '1.0.0',
        buildVersion: '1.0.0',
        remotesInfo: {
          provider_a: { matchedVersion: '1.0.0' },
          provider_b: { matchedVersion: '1.0.0' },
        },
        shared: [],
        consumerList: [],
      },
      'provider_a:1.0.0': makeProviderInfo('provider_a', '1.0.0'),
      'provider_b:1.0.0': makeProviderInfo('provider_b', '1.0.0'),
    };
    applyNodeGlobalModuleInfo(initialGlobal, { instances: [host] });

    // Simulate that ONLY provider_a has been loaded on the server; provider_b has never been loaded.
    const loadedMod = new Module({
      host,
      remoteInfo: {
        name: 'provider_a',
        alias: 'providerA',
        version: '1.0.0',
        buildVersion: '1.0.0',
        entry: 'https://ssr.example.test/provider_a/1.0.0/ssr/remoteEntry.js',
        type: 'commonjs-module',
        entryGlobalName: 'provider_a',
        shareScope: 'default',
      },
    });
    host.moduleCache.set('provider_a', loadedMod);

    const nextGlobal: GlobalModuleInfo = {
      host_app: {
        version: '1.0.0',
        buildVersion: '1.0.0',
        remotesInfo: {
          provider_a: { matchedVersion: '2.0.0' },
          provider_b: { matchedVersion: '2.0.0' },
        },
        shared: [],
        consumerList: [],
      },
      'provider_a:2.0.0': makeProviderInfo('provider_a', '2.0.0'),
      'provider_b:2.0.0': makeProviderInfo('provider_b', '2.0.0'),
    };

    const diff = diffNodeGlobalModuleInfo(nextGlobal, { instances: [host] });
    expect(diff.changed).toBe(true);
    expect(diff.loadedRemotes.map((item) => item.name)).toEqual(['provider_a']);
    expect(diff.unloadedRemotes.map((item) => item.name)).toEqual([
      'provider_b',
    ]);
    // Read-only diff must not mutate globalThis.__FEDERATION__.moduleInfo.
    expect(
      globalThis.__FEDERATION__.moduleInfo['provider_b:2.0.0'],
    ).toBeUndefined();

    // Updating only the unloaded remote updates GlobalModuleInfo and prunes provider_b:1.0.0.
    applyNodeGlobalModuleInfo(nextGlobal, {
      instances: [host],
      remoteNames: ['provider_b'],
    });
    expect(
      globalThis.__FEDERATION__.moduleInfo['provider_b:2.0.0'],
    ).toBeDefined();
    expect(
      globalThis.__FEDERATION__.moduleInfo['provider_b:1.0.0'],
    ).toBeUndefined();
    expect(
      globalThis.__FEDERATION__.moduleInfo['provider_a:1.0.0'],
    ).toBeDefined();

    // Once provider_a is also updated and its moduleCache refreshed, the full diff settles to false.
    host.moduleCache.delete('provider_a');
    applyNodeGlobalModuleInfo(nextGlobal, { instances: [host] });
    expect(
      globalThis.__FEDERATION__.moduleInfo['provider_a:1.0.0'],
    ).toBeUndefined();
    expect(
      diffNodeGlobalModuleInfo(nextGlobal, { instances: [host] }).changed,
    ).toBe(false);
  });

  it('detects compiled static bundler consumption as loaded even before moduleCache is populated', () => {
    helpers.global.resetFederationGlobalInfo();
    const host = new ModuleFederation({
      name: 'compiled_host',
      remotes: [
        {
          name: 'provider_a',
          alias: 'providerA',
          entry: 'https://cdn.example.test/provider_a/mf-manifest.json',
        },
        {
          name: 'provider_b',
          alias: 'providerB',
          entry: 'https://cdn.example.test/provider_b/mf-manifest.json',
        },
      ],
    });
    const runtime: any = {
      federation: {
        instance: host,
        bundlerRuntimeOptions: {
          remotes: {
            remoteInfos: {},
            idToRemoteMap: {},
            idToExternalAndNameMapping: {},
          },
        },
      },
      m: {},
      // Only module 101 (providerA) has been evaluated in runtime.c; 102 (providerB) is not in runtime.c.
      c: { 101: { exports: 'evaluated' } },
      remotesLoadingData: {
        moduleIdToRemoteDataMapping: {
          101: { remoteName: 'providerA', externalModuleId: 201 },
          102: { remoteName: 'providerB', externalModuleId: 202 },
        },
        cache: {
          moduleIdToParentModuleIds: {},
          modules: undefined,
          factories: {},
        },
      },
    };
    runtime.remotesLoadingData.cache.modules = runtime.c;
    const dispose = installClearCache({ webpackRequire: runtime })!;
    try {
      const v1: GlobalModuleInfo = {
        provider_a: makeProviderInfo('provider_a', '1.0.0'),
        provider_b: makeProviderInfo('provider_b', '1.0.0'),
      };
      applyNodeGlobalModuleInfo(v1, { instances: [host] });
      const v2: GlobalModuleInfo = {
        provider_a: makeProviderInfo('provider_a', '2.0.0'),
        provider_b: makeProviderInfo('provider_b', '2.0.0'),
      };
      const diff = diffNodeGlobalModuleInfo(v2, { instances: [host] });
      expect(diff.loadedRemotes.map((item) => item.name)).toEqual([
        'provider_a',
      ]);
      expect(diff.unloadedRemotes.map((item) => item.name)).toEqual([
        'provider_b',
      ]);
    } finally {
      dispose();
    }
  });
});
