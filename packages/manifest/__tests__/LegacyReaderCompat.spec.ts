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

const sharedVersions = (sharedMap: Record<string, { version: string }>) =>
  Object.fromEntries(
    Object.entries(sharedMap).map(([name, { version }]) => [name, version]),
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

    it('reads container exposes without layers', () => {
      const { exposesMap } = collect(Reader, [unlayeredContainer]);
      expect(exposesMap['./src/Button']?.path).toBe('./Button');
      expect(exposesMap['./src/Card']?.path).toBe('./Card');
    });

    it('reads container exposes when one expose has a layer', () => {
      const { exposesMap } = collect(Reader, [layeredContainer]);
      expect(exposesMap['./src/Button']?.path).toBe('./Button');
      expect(exposesMap['./src/Card']?.path).toBe('./Card');
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
