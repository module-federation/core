/**
 * @jest-environment node
 *
 * Compatibility of the identifiers emitted by Rspack's layer-aware Module
 * Federation stack with the published (pre-layers) manifest reader.
 *
 * `@module-federation/manifest-legacy` is the last published reader
 * (2.8.2, before this change); `../src` is the current one. Both run the
 * real @module-federation/sdk and @module-federation/managers.
 */
import type { StatsModule } from 'webpack';
import path from 'path';
import { ModuleHandler } from '../src/ModuleHandler';
import { ManifestManager } from '../src/ManifestManager';
import ConsumeSharedModule from '../../enhanced/src/lib/sharing/ConsumeSharedModule';
import type { Stats } from '@module-federation/sdk';
import type { Compilation, Compiler } from 'webpack';

// The published package neither re-exports ModuleHandler from its index nor
// exposes dist files through `exports`, so resolve it next to the main entry.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ModuleHandler: LegacyModuleHandler } = require(
  path.join(
    path.dirname(require.resolve('@module-federation/manifest-legacy')),
    'ModuleHandler.js',
  ),
) as { ModuleHandler: typeof ModuleHandler };

type Handler = typeof ModuleHandler;

const readers: [string, Handler][] = [
  ['legacy reader (2.8.2)', LegacyModuleHandler],
  ['current reader', ModuleHandler],
];

const options = {
  name: 'host',
  exposes: { './Button': './src/Button.tsx' },
};

const collect = (Reader: Handler, modules: Partial<StatsModule>[]) =>
  new Reader(options, modules as StatsModule[], {
    bundler: 'rspack',
  }).collect();

const sharedVersions = (
  sharedMap: Record<string, { name: string; version: string }>,
) =>
  Object.fromEntries(
    Object.values(sharedMap).map(({ name, version }) => [name, version]),
  );

// Identifiers as emitted by rspack_plugin_mf (ProvideSharedModule /
// ConsumeSharedModule / ContainerEntryModule).
const unlayeredShared: Partial<StatsModule>[] = [
  {
    moduleType: 'provide-module',
    identifier:
      'provide shared module (default) react@19.0.0 = /node_modules/react/index.js',
  },
  {
    moduleType: 'provide-module',
    identifier:
      'provide shared module (default) @scope/pkg@2.0.0 = /node_modules/@scope/pkg/index.js',
  },
  {
    moduleType: 'consume-shared-module',
    identifier:
      'consume shared module (default) lodash/get@^4.17.21 (strict) (fallback: /node_modules/lodash/get.js)',
  },
];

const layeredShared: Partial<StatsModule>[] = [
  {
    moduleType: 'provide-module',
    identifier:
      'provide shared module (default) (server) react@19.0.0 = /node_modules/react/index.js',
  },
  {
    moduleType: 'consume-shared-module',
    identifier:
      'consume shared module (primary|default) (client) lodash/get@^4.17.21 (strict) (fallback: /node_modules/lodash/get.js)',
  },
];

const unlayeredContainer: Partial<StatsModule> = {
  identifier:
    'container entry (default) [["./Button",{"name":"__federation_expose_Button","import":["./src/Button.tsx"]}],["./Card",{"name":"__federation_expose_Card","import":["./src/Card.tsx"]}]]',
};

const layeredContainer: Partial<StatsModule> = {
  identifier:
    'container entry (default) [["./Button",{"name":"__federation_expose_Button","import":["./src/Button.tsx"]}],["./Card",{"name":"__federation_expose_Card","import":["./src/Card.tsx"],"layer":"server"}]]',
};

describe('Rspack identifiers against the published manifest reader', () => {
  describe.each(readers)('%s', (_label, Reader) => {
    it('reads unlayered shared modules', () => {
      const { sharedMap } = collect(Reader, unlayeredShared);
      expect(sharedVersions(sharedMap)).toEqual({
        react: '19.0.0',
        '@scope/pkg': '2.0.0',
        'lodash/get': '4.17.21',
      });
    });

    it('ignores structural identity suffixes on shared and container identifiers', () => {
      const suffix = ' [identity:s7:defaultn5:react]';
      const { sharedMap, exposesMap } = collect(
        Reader,
        [...unlayeredShared, unlayeredContainer].map((mod) => ({
          ...mod,
          identifier: mod.identifier + suffix,
        })),
      );
      expect(sharedVersions(sharedMap)).toEqual({
        react: '19.0.0',
        '@scope/pkg': '2.0.0',
        'lodash/get': '4.17.21',
      });
      expect(Object.values(exposesMap).map((expose) => expose.path)).toEqual([
        './Button',
        './Card',
      ]);
    });

    it('accepts null expose names emitted by Rspack', () => {
      const { exposesMap } = collect(Reader, [
        {
          identifier:
            'container entry (default) [["./Button",{"name":null,"import":["./src/Button.tsx"]}]]',
        },
      ]);
      expect(Object.values(exposesMap).map(({ path }) => path)).toEqual([
        './Button',
      ]);
    });

    it('reads container exposes without layers', () => {
      const { exposesMap } = collect(Reader, [unlayeredContainer]);
      expect(Object.values(exposesMap).map((expose) => expose.path)).toContain(
        './Button',
      );
      expect(Object.values(exposesMap).map((expose) => expose.path)).toContain(
        './Card',
      );
    });

    it('reads container exposes when one expose has a layer', () => {
      const { exposesMap } = collect(Reader, [layeredContainer]);
      expect(Object.values(exposesMap).map((expose) => expose.path)).toContain(
        './Button',
      );
      expect(Object.values(exposesMap).map((expose) => expose.path)).toContain(
        './Card',
      );
    });
  });

  it('the legacy reader skips layered shares instead of failing', () => {
    // Layered shares are a new feature; the old reader does not record them
    // (same as for webpack's `(layer)` segment), but the build must not break.
    const { sharedMap } = collect(LegacyModuleHandler, layeredShared);
    expect(sharedVersions(sharedMap)).toEqual({});
  });

  it('guards against identifier layouts the legacy reader cannot handle', () => {
    // Shapes considered and rejected during the layers work: a structural key
    // in place of the scope/name tokens drops every shared entry, and a
    // `[exposes, layers]` tuple payload crashes the reader.
    const { sharedMap } = collect(LegacyModuleHandler, [
      {
        moduleType: 'provide-module',
        identifier:
          'provide shared module [10:s7:defaultn5:react]@19.0.0 = /node_modules/react/index.js',
      },
    ]);
    expect(sharedVersions(sharedMap)).toEqual({});

    expect(() =>
      collect(LegacyModuleHandler, [
        {
          identifier:
            'container entry (default) [[["./Button",{"name":"__federation_expose_Button","import":["./src/Button.tsx"]}]],[null]]',
        },
      ]),
    ).toThrow(TypeError);
  });

  it('the current reader records layered shares', () => {
    const { sharedMap } = collect(ModuleHandler, layeredShared);
    expect(sharedVersions(sharedMap)).toEqual({
      react: '19.0.0',
      'lodash/get': '4.17.21',
    });
  });
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ManifestManager: LegacyManifestManager } = require(
  path.join(
    path.dirname(require.resolve('@module-federation/manifest-legacy')),
    'ManifestManager.js',
  ),
) as { ManifestManager: typeof ManifestManager };

it('preserves legacy manifest fields while adding concrete provider metadata', () => {
  const assets = {
    js: { sync: ['react.js'], async: [] },
    css: { sync: [], async: [] },
  };
  const stats = {
    id: 'host',
    name: 'host',
    metaData: {
      name: 'host',
      globalName: 'host',
      remoteEntry: { name: 'remoteEntry.js', path: '', type: 'global' },
    },
    exposes: [],
    remotes: [],
    shared: [
      {
        id: 'host:react',
        name: 'react',
        version: '18.0.0',
        singleton: false,
        requiredVersion: '^18',
        hash: 'unchanged',
        assets,
        usedIn: [],
        usedExports: [],
      },
    ],
  } as unknown as Stats;
  const generate = (Manager: typeof ManifestManager, input: Stats) =>
    new Manager().generateManifest({
      stats: structuredClone(input),
      compiler: { options: {} } as Compiler,
      compilation: {} as Compilation,
      publicPath: '/',
      bundler: 'rspack',
    });
  const legacy = generate(LegacyManifestManager, stats);
  expect(generate(ManifestManager, stats)).toEqual(legacy);
  expect('providers' in legacy.shared[0]).toBe(false);

  const providers = [
    { version: '18.0.0', import: './react18.js?mode=server', assets },
    {
      version: '19.0.0',
      import: './react19.js',
      assets: {
        ...assets,
        js: { sync: ['react19.js'], async: ['react19-async.js'] },
      },
    },
  ];
  stats.shared[0].providers = providers;
  const current = generate(ManifestManager, stats);
  expect(current.shared[0].providers).toEqual(providers);
  const { providers: _providers, ...legacyFields } = current.shared[0];
  expect(legacyFields).toEqual(legacy.shared[0]);
  expect(generate(LegacyManifestManager, stats)).toEqual(legacy);

  stats.shared[0].providers = [providers[0]];
  expect(generate(ManifestManager, stats)).toEqual(legacy);
});

it('preserves native layer metadata when rebuilding a manifest', () => {
  const stats = {
    id: 'host',
    name: 'host',
    metaData: {},
    remotes: [],
    shared: [
      {
        id: 'host:react',
        identityId: 'react-server',
        name: 'react',
        version: '19.0.0',
        layer: '',
        shareScope: ['server', 'default'],
        assets: {},
      },
    ],
    exposes: [
      {
        id: 'host:App',
        name: 'App',
        path: './App',
        layer: '',
        requiredShared: [
          { name: 'react', layer: '', shareScope: ['server', 'default'] },
        ],
        assets: {},
      },
    ],
  } as unknown as Stats;
  const manifest = new ManifestManager().generateManifest({
    stats,
    compiler: { options: {} } as Compiler,
    compilation: {} as Compilation,
    publicPath: '/',
    bundler: 'rspack',
  });
  expect(manifest.shared[0]).toMatchObject({
    identityId: 'react-server',
    layer: '',
    shareScope: ['server', 'default'],
  });
  expect(manifest.exposes[0]).toMatchObject({
    layer: '',
    requiredShared: stats.exposes[0].requiredShared,
  });
});

it.each([undefined, null])(
  'keeps omitted enhanced webpack layer %s unlayered',
  (layer) => {
    const module = new ConsumeSharedModule(process.cwd(), {
      shareScope: 'default',
      shareKey: 'react',
      requiredVersion: [4, 19, 0, 0],
      strictVersion: false,
      singleton: false,
      eager: false,
      layer,
    });
    const modules = [
      {
        moduleType: 'consume-shared-module',
        identifier: module.identifier(),
        layer: module.layer ?? undefined,
      },
    ] as StatsModule[];
    const legacy = new LegacyModuleHandler({ name: 'host' }, modules, {
      bundler: 'webpack',
    }).collect().sharedMap;
    const current = new ModuleHandler({ name: 'host' }, modules, {
      bundler: 'webpack',
    }).collect().sharedMap;
    expect(current).toEqual(legacy);
    expect(current.react.id).toBe('host:react');
    expect('layer' in current.react).toBe(false);
  },
);

it.each(['', 'undefined', 'null'])(
  'keeps explicit enhanced webpack layer %j',
  (layer) => {
    const module = new ConsumeSharedModule(process.cwd(), {
      shareScope: 'default',
      shareKey: 'react',
      requiredVersion: [4, 19, 0, 0],
      strictVersion: false,
      singleton: false,
      eager: false,
      layer,
    });
    const { sharedMap } = new ModuleHandler(
      { name: 'host' },
      [
        {
          moduleType: 'consume-shared-module',
          identifier: module.identifier(),
          layer: module.layer ?? undefined,
        },
      ] as StatsModule[],
      { bundler: 'webpack' },
    ).collect();
    expect(Object.values(sharedMap)).toEqual([
      expect.objectContaining({ name: 'react', version: '19.0.0', layer }),
    ]);
  },
);
