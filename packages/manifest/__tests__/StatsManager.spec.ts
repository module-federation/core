import type { Stats, moduleFederationPlugin } from '@module-federation/sdk';
import type { Compiler, Compilation } from 'webpack';

jest.mock(
  '@module-federation/dts-plugin/core',
  () => ({
    isTSProject: () => false,
    retrieveTypesAssetsInfo: () => ({}) as const,
  }),
  { virtual: true },
);

jest.mock(
  '@module-federation/managers',
  () => ({
    ContainerManager: class {
      enable = true;
      containerPluginExposesOptions = {};
      init(options: { exposes?: object }) {
        this.containerPluginExposesOptions = options.exposes || {};
      }
      get fileExposeKeyMap() {
        const files: Record<string, Set<string>> = {};
        for (const [key, value] of Object.entries(
          this.containerPluginExposesOptions,
        )) {
          for (const file of (value as { import: string[] }).import) {
            (files[file.replace(/\.[^/.]+$/, '')] ||= new Set()).add(key);
          }
        }
        return files;
      }
    },
    RemoteManager: class {
      statsRemoteWithEmptyUsedIn = [];
      init() {}
    },
    SharedManager: class {
      normalizedOptions = {};
      init() {}
    },
    PKGJsonManager: class {},
    UNKNOWN_MODULE_NAME: 'unknown',
    utils: {},
  }),
  { virtual: true },
);

import { StatsManager } from '../src/StatsManager';
import { ModuleHandler } from '../src/ModuleHandler';
import { ManifestManager } from '../src/ManifestManager';

describe('StatsManager', () => {
  it.each([
    {
      description:
        'reconciles pre-emitted Rspack metadata to the configured ESM library type',
      library: { type: 'module' },
      emittedType: 'global',
      expectedType: 'module',
    },
    {
      description:
        'preserves pre-emitted Rspack metadata without a configured library type',
      library: undefined,
      emittedType: 'system',
      expectedType: 'system',
    },
  ] as const)('$description', ({ library, emittedType, expectedType }) => {
    const manager = new StatsManager();
    manager.init(
      {
        name: 'esm_remote',
        library,
        exposes: { './App': './src/App' },
      } as moduleFederationPlugin.ModuleFederationPluginOptions,
      { pluginVersion: 'test', bundler: 'rspack' },
    );
    const stats = {
      id: 'esm_remote',
      name: 'esm_remote',
      metaData: {
        name: 'esm_remote',
        globalName: 'esm_remote',
        buildInfo: { buildVersion: '1.0.0', buildName: 'esm_remote' },
        remoteEntry: {
          name: 'remoteEntry.mjs',
          path: '',
          type: emittedType,
        },
        types: { path: '', name: '', api: '', zip: '' },
        pluginVersion: 'test',
      },
      exposes: [],
      shared: [],
      remotes: [],
    } as unknown as Stats;
    const compiler = {
      context: process.cwd(),
      options: { output: { publicPath: 'auto' } },
    } as unknown as Compiler;

    const updated = manager.updateStats(stats, compiler);

    expect(updated.metaData.remoteEntry.type).toBe(expectedType);
  });
});

it('keeps assets separate for layered aliases of the same source', () => {
  const manager = new StatsManager();
  manager.init(
    {
      name: 'host',
      exposes: {
        './Server': {
          import: './src/Button.tsx',
          name: 'server',
          layer: 'server',
        },
        './Client': {
          import: './src/Button.tsx',
          name: 'client',
          layer: 'client',
        },
      },
    },
    { pluginVersion: 'test', bundler: 'rspack' },
  );
  const chunks = new Set(
    ['server', 'client', 'server-split'].map((name) => ({
      name,
      groupsIterable: [{ name, getFiles: () => [`${name}.js`] }],
      getAllAsyncChunks: () => [],
    })),
  );
  const assets = manager['_getModuleAssets'](
    { chunks } as unknown as Compilation,
    [],
  );
  expect(assets['./Server'].js.sync).toEqual(['server.js', 'server-split.js']);
  expect(assets['./Client'].js.sync).toEqual(['client.js']);
});

it('collects concrete provider versions and assets without changing the legacy row', () => {
  const compiler = { context: '/project' } as Compiler;
  const first = {
    name: 'provide shared module (default) react@18.0.0 = /project/react18?x=1',
    identifier:
      'provide shared module (default) react@18.0.0 = /project/react18?x=1 [identity:example]',
    moduleType: 'provide-module',
  };
  const second = {
    name: 'provide shared module (default) react@19.0.0 = /project/react19.js',
    identifier:
      'provide shared module (default) react@19.0.0 = /project/react19.js',
    moduleType: 'provide-module',
  };
  const consume = {
    identifier:
      'consume shared module (default) react@17.0.0 (fallback: /project/fallback.js)',
    moduleType: 'consume-shared-module',
  };
  const modules = [
    first,
    second,
    consume,
    {
      identifier: '/project/react18.js?x=1',
      issuerName: first.name,
      chunks: [1],
    },
    {
      identifier: '/project/react19.js',
      reasons: [{ moduleIdentifier: second.identifier }],
      chunks: [2],
    },
  ];
  const chunk = (id: number) => ({
    id,
    files: [`react${id}.js`],
    groupsIterable: [],
    getAllAsyncChunks: () => [
      { files: [`react${id}-async.js`], groupsIterable: [] },
    ],
  });
  const compilation = {
    chunks: new Set([chunk(1), chunk(2)]),
  } as unknown as Compilation;
  const manager = new StatsManager();
  const collect = (input: typeof modules) =>
    new ModuleHandler({ name: 'host' }, input, { bundler: 'rspack' }).collect();
  const { sharedMap, sharedProviderModules } = collect(modules);
  expect(sharedMap.react.version).toBe('18.0.0');
  const providers = manager['_getSharedProviders'](
    compiler,
    compilation,
    { modules },
    sharedProviderModules,
    [],
  );
  expect(providers.react).toEqual([
    {
      version: '18.0.0',
      import: './react18.js?x=1',
      assets: {
        js: { sync: ['react1.js'], async: ['react1-async.js'] },
        css: { sync: [], async: [] },
      },
    },
    {
      version: '19.0.0',
      import: './react19.js',
      assets: {
        js: { sync: ['react2.js'], async: ['react2-async.js'] },
        css: { sync: [], async: [] },
      },
    },
  ]);
  expect(
    manager['_getSharedProviders'](
      compiler,
      compilation,
      { modules },
      collect([first, first, consume]).sharedProviderModules,
      [],
    ),
  ).toEqual({});
  expect(collect([consume]).sharedProviderModules).toEqual([]);
});

it('keeps provider alternatives inside their layer identity', () => {
  const serverKey = '10:s7:defaultl6:server5:react';
  const clientKey = '10:s7:defaultl6:client5:react';
  const modules = [
    {
      moduleType: 'provide-module',
      identifier: `provide shared module (default) (server) react@18.0.0 = /project/react18.js [identity:${serverKey}]`,
    },
    {
      moduleType: 'provide-module',
      identifier: `provide shared module (default) (server) react@19.0.0 = /project/react19.js [identity:${serverKey}]`,
    },
    {
      moduleType: 'provide-module',
      identifier: `provide shared module (default) (client) react@20.0.0 = /project/react20.js [identity:${clientKey}]`,
    },
  ];
  const providerModules = [...modules];
  const targets = modules.map((module, index) => ({
    identifier: `/project/react${index + 18}.js`,
    reasons: [{ moduleIdentifier: module.identifier }],
    chunks: [],
  }));
  const statsModules = [...modules, ...targets];
  const { sharedMap, sharedProviderModules } = new ModuleHandler(
    { name: 'host' },
    providerModules,
    { bundler: 'rspack' },
  ).collect();
  expect(Object.values(sharedMap)).toEqual([
    expect.objectContaining({
      id: `host:shared:${serverKey}`,
      name: 'react',
      layer: 'server',
      version: '18.0.0',
    }),
    expect.objectContaining({
      id: `host:shared:${clientKey}`,
      name: 'react',
      layer: 'client',
      version: '20.0.0',
    }),
  ]);
  const providers = new StatsManager()['_getSharedProviders'](
    { context: '/project' } as Compiler,
    { chunks: new Set() } as unknown as Compilation,
    { modules: statsModules },
    sharedProviderModules,
    [],
  );
  expect(Object.keys(providers)).toEqual([serverKey]);
  expect(providers[serverKey].map(({ version }) => version)).toEqual([
    '18.0.0',
    '19.0.0',
  ]);
});

it.each([false, true])(
  'emits each public expose once with its metadata (disableAssetsAnalyze=%s)',
  async (disableAssetsAnalyze) => {
    const options = {
      name: 'host',
      manifest: { disableAssetsAnalyze },
      exposes: {
        './Server': {
          import: ['./src/Button.tsx', './src/setup.ts'],
          name: 'server',
          layer: 'server',
        },
        './Client': { import: ['./src/Button.tsx'], name: 'client', layer: '' },
      },
    };
    const consume = {
      identifier: 'consume shared module (default) react@19.0.0',
      name: 'consume shared module (default) react@19.0.0',
      moduleType: 'consume-shared-module',
      issuer: '/setup|server',
      issuerName: './src/setup.ts',
    };
    const modules = [
      {
        identifier: `container entry (default) ${JSON.stringify(Object.entries(options.exposes))}`,
      },
      { identifier: '/setup|server', name: './src/setup.ts', layer: 'server' },
      consume,
      { identifier: '/react.js', issuerName: consume.name, chunks: [3] },
    ];
    const chunks = new Set(
      ['server', 'client', 'shared'].map((name, index) => ({
        id: index + 1,
        name,
        files: [`${name}.js`],
        groupsIterable: [
          {
            name,
            getFiles: () =>
              name === 'shared' ? ['shared.js'] : [`${name}.js`, 'shared.js'],
          },
        ],
        getAllAsyncChunks: () => [],
      })),
    );
    const compiler = {
      context: process.cwd(),
      options: { output: { publicPath: '/' } },
    } as unknown as Compiler;
    const compilation = {
      chunks,
      entrypoints: new Map(),
      getStats: () => ({ toJson: () => ({ modules }) }),
    } as unknown as Compilation;
    const manager = new StatsManager();
    manager.init(options, { pluginVersion: 'test', bundler: 'rspack' });
    jest
      .spyOn(
        manager as unknown as { _getMetaData(): Stats['metaData'] },
        '_getMetaData',
      )
      .mockReturnValue({} as Stats['metaData']);
    const stats = await manager.generateStats(compiler, compilation);
    expect(stats.exposes).toHaveLength(2);
    expect(stats.exposes.map(({ path }) => path)).toEqual([
      './Server',
      './Client',
    ]);
    expect(stats.exposes[0]).toMatchObject({
      id: 'host:Server',
      name: 'Server',
      file: 'src/Button.tsx',
      layer: 'server',
      requires: disableAssetsAnalyze ? [] : ['react'],
      assets: {
        js: { sync: disableAssetsAnalyze ? [] : ['server.js'], async: [] },
        css: { sync: [], async: [] },
      },
    });
    expect(stats.exposes[1]).toMatchObject({
      id: 'host:Client',
      name: 'Client',
      file: 'src/Button.tsx',
      layer: '',
      requires: [],
      assets: {
        js: { sync: disableAssetsAnalyze ? [] : ['client.js'], async: [] },
        css: { sync: [], async: [] },
      },
    });
    const manifest = new ManifestManager().generateManifest({
      stats,
      compiler,
      compilation,
      publicPath: '/',
      bundler: 'rspack',
    });
    expect(manifest.exposes.map(({ layer }) => layer)).toEqual(['server', '']);
    expect(manifest.exposes[0].assets).toEqual(stats.exposes[0].assets);
  },
);
