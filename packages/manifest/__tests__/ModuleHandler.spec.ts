import type { StatsModule } from 'webpack';

jest.mock(
  '@module-federation/sdk',
  () => ({
    composeKeyWithSeparator: (...parts: string[]) => parts.join(':'),
    moduleFederationPlugin: {},
    createLogger: () => ({
      debug: () => undefined,
      error: () => undefined,
      info: () => undefined,
      warn: () => undefined,
    }),
  }),
  { virtual: true },
);

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
      options?: { name?: string; exposes?: unknown };

      init(options: { name?: string; exposes?: unknown }) {
        this.options = options;
      }

      get enable() {
        const { name, exposes } = this.options || {};

        if (!name || !exposes) {
          return false;
        }

        if (Array.isArray(exposes)) {
          return exposes.length > 0;
        }

        return Object.keys(exposes as Record<string, unknown>).length > 0;
      }

      get containerPluginExposesOptions() {
        const { exposes } = this.options || {};

        if (!exposes || Array.isArray(exposes)) {
          return {};
        }

        return Object.entries(exposes as Record<string, unknown>).reduce(
          (acc, [exposeKey, exposeValue]) => {
            if (typeof exposeValue === 'string') {
              acc[exposeKey] = { import: [exposeValue] };
            } else if (Array.isArray(exposeValue)) {
              acc[exposeKey] = { import: exposeValue as string[] };
            } else if (
              exposeValue &&
              typeof exposeValue === 'object' &&
              'import' in exposeValue
            ) {
              const exposeImport = (
                exposeValue as { import: string | string[] }
              ).import;
              acc[exposeKey] = {
                import: Array.isArray(exposeImport)
                  ? exposeImport
                  : [exposeImport],
              };
            }

            return acc;
          },
          {} as Record<string, { import: string[] }>,
        );
      }
    },
    RemoteManager: class {
      statsRemoteWithEmptyUsedIn: unknown[] = [];
      normalizedOptions: Record<
        string,
        { alias: string; name: string; entry: string }
      > = {};

      init(options: { remotes?: Record<string, string> }) {
        this.normalizedOptions = Object.entries(options.remotes || {}).reduce(
          (normalizedOptions, [alias, remote]) => {
            const [name, entry] = remote.split('@');
            normalizedOptions[alias] = { alias, name, entry };
            return normalizedOptions;
          },
          {} as Record<string, { alias: string; name: string; entry: string }>,
        );
      }
    },
    SharedManager: class {
      normalizedOptions: Record<string, { requiredVersion?: string }> = {};
      init() {}
    },
  }),
  { virtual: true },
);

import type { moduleFederationPlugin } from '@module-federation/sdk';
import {
  ModuleHandler,
  parseStructuralSharedIdentifier,
} from '../src/ModuleHandler';

// Mirrors Rspack's `push_identifier_component`: `<len>:<value>`.
const component = (value: string) => `${value.length}:${value}`;
const structuralKey = (
  shareScope: string | string[],
  shareKey: string,
  layer?: string,
) => {
  const scope = Array.isArray(shareScope)
    ? `m${shareScope.length}:${shareScope.map(component).join('')}`
    : `s${component(shareScope)}`;
  const layerPart = layer === undefined ? 'n' : `l${component(layer)}`;
  return `${component(scope)}${layerPart}${component(shareKey)}`;
};

describe('parseStructuralSharedIdentifier', () => {
  it('decodes scope, layer and share key by length', () => {
    const identifier = `provide shared module [${structuralKey(
      'default',
      'react]@weird key',
      'server',
    )}]@19.0.0 = /node_modules/react/index.js`;

    expect(
      parseStructuralSharedIdentifier(identifier, 'provide shared module'),
    ).toEqual({
      shareKey: 'react]@weird key',
      shareScope: 'default',
      layer: 'server',
      suffix: '19.0.0 = /node_modules/react/index.js',
    });
  });

  it('decodes ordered share scopes and the empty layer', () => {
    const identifier = `consume shared module [${structuralKey(
      ['primary', 'default'],
      'lodash/get',
      '',
    )}]@^4.17.21 (strict)`;

    expect(
      parseStructuralSharedIdentifier(identifier, 'consume shared module'),
    ).toEqual({
      shareKey: 'lodash/get',
      shareScope: ['primary', 'default'],
      layer: '',
      suffix: '^4.17.21 (strict)',
    });
  });

  it('rejects legacy and malformed identifiers', () => {
    expect(
      parseStructuralSharedIdentifier(
        'provide shared module (default) react@19.0.0 = /react.js',
        'provide shared module',
      ),
    ).toBeUndefined();
    expect(
      parseStructuralSharedIdentifier(
        'provide shared module [99:s7:defaultn5:react]@1.0.0 = /react.js',
        'provide shared module',
      ),
    ).toBeUndefined();
    expect(
      parseStructuralSharedIdentifier(
        'provide shared module [10:s7:defaultx5:react]@1.0.0 = /react.js',
        'provide shared module',
      ),
    ).toBeUndefined();
  });
});

describe('ModuleHandler', () => {
  describe('rspack shared identifiers', () => {
    const collectShared = (identifiers: [string, string][]) => {
      const modules = identifiers.map(
        ([moduleType, identifier]) =>
          ({ moduleType, identifier }) as StatsModule,
      );
      const moduleHandler = new ModuleHandler(
        { name: 'host', exposes: { './Button': './src/Button.tsx' } },
        modules,
        { bundler: 'rspack' },
      );
      return moduleHandler.collect().sharedMap;
    };

    it('reads legacy positional identifiers', () => {
      const sharedMap = collectShared([
        [
          'provide-module',
          'provide shared module (default) react@18.2.0 = /node_modules/react/index.js',
        ],
        [
          'consume-shared-module',
          'consume shared module (default) lodash/get@^4.17.21 (strict) (fallback: /node_modules/lodash/get.js)',
        ],
      ]);

      expect(sharedMap.react).toMatchObject({ version: '18.2.0' });
      expect(sharedMap['lodash/get']).toMatchObject({ version: '4.17.21' });
    });

    it('reads structural identifiers for unlayered and layered shares', () => {
      const sharedMap = collectShared([
        [
          'provide-module',
          `provide shared module [${structuralKey(
            'default',
            'react',
          )}]@19.0.0 = /node_modules/react/index.js`,
        ],
        [
          'provide-module',
          `provide shared module [${structuralKey(
            'default',
            '@scope/pkg',
            'server',
          )}]@2.0.0 = /node_modules/@scope/pkg/index.js`,
        ],
        [
          'consume-shared-module',
          `consume shared module [${structuralKey(
            ['primary', 'default'],
            'lodash/get',
          )}]@^4.17.21 (strict) (fallback: /node_modules/lodash/get.js)`,
        ],
      ]);

      expect(sharedMap.react).toMatchObject({ version: '19.0.0' });
      expect(sharedMap['@scope/pkg']).toMatchObject({ version: '2.0.0' });
      expect(sharedMap['lodash/get']).toMatchObject({ version: '4.17.21' });
      // the structural key never leaks into the emitted record
      expect(Object.keys(sharedMap).some((key) => key.includes(':'))).toBe(
        false,
      );
    });
  });

  describe('container identifiers', () => {
    const collectExposes = (identifier: string) => {
      const moduleHandler = new ModuleHandler(
        { name: 'test-app' },
        [{ identifier } as StatsModule],
        { bundler: 'rspack' },
      );
      return moduleHandler.collect().exposesMap;
    };
    const exposes =
      '[["./Button",{"import":["./src/Button.tsx"],"name":"__federation_expose_Button"}],["./Card",{"import":["./src/Card.tsx"],"name":"__federation_expose_Card"}]]';

    it('reads the layered tuple payload, including array share scopes', () => {
      for (const identifier of [
        `container entry (default) [${exposes},[null,"server"]]`,
        `container entry [${component(
          `m2:${component('primary')}${component('default')}`,
        )}] [${exposes},[null,"server"]]`,
      ]) {
        const exposesMap = collectExposes(identifier);
        expect(exposesMap['./src/Button']?.path).toBe('./Button');
        expect(exposesMap['./src/Card']?.path).toBe('./Card');
      }
    });

    it('does not throw on an unsupported payload and falls back to options', () => {
      const moduleHandler = new ModuleHandler(
        { name: 'test-app', exposes: { './Button': './src/Button.tsx' } },
        [
          {
            identifier: 'container entry (default) [[1,2],[3]]',
          } as StatsModule,
        ],
        { bundler: 'rspack' },
      );

      const { exposesMap } = moduleHandler.collect();
      expect(Object.keys(exposesMap)).toEqual(['./src/Button']);
      expect(exposesMap['./src/Button']?.path).toBe('./Button');
    });
  });

  it('initializes exposes from plugin options when import paths contain spaces', () => {
    const options = {
      name: 'test-app',
      exposes: {
        './Button': './src/path with spaces/Button.tsx',
      },
    } as const;

    const moduleHandler = new ModuleHandler(options, [], {
      bundler: 'webpack',
    });

    const { exposesMap } = moduleHandler.collect();

    const expose = exposesMap['./src/path with spaces/Button'];

    expect(expose).toBeDefined();
    expect(expose?.path).toBe('./Button');
    expect(expose?.file).toBe('src/path with spaces/Button.tsx');
  });

  it('parses container exposes when identifiers contain spaces', () => {
    const options = {
      name: 'test-app',
    } as const;

    const modules: StatsModule[] = [
      {
        identifier:
          'container entry (default) [["./Button",{"import":["./src/path with spaces/Button.tsx"],"name":"__federation_expose_Button"}]]',
      } as StatsModule,
    ];

    const moduleHandler = new ModuleHandler(options, modules, {
      bundler: 'webpack',
    });

    const { exposesMap } = moduleHandler.collect();

    const expose = exposesMap['./src/path with spaces/Button'];

    expect(expose).toBeDefined();
    expect(expose?.path).toBe('./Button');
    expect(expose?.file).toBe('src/path with spaces/Button.tsx');
  });

  it('falls back to normalized exposes when identifier parsing fails', () => {
    const options = {
      exposes: {
        './Button': './src/Button.tsx',
        './Card': { import: ['./src/Card.tsx'], name: 'Card' },
        './Invalid': { import: [] },
        './Empty': '',
      },
    } as const;

    const modules: StatsModule[] = [
      {
        identifier: 'container entry (default)',
      } as StatsModule,
    ];

    const moduleHandler = new ModuleHandler(
      options as unknown as moduleFederationPlugin.ModuleFederationPluginOptions,
      modules,
      {
        bundler: 'webpack',
      },
    );

    const { exposesMap } = moduleHandler.collect();

    expect(exposesMap['./src/Button']).toBeDefined();
    expect(exposesMap['./src/Card']).toBeDefined();
    expect(exposesMap['./src/Button']?.path).toBe('./Button');
    expect(exposesMap['./src/Card']?.path).toBe('./Card');
  });

  it.each(['webpack', 'rspack'] as const)(
    'parses %s remote reference identifiers',
    (bundler) => {
      const modules: StatsModule[] = [
        {
          identifier: `remote (default) ${bundler}/container/reference/app2 ./Button`,
          nameForCondition: './src/App.tsx',
        } as StatsModule,
      ];

      const moduleHandler = new ModuleHandler(
        {
          name: 'host',
          remotes: {
            app2: 'app2@http://localhost:3002/remoteEntry.js',
          },
        },
        modules,
        { bundler },
      );

      const { remotes } = moduleHandler.collect();

      expect(remotes).toHaveLength(1);
      expect(remotes[0]).toMatchObject({
        alias: 'app2',
        consumingFederationContainerName: 'host',
        federationContainerName: 'app2',
        moduleName: 'Button',
        entry: 'http://localhost:3002/remoteEntry.js',
      });
    },
  );
});
