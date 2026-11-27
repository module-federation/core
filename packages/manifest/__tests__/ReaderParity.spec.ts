/** @jest-environment node */
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Configuration, Stats } from 'webpack';
import { StatsPlugin } from '../src/StatsPlugin';

// The graph collector has no public switch. Wrap it so a build can run the
// stats reader instead, and so a test can check which reader produced a row.
jest.mock('../src/collectGraph', () => {
  const actual = jest.requireActual('../src/collectGraph');
  return { ...actual, collectGraph: jest.fn(actual.collectGraph) };
});
const { collectGraph: actualCollectGraph } = jest.requireActual(
  '../src/collectGraph',
);
const collectGraph: jest.Mock = jest.requireMock(
  '../src/collectGraph',
).collectGraph;

const nodeRequire = process
  .getBuiltinModule('module')
  .createRequire(__filename);
const webpack = nodeRequire('webpack');
const enhanced = process
  .getBuiltinModule('module')
  .createRequire(path.resolve(__dirname, '../../enhanced/package.json'))(
  '@module-federation/enhanced',
);

type Files = Record<string, string>;
type Options = Record<string, any>;
type Row = Options;
type Manifest = { exposes: Row[]; shared: Row[]; remotes: Row[] } & Options;
type Fixture = {
  name: string;
  files: Files;
  federation: Options;
  // What the manifest must contain, taken from the Rspack fixture's assertions.
  check: (manifest: Manifest) => void;
  // Turns the graph manifest into the one the stats reader emits, for the
  // cases the stats reader gets wrong.
  statsReader?: (manifest: Manifest) => void;
  webpack?: (directory: string) => Configuration;
  plugins?: (directory: string) => unknown[];
};

const noAssets = () => ({
  js: { sync: [], async: [] },
  css: { sync: [], async: [] },
});
// The stats reader finds expose chunks by chunk name, so an expose without a
// `name` gets no assets.
const unnamedExpose = (manifest: Manifest) => {
  manifest.exposes[0].assets = noAssets();
};
const row = (rows: Row[], name: string) =>
  rows.find((item) => item.name === name)!;
const names = (rows: Row[]) => rows.map((item) => item.name).sort();
const checkManifest = (manifest: Manifest) => {
  const expose = row(manifest.exposes, 'expose-a');
  expect(expose.assets.js.sync).toEqual(['_federation_expose_a.js']);
  expect(expose.assets.js.async).toEqual(['lazy-module_js.js']);
  expect(row(manifest.shared, 'xreact').assets.js).toEqual({
    sync: ['node_modules_xreact_index_js.js'],
    async: [],
  });
  expect(row(manifest.shared, '@scope-sc/dep1')).toMatchObject({
    singleton: true,
    version: '1.0.0',
    requiredVersion: '^1.0.0',
  });
  expect(row(manifest.shared, '@scope-sc2/dep2')).toMatchObject({
    singleton: false,
    version: '1.0.0',
    requiredVersion: '>=1.0.0',
  });
  expect(
    manifest.remotes.map((remote) => [
      remote.alias,
      remote.federationContainerName,
      remote.moduleName,
    ]),
  ).toEqual([
    ['@remote/alias', 'remote', '.'],
    ['@remote/alias', 'remote', 'Button'],
    ['dynamic-remote', 'dynamic_remote', 'UNKNOWN'],
  ]);
  expect(manifest.metaData.remoteEntry.name).toMatch(
    /^container\.[0-9a-f]{8}\.js$/,
  );
};

const pkg = (name: string, version: string, extra: Options = {}) =>
  JSON.stringify({ name, version, ...extra });

// Sources of the Rspack `container-1-5/manifest` fixture.
const manifestFiles: Files = {
  'package.json': pkg('mf-manifest', '1.0.0', {
    dependencies: {
      xreact: '^1.0.0',
      '@scope-sc/dep1': '^1.0.0',
      '@scope-sc2/dep2': '^1.0.0',
    },
  }),
  'index.js': 'import("./module.js");',
  'lazy-module.js': 'export const lazy = "lazy";',
  'module.js': `
    import { loadRemote } from 'mf';
    import xreact from 'xreact';
    import dep1 from '@scope-sc/dep1';
    import dep2 from '@scope-sc2/dep2';
    import remote from '@remote/alias';
    export const App = () => [dep1, dep2, remote, xreact].join(' ');
    export async function AppAsync() {
      const dynamicRemote = await loadRemote('dynamic-remote');
      const Button = (await import('@remote/alias/Button')).default;
      const lazyModule = (await import('./lazy-module')).lazy;
      return [dynamicRemote, Button, lazyModule].join(' ');
    }`,
  'runtime-plugin.js':
    'export default () => ({ name: "runtime-plugin", errorLoadRemote: (args) => () => args.id });',
  'node_modules/@scope-sc/dep1/package.json': pkg('@scope-sc/dep1', '1.0.0', {
    peerDependencies: { '@scope-sc2/dep2': '^1.0.0' },
  }),
  'node_modules/@scope-sc/dep1/index.js':
    'import Dep2 from "@scope-sc2/dep2"; export default "Dep1"; export { Dep2 };',
  'node_modules/@scope-sc2/dep2/package.json': pkg('@scope-sc2/dep2', '1.0.0'),
  'node_modules/@scope-sc2/dep2/index.js': 'export default "Dep2";',
  'node_modules/mf/package.json': pkg('mf', '1.0.0'),
  'node_modules/mf/index.js':
    'export const loadRemote = async (remote) => remote;',
  'node_modules/xreact/package.json': pkg('xreact', '1.0.0'),
  'node_modules/xreact/index.js': 'export default "XReact";',
};
const manifestFederation: Options = {
  name: 'container',
  filename: 'container.[chunkhash:8].js',
  exposes: {
    './expose-a': { import: './module.js', name: '_federation_expose_a' },
  },
  remoteType: 'script',
  remotes: {
    '@remote/alias': 'remote@http://localhost:8000/remoteEntry.js',
    'dynamic-remote': 'dynamic_remote@http://localhost:8001/remoteEntry.js',
  },
  shared: {
    xreact: {},
    '@scope-sc/dep1': { singleton: true, requiredVersion: '^1.0.0' },
    '@scope-sc2/dep2': { singleton: false, requiredVersion: '>=1.0.0' },
  },
  runtimePlugins: ['./runtime-plugin.js'],
};

const provideSharedFixtures: Fixture[] = [
  undefined,
  './static.js',
  './lazy.js',
  undefined,
  './static.js',
  './lazy.js',
].map((request, index) => ({
  name: `manifest-provide-shared ${index}`,
  files: {
    'package.json': pkg('provide-shared', '1.0.0'),
    'index.js': 'import("./mount.js");',
    'mount.js': `
      import { value } from './static.js';
      import './style.css';
      export const mount = () => value;
      export const load = () => import('./lazy.js');`,
    'static.js': 'export const value = "static";',
    'lazy.js': 'export const value = "lazy";',
    'style.css': '.mount { color: red; }',
  },
  webpack: () => ({ experiments: { css: true } }),
  federation: {
    name: `container${index}`,
    filename: `${index}-container.js`,
    exposes: {
      './Mount':
        index < 3
          ? { import: './mount.js', name: 'expose-mount' }
          : './mount.js',
    },
  },
  check: (manifest) => {
    const chunk = index < 3 ? 'expose-mount' : 'mount_js';
    const { assets } = row(manifest.exposes, 'Mount');
    expect(assets.js.sync).toEqual([`${chunk}.js`]);
    expect(assets.js.async).toEqual(['lazy_js.js']);
    expect(assets.css.sync).toEqual([`${chunk}.css`]);
    expect(names(manifest.shared)).toEqual(request ? [request] : []);
  },
  statsReader: index < 3 ? undefined : unnamedExpose,
  plugins: (directory) =>
    request
      ? [
          new enhanced.ProvideSharedPlugin({
            provides: {
              [path.join(directory, request)]: {
                shareKey: request,
                version: '1.0.0',
                ...(index < 3 ? { singleton: request === './static.js' } : {}),
              },
            },
          }),
        ]
      : [],
}));

const prefixSingletonFixtures: Fixture[] = [
  { shareScope: 'custom', consumeOnly: false },
  { shareScope: 'custom', consumeOnly: true },
  { shareScope: 'default', consumeOnly: false },
].map(({ shareScope, consumeOnly }, index) => {
  const defaults = {
    requiredVersion: '^1.0.0',
    ...(consumeOnly ? { import: false as const } : {}),
  };
  const options = { ...defaults, singleton: false };
  return {
    name: `manifest-prefix-singleton ${index}`,
    files: {
      'package.json': pkg('prefix-singleton', '1.0.0'),
      'index.js': 'import("./module.js");',
      'module.js': `
          export { default as Button } from 'ds/Button';
          export { default as Table } from 'ds/Table';
          export { default as Exact } from 'ds/Exact';
          export { default as DefaultExact } from 'ds/Default';
          export { default as Nested } from 'ds/nested/Child';
          export { default as Aliased } from '@scope/lib/Child';
          export { default as DefaultPrefix } from '@default/lib/Child';`,
      'node_modules/ds/package.json': pkg('ds', '1.0.0'),
      'node_modules/ds/Button.js': 'export default "Button";',
      'node_modules/ds/Table.js': 'export default "Table";',
      'node_modules/ds/Exact.js': 'export default "Exact";',
      'node_modules/ds/Default.js': 'export default "DefaultExact";',
      'node_modules/ds/nested/Child.js': 'export default "Nested";',
      'node_modules/@scope/lib/package.json': pkg('@scope/lib', '1.0.0'),
      'node_modules/@scope/lib/Child.js': 'export default "Aliased";',
      'node_modules/@default/lib/package.json': pkg('@default/lib', '1.0.0'),
      'node_modules/@default/lib/Child.js': 'export default "DefaultPrefix";',
    },
    federation: {
      name: `container${index}`,
      filename: `${index}-container.js`,
      shareScope,
      exposes: { './module': './module.js' },
      shared: {
        'ds/': options,
        'ds/Exact': { ...options, singleton: true },
        'ds/Default': defaults,
        'ds/nested/': { ...options, singleton: true },
        '@scope/lib/': { ...options, shareKey: 'renamed/' },
        '@default/lib/': defaults,
      },
    },
    check: (manifest) => {
      expect(manifest.exposes[0].assets.js.sync).toEqual(['module_js.js']);
      // Neither reader knows the version of a share that has no fallback
      // and no exact `requiredVersion`, so neither emits a row for it.
      expect(names(manifest.shared)).toEqual(
        consumeOnly
          ? []
          : [
              '@default/lib/Child',
              'ds/Button',
              'ds/Default',
              'ds/Exact',
              'ds/Table',
              'ds/nested/Child',
              'renamed/Child',
            ],
      );
      if (!consumeOnly)
        expect(
          Object.fromEntries(
            manifest.shared.map((item) => [item.name, item.singleton]),
          ),
        ).toEqual({
          'ds/Button': false,
          'ds/Table': false,
          'ds/Exact': true,
          'ds/Default': true,
          'ds/nested/Child': true,
          'renamed/Child': false,
          '@default/lib/Child': true,
        });
    },
    statsReader: unnamedExpose,
  };
});

const requiredVersionFixtures: Fixture[] = [
  { shareKey: 'shared (custom)', shareScope: 'default', version: '1.2.3' },
  { shareKey: '@scope/shared', shareScope: 'team = beta', version: '1.2.3' },
  { shareKey: 'shared', shareScope: 'default', version: false as const },
].map(({ shareKey, shareScope, version }, index) => ({
  name: `manifest-required-version-range ${index}`,
  files: {
    'package.json': pkg('manifest-required-version-range', '1.0.0', {
      dependencies: { xreact: '  ^1.0.0 || ^2.0.0  ', yreact: '^2.0.0' },
    }),
    'index.js': 'import("./module.js");',
    'module.js': `
      import xreact from 'xreact';
      import yreact from 'yreact';
      export const App = () => [xreact, yreact].join(' ');
      export { default as value } from './shared.js';`,
    'shared.js': 'export default "shared";',
    'node_modules/xreact/package.json': pkg('xreact', '2.1.0'),
    'node_modules/xreact/index.js': 'export default "XReact";',
    'node_modules/yreact/package.json': pkg('yreact', '2.1.0'),
    'node_modules/yreact/index.js': 'export default "YReact";',
  },
  federation: {
    name: `container${index}`,
    filename: `${index}-container.js`,
    shareScope,
    exposes: { './module': './module.js' },
    shared: {
      xreact: {},
      yreact: { requiredVersion: '^2.0.0 || ^3.0.0' },
      [index === 0 ? './shared.js' : 'unused-consumer']: {
        import: './shared.js',
        shareKey,
        version,
        requiredVersion: false,
      },
    },
  },
  check: (manifest) => {
    expect(manifest.exposes[0].assets.js.sync).toEqual(['module_js.js']);
    expect(names(manifest.shared)).toEqual(
      [shareKey, 'xreact', 'yreact'].sort(),
    );
    expect(row(manifest.shared, shareKey).version).toBe(version || '0');
    expect(row(manifest.shared, 'xreact').version).toBe('2.1.0');
    expect(row(manifest.shared, 'yreact')).toMatchObject({
      version: '2.1.0',
      requiredVersion: '^2.0.0 || ^3.0.0',
    });
    for (const shared of manifest.shared)
      expect(shared.id).toBe(`container${index}:${shared.name}`);
  },
  // The stats reader splits module identifiers on spaces. It loses a share
  // whose key has a space, loses every share in a scope whose name has a
  // space, and reads `version: false` as the string "false".
  statsReader: (manifest) => {
    unnamedExpose(manifest);
    if (index === 0)
      manifest.shared = manifest.shared.filter(({ name }) => name !== shareKey);
    if (index === 1) manifest.shared = [];
    if (index === 2) row(manifest.shared, shareKey).version = 'false';
  },
}));

// Two scalar scopes provide the same key at the same version.
const scalarScopeFixtures: Fixture[] = [undefined, 'common'].map((layer) => ({
  name: `scalar share scopes${layer ? ' in a layer' : ''}`,
  files: {
    'package.json': pkg('scalar-scopes', '1.0.0'),
    'index.js': 'import("./bootstrap.js");',
    'bootstrap.js': `
      export { default as a } from 'react-a';
      export { default as b } from 'react-b';`,
    'a.js': 'export default { scope: "a" };',
    'b.js': 'export default { scope: "b" };',
  },
  webpack: (directory) => ({
    experiments: { layers: true },
    module: {
      rules: layer
        ? [{ test: path.join(directory, 'bootstrap.js'), layer }]
        : [],
    },
  }),
  federation: {
    name: 'scalar_scopes',
    shareScope: 'a',
    filename: 'container.js',
    exposes: { './bootstrap': { import: './bootstrap.js', name: 'exposed' } },
    shared: Object.fromEntries(
      [
        ['b', 'default', '1.0.0'],
        ['a', undefined, false],
      ].map(([file, shareScope, requiredVersion]) => [
        `react-${file}`,
        {
          import: `./${file}.js`,
          shareKey: 'react',
          ...(layer === undefined ? {} : { layer, issuerLayer: layer }),
          ...(shareScope === undefined ? {} : { shareScope }),
          version: '1.0.0',
          requiredVersion,
          singleton: true,
        },
      ]),
    ),
  },
  check: (manifest) => {
    const prefix = layer ? '_common_' : '';
    expect(
      manifest.shared
        .map((item) => ({
          name: item.name,
          scope: item.shareScope,
          layer: item.layer,
          version: item.version,
          requiredVersion: item.requiredVersion,
          assets: item.assets.js.sync,
        }))
        .sort((first, second) => first.scope.localeCompare(second.scope)),
    ).toEqual([
      {
        name: 'react',
        scope: 'a',
        layer,
        version: '1.0.0',
        requiredVersion: false,
        assets: [`${prefix}a_js.js`],
      },
      {
        name: 'react',
        scope: 'default',
        layer,
        version: '1.0.0',
        requiredVersion: '1.0.0',
        assets: [`${prefix}b_js.js`],
      },
    ]);
  },
}));

const fixtures: Fixture[] = [
  {
    name: 'manifest',
    files: manifestFiles,
    federation: manifestFederation,
    check: checkManifest,
  },
  {
    name: 'manifest-entry-filter',
    files: {
      ...manifestFiles,
      'main.js': `
        import 'xreact';
        import('./main-vendor');
        import(/* webpackChunkName: "async-main" */ './async-main');`,
      'main-vendor.js': 'export default "main-vendor";',
      'async-main.js': 'export default "async-main";',
    },
    webpack: (directory) => ({
      entry: { main: './index.js', host: './main.js' },
      optimization: {
        splitChunks: {
          cacheGroups: {
            mainVendor: {
              test: path.join(directory, 'main-vendor'),
              name: 'vendors-main-vendor',
              chunks: 'all',
              enforce: true,
            },
          },
        },
      },
    }),
    federation: manifestFederation,
    check: (manifest) => {
      checkManifest(manifest);
      // Chunks that only the host entry loads stay out of the expose.
      const { js } = row(manifest.exposes, 'expose-a').assets;
      for (const file of ['host.js', 'vendors-main-vendor.js', 'async-main.js'])
        expect([...js.sync, ...js.async]).not.toContain(file);
    },
  },
  {
    name: 'manifest-multiple-exposes',
    files: {
      'package.json': pkg('multiple-exposes', '1.0.0'),
      'index.js': 'import("./expose-a.js");',
      'expose-a.js':
        'import { shared } from "./shared"; export const value = "a" + shared;',
      'expose-b.js':
        'import { shared } from "./shared"; export const value = "b" + shared;',
      'shared.js': 'export const shared = Math.random();',
    },
    webpack: (directory) => ({
      optimization: {
        splitChunks: {
          cacheGroups: {
            shared: {
              test: path.join(directory, 'shared'),
              name: 'shared',
              chunks: 'all',
              enforce: true,
            },
          },
        },
      },
    }),
    federation: {
      name: 'container',
      filename: 'container.js',
      exposes: {
        './expose-a': {
          import: './expose-a.js',
          name: '__federation_expose_expose-a',
        },
        './expose-b': {
          import: './expose-b.js',
          name: '__federation_expose_expose-b',
        },
      },
    },
    check: (manifest) => {
      // Each expose lists its own chunk and the split chunk both load.
      for (const own of ['a', 'b'])
        expect(row(manifest.exposes, `expose-${own}`).assets.js.sync).toEqual([
          'shared.js',
          `__federation_expose_expose-${own}.js`,
        ]);
    },
  },
  ...provideSharedFixtures,
  ...prefixSingletonFixtures,
  ...requiredVersionFixtures,
  ...scalarScopeFixtures,
  {
    // The share is not installed, so its version comes from the exact range.
    name: 'consume-only share in the plugin share scope',
    files: {
      'package.json': pkg('consume-only', '1.0.0'),
      'index.js': 'import("./module.js");',
      'module.js': 'export { default } from "missing-exact";',
    },
    federation: {
      name: 'container',
      filename: 'container.js',
      shareScope: 'custom',
      exposes: { './module': { import: './module.js', name: 'exposed' } },
      shared: {
        'missing-exact': { import: false, requiredVersion: '=1.2.3' },
      },
    },
    check: (manifest) =>
      expect(manifest.shared).toMatchObject([
        { name: 'missing-exact', version: '1.2.3', requiredVersion: '=1.2.3' },
      ]),
  },
  {
    name: 'manifest-disable-assets-analyze',
    files: {
      'package.json': pkg('disable-assets-analyze', '1.0.0', {
        dependencies: { xreact: '^1.0.0' },
      }),
      'index.js': 'import("./module.js");',
      'module.js': 'export { default } from "xreact";',
      'node_modules/xreact/package.json': pkg('xreact', '1.0.0'),
      'node_modules/xreact/index.js': 'export default "XReact";',
    },
    federation: {
      name: 'container',
      filename: 'container.[chunkhash:8].js',
      exposes: { 'expose-a': './module.js' },
      remoteType: 'script',
      remotes: { remote: 'remote@http://localhost:8000/remoteEntry.js' },
      shared: { xreact: {} },
      manifest: { disableAssetsAnalyze: true },
    },
    check: (manifest) => {
      expect(manifest.exposes).toEqual([
        {
          id: 'container:expose-a',
          name: 'expose-a',
          path: 'expose-a',
          assets: noAssets(),
        },
      ]);
      expect(names(manifest.shared)).toEqual(['xreact']);
      expect(manifest.remotes.map((remote) => remote.alias)).toEqual([
        'remote',
      ]);
    },
  },
  {
    // The container loads only `exposed.js` for the expose. The application's
    // `import('./other.js')` group holds `exposed.js` and `other_js.js`.
    name: 'unnamed import group next to an expose',
    files: {
      'package.json': pkg('unnamed-group', '1.0.0'),
      'index.js': 'import("./other.js");',
      'other.js': 'import value from "./component.js"; console.log(value);',
      'component.js': 'export default "component";',
    },
    webpack: () => ({
      optimization: { splitChunks: { chunks: 'all', minSize: 0 } },
    }),
    federation: {
      name: 'fixture',
      filename: 'remoteEntry.js',
      exposes: {
        './Component': { import: './component.js', name: 'exposed' },
      },
    },
    check: (manifest) =>
      expect(manifest.exposes[0].assets.js).toEqual({
        sync: ['exposed.js'],
        async: [],
      }),
  },
];

// The two readers visit modules in a different order, so compare rows by id.
const sorted = (manifest: Manifest): Manifest => {
  const by = (key: (item: Row) => string) => (a: Row, b: Row) =>
    key(a).localeCompare(key(b));
  return {
    ...manifest,
    exposes: [...manifest.exposes].sort(by((item) => item.id)),
    shared: [...manifest.shared].sort(by((item) => item.id)),
    remotes: [...manifest.remotes].sort(
      by((item) => `${item.alias} ${item.moduleName}`),
    ),
  };
};

async function writeFixture(files: Files): Promise<string> {
  const directory = await mkdtemp(path.join(__dirname, 'mf-parity-'));
  for (const [file, source] of Object.entries(files)) {
    const target = path.join(directory, file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, source);
  }
  return directory;
}

async function emit(
  fixture: Fixture,
  directory: string,
  reader: 'graph' | 'stats',
  manifest: Options = {},
) {
  const output = path.join(directory, `dist-${reader}`);
  const options = {
    library: { type: 'commonjs-module' },
    dts: false as const,
    ...fixture.federation,
    manifest: { ...fixture.federation.manifest, ...manifest },
  };
  const config = fixture.webpack?.(directory);
  const compiler = webpack({
    context: directory,
    mode: 'development',
    devtool: false,
    entry: './index.js',
    ...config,
    optimization: {
      chunkIds: 'named',
      moduleIds: 'named',
      ...config?.optimization,
    },
    output: {
      path: output,
      publicPath: '/',
      filename: '[name].js',
      chunkFilename: '[name].js',
    },
    plugins: [
      new enhanced.ModuleFederationPlugin({ ...options, manifest: false }),
      ...(fixture.plugins?.(directory) || []),
    ],
  });
  new StatsPlugin(options, { pluginVersion: 'test', bundler: 'webpack' }).apply(
    compiler,
  );
  collectGraph.mockClear();
  collectGraph.mockImplementation(
    reader === 'graph' ? actualCollectGraph : () => undefined,
  );
  await new Promise<Stats>((resolve, reject) => {
    compiler.run((error: Error | null, stats: Stats) =>
      compiler.close((closeError: Error | null) => {
        if (error || closeError) reject(error || closeError);
        else if (stats.hasErrors()) reject(new Error(stats.toString()));
        else resolve(stats);
      }),
    );
  });
  const analyzed = !options.manifest.disableAssetsAnalyze;
  expect(collectGraph).toHaveBeenCalledTimes(analyzed ? 1 : 0);
  // A graph build must not fall back to the stats reader without saying so.
  if (analyzed && reader === 'graph')
    expect(collectGraph.mock.results[0].value).toBeDefined();
  const read = async (file: string) =>
    JSON.parse(await readFile(path.join(output, file), 'utf8'));
  return {
    stats: await read('mf-stats.json'),
    manifest: await read('mf-manifest.json'),
  };
}

afterAll(() => collectGraph.mockImplementation(actualCollectGraph));

describe.each(fixtures)('$name', (fixture) => {
  let directory: string;
  beforeAll(async () => {
    directory = await writeFixture(fixture.files);
  });
  afterAll(() => rm(directory, { recursive: true, force: true }));

  it('emits the expected manifest from the graph and from the stats reader', async () => {
    const graph = await emit(fixture, directory, 'graph');
    const stats = await emit(fixture, directory, 'stats');
    fixture.check(graph.manifest);
    const expected = structuredClone(graph.manifest);
    fixture.statsReader?.(expected);
    expect(sorted(stats.manifest)).toEqual(sorted(expected));
  }, 60000);

  it('emits what `additionalData` changes', async () => {
    const additionalData = jest.fn(({ stats }) => {
      stats.metaData.buildInfo.buildVersion = 'changed-by-additional-data';
      stats.exposes[0].assets.js.sync.push('added-by-additional-data.js');
      return stats;
    });
    const { stats, manifest } = await emit(fixture, directory, 'graph', {
      additionalData,
    });
    expect(additionalData).toHaveBeenCalledTimes(1);
    expect(additionalData.mock.calls[0][0].bundler).toBe('webpack');
    for (const artifact of [stats, manifest]) {
      expect(artifact.metaData.buildInfo.buildVersion).toBe(
        'changed-by-additional-data',
      );
      expect(artifact.exposes[0].assets.js.sync).toContain(
        'added-by-additional-data.js',
      );
    }
  }, 60000);
});
