/** @jest-environment node */
import type { Compiler, Compilation } from 'webpack';
import { ModuleHandler } from '../src/ModuleHandler';
import { StatsManager } from '../src/StatsManager';
import { ManifestManager } from '../src/ManifestManager';
import type { Stats } from '@module-federation/sdk';
import { mkdtemp, realpath, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { StatsPlugin } from '../src/StatsPlugin';
import { collectGraph } from '../src/collectGraph';

const webpack = process.getBuiltinModule('module').createRequire(__filename)(
  'webpack',
);

it('emits concrete providers with the main Webpack collector', async () => {
  const directory = await realpath(
    await mkdtemp(path.join(tmpdir(), 'mf-providers-')),
  );
  try {
    await writeFile(path.join(directory, 'package.json'), '{}');
    await writeFile(path.join(directory, 'entry.js'), '');
    await writeFile(
      path.join(directory, 'shared.js'),
      'module.exports = "shared";',
    );
    const options = {
      name: 'host',
      shared: {
        first: {
          import: './shared.js?first',
          shareKey: 'shared',
          version: '1.0.0',
        },
        second: {
          import: './shared.js?second',
          shareKey: 'shared',
          version: '2.0.0',
        },
      },
    };
    const compiler = webpack({
      context: directory,
      mode: 'development',
      entry: './entry.js',
      output: { path: directory, publicPath: '/' },
      plugins: [new webpack.container.ModuleFederationPlugin(options)],
    });
    new StatsPlugin(options, {
      pluginVersion: 'test',
      bundler: 'webpack',
    }).apply(compiler);
    await new Promise<void>((resolve, reject) => {
      compiler.run((error, stats) =>
        compiler.close((closeError) => {
          if (error || closeError) reject(error || closeError);
          else if (stats.hasErrors()) reject(new Error(stats.toString()));
          else resolve();
        }),
      );
    });
    const stats = JSON.parse(
      await readFile(path.join(directory, 'mf-stats.json'), 'utf8'),
    ) as Stats;
    expect(stats.shared).toHaveLength(1);
    const providers = stats.shared[0].providers!;
    expect(
      providers.map(({ version, import: imported }) => ({ version, imported })),
    ).toEqual([
      { version: '1.0.0', imported: './shared.js?first' },
      { version: '2.0.0', imported: './shared.js?second' },
    ]);
    for (const provider of providers) {
      expect(provider.assets.js.sync).toHaveLength(1);
      await readFile(path.join(directory, provider.assets.js.sync[0]));
    }
    const manifest = JSON.parse(
      await readFile(path.join(directory, 'mf-manifest.json'), 'utf8'),
    );
    expect(manifest.shared[0].providers).toEqual(providers);
    stats.shared[0].providers = [providers[0]];
    const projected = new ManifestManager().generateManifest({
      stats,
      compiler,
      compilation: {} as Compilation,
      publicPath: '/',
      bundler: 'webpack',
    });
    expect(projected.shared[0].providers).toBeUndefined();
    expect(projected.shared[0].version).toBe(stats.shared[0].version);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}, 30_000);

it('collects concrete provider versions and assets without changing the legacy row', () => {
  const compiler = { context: '/project' } as Compiler;
  const first = {
    name: 'provide shared module (default) react@18.0.0 = /project/react18?x=1',
    identifier:
      'provide shared module (default) react@18.0.0 = /project/react18?x=1',
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

it('matches nameless Webpack providers through resolved reason identifiers', () => {
  const providers = ['18.0.0', '19.0.0'].map((version) => ({
    moduleType: 'provide-module',
    identifier: `provide module (default) react@${version} = /project/react${version}.js`,
  }));
  const modules = [
    ...providers,
    ...providers.map((provider, index) => ({
      identifier: `/project/react${index + 18}.js`,
      reasons: [
        {
          moduleIdentifier: '/project/barrel.js',
          resolvedModuleIdentifier: provider.identifier,
        },
      ],
      chunks: [],
    })),
  ];
  const { sharedProviderModules } = new ModuleHandler(
    { name: 'host' },
    modules,
    { bundler: 'webpack' },
  ).collect();
  expect(sharedProviderModules).toHaveLength(2);
  const alternatives = new StatsManager()['_getSharedProviders'](
    { context: '/project' } as Compiler,
    { chunks: new Set() } as unknown as Compilation,
    { modules },
    sharedProviderModules,
    [],
  );
  expect(
    alternatives.react?.map(({ version, import: imported }) => ({
      version,
      imported,
    })),
  ).toEqual([
    { version: '18.0.0', imported: './react18.js' },
    { version: '19.0.0', imported: './react19.js' },
  ]);
});

it('collects graph providers without mixing scopes or layers', () => {
  const records = [
    { version: '1.0.0', request: '/project/shared.js?first', scope: 'default' },
    {
      version: '2.0.0',
      request: '/project/shared.js?second',
      scope: 'default',
    },
    { version: '3.0.0', request: '/project/shared.js?tenant', scope: 'tenant' },
    {
      version: '4.0.0',
      request: '/project/shared.js?server',
      scope: 'default',
      layer: 'server',
    },
    { version: '5.0.0', request: undefined, scope: 'default' },
  ].map((record, index) => {
    const target = {
      type: 'javascript/auto',
      resource: record.request,
      nameForCondition: () => (record.request ? '/project/shared.js' : null),
      identifier: () => 'external commonjs \"external-share\"',
      blocks: [],
      dependencies: [],
    };
    const dependency = { target };
    const module = {
      type: 'provide-module',
      blocks: [],
      dependencies: [dependency],
    };
    const chunk = {
      id: index,
      files: [`provider-${index}.js`],
      groupsIterable: [],
      getAllAsyncChunks: () => [],
    };
    return { ...record, target, module, chunk };
  });
  const compilation = {
    compiler: { context: '/project' },
    modules: records.flatMap(({ module, target }) => [module, target]),
    entrypoints: new Map(),
    moduleGraph: { getModule: (dependency) => dependency.target },
    chunkGraph: {
      getModuleRuntimes: () => ['runtime'],
      getModuleChunksIterable: (target) => [
        records.find((record) => record.target === target)!.chunk,
      ],
    },
    codeGenerationResults: {
      has: () => true,
      getData: (module) => {
        const record = records.find((record) => record.module === module)!;
        return {
          name: 'shared',
          version: JSON.stringify(record.version),
          shareScope: record.scope,
          shareConfig: { layer: record.layer },
        };
      },
    },
  } as unknown as Compilation;
  const result = collectGraph(compilation, {
    name: 'host',
    exposes: {},
    shared: {},
    remotes: {},
  })!;
  expect(result.shared).toHaveLength(3);
  const unlayered = result.shared.find((row) => !row.layer && !row.shareScope)!;
  expect(unlayered.providers).toEqual([
    {
      version: '1.0.0',
      import: './shared.js?first',
      assets: {
        js: { sync: ['provider-0.js'], async: [] },
        css: { sync: [], async: [] },
      },
    },
    {
      version: '2.0.0',
      import: './shared.js?second',
      assets: {
        js: { sync: ['provider-1.js'], async: [] },
        css: { sync: [], async: [] },
      },
    },
    {
      version: '5.0.0',
      import: 'external commonjs "external-share"',
      assets: {
        js: { sync: ['provider-4.js'], async: [] },
        css: { sync: [], async: [] },
      },
    },
  ]);
  expect(
    result.shared
      .filter((row) => row !== unlayered)
      .map((row) => row.providers),
  ).toEqual([undefined, undefined]);
});
