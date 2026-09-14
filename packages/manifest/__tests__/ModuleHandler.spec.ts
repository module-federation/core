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
import { ModuleHandler } from '../src/ModuleHandler';
import {
  splitSharedIdentifier,
  getSharedModules,
  getSharedIdentity,
} from '../src/utils';

describe('splitSharedIdentifier', () => {
  it('removes the optional layer segment after the scope', () => {
    expect(
      splitSharedIdentifier(
        'provide shared module (default) (server) react@19.0.0 = /react.js',
        3,
      ),
    ).toEqual({
      tokens: [
        'provide',
        'shared',
        'module',
        '(default)',
        'react@19.0.0',
        '=',
        '/react.js',
      ],
      layer: 'server',
    });
    expect(
      splitSharedIdentifier(
        'provide module (default) () react@19.0.0 = /react.js',
        2,
      ),
    ).toEqual({
      tokens: [
        'provide',
        'module',
        '(default)',
        'react@19.0.0',
        '=',
        '/react.js',
      ],
      layer: '',
    });
  });

  it('leaves unlayered identifiers untouched', () => {
    const identifier =
      'consume shared module (default) lodash/get@^4.17.21 (strict) (fallback: /get.js)';
    expect(splitSharedIdentifier(identifier, 3)).toEqual({
      tokens: identifier.split(' '),
    });
  });
});

describe('ModuleHandler', () => {
  describe('shared identifiers', () => {
    const collectShared = (
      bundler: 'webpack' | 'rspack',
      identifiers: [string, string][],
    ) => {
      const modules = identifiers.map(
        ([moduleType, identifier]) =>
          ({ moduleType, identifier }) as StatsModule,
      );
      const moduleHandler = new ModuleHandler(
        { name: 'host', exposes: { './Button': './src/Button.tsx' } },
        modules,
        { bundler },
      );
      return moduleHandler.collect().sharedMap;
    };

    it('reads rspack identifiers with and without a layer segment', () => {
      const sharedMap = collectShared('rspack', [
        [
          'provide-module',
          'provide shared module (default) react@19.0.0 = /node_modules/react/index.js',
        ],
        [
          'provide-module',
          'provide shared module (default) (server) @scope/pkg@2.0.0 = /node_modules/@scope/pkg/index.js',
        ],
        [
          'consume-shared-module',
          'consume shared module (primary|default) (client) lodash/get@^4.17.21 (strict) (fallback: /node_modules/lodash/get.js)',
        ],
      ]);

      expect(
        Object.values(sharedMap).find((shared) => shared.name === 'react'),
      ).toMatchObject({ version: '19.0.0' });
      expect(
        Object.values(sharedMap).find((shared) => shared.name === '@scope/pkg'),
      ).toMatchObject({ version: '2.0.0' });
      expect(
        Object.values(sharedMap).find((shared) => shared.name === 'lodash/get'),
      ).toMatchObject({ version: '4.17.21' });
    });

    it('reads webpack provide identifiers with a layer segment', () => {
      const sharedMap = collectShared('webpack', [
        [
          'provide-module',
          'provide module (default) (server) react@19.0.0 = /node_modules/react/index.js',
        ],
        [
          'consume-shared-module',
          'consume-shared-module|default|react-dom|=19.0.0|false|/node_modules/react-dom/index.js|true|false|server',
        ],
      ]);

      expect(
        Object.values(sharedMap).find((shared) => shared.name === 'react'),
      ).toMatchObject({ version: '19.0.0' });
      expect(
        Object.values(sharedMap).find((shared) => shared.name === 'react-dom'),
      ).toMatchObject({ version: '19.0.0' });
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

    it('reads expose options with a layer, including array share scopes', () => {
      const exposes =
        '[["./Button",{"name":"__federation_expose_Button","import":["./src/Button.tsx"]}],["./Card",{"name":"__federation_expose_Card","import":["./src/Card.tsx"],"layer":"server"}]]';
      for (const identifier of [
        `container entry (default) ${exposes}`,
        `container entry [m2:7:primary7:default] ${exposes}`,
      ]) {
        const exposesMap = collectExposes(identifier);
        expect(exposesMap['./Button']?.path).toBe('./Button');
        expect(exposesMap['./Card']?.path).toBe('./Card');
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
      expect(Object.keys(exposesMap)).toEqual(['./Button']);
      expect(exposesMap['./Button']?.path).toBe('./Button');
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

    const expose = exposesMap['./Button'];

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

    const expose = exposesMap['./Button'];

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

    expect(exposesMap['./Button']).toBeDefined();
    expect(exposesMap['./Card']).toBeDefined();
    expect(exposesMap['./Button']?.path).toBe('./Button');
    expect(exposesMap['./Card']?.path).toBe('./Card');
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

describe('layered manifest regressions', () => {
  it.each(['server components', 'server (components)', ''])(
    'keeps shared metadata and asset keys for layer %j',
    (layer) => {
      const name = `consume shared module (default) (${layer}) react@19.0.0 (fallback: /react.js)`;
      const shared = {
        name,
        identifier: name,
        moduleType: 'consume-shared-module',
      } as StatsModule;
      const handler = new ModuleHandler({ name: 'host' }, [shared], {
        bundler: 'rspack',
      });
      expect(Object.values(handler.collect().sharedMap)[0].version).toBe(
        '19.0.0',
      );
      expect(
        getSharedModules({ modules: [{ issuerName: name, chunks: [1] }] }, [
          shared,
        ])[0][0],
      ).toBe(Object.keys(handler.collect().sharedMap)[0]);
    },
  );

  it.each([false, true])(
    'keeps aliased multi-import exposes regardless of module order (%s)',
    (reverse) => {
      const exposes = {
        './Server': {
          import: ['./src/setup.ts', './src/Button.tsx'],
          layer: 'server',
        },
        './Client': {
          import: ['./src/setup.ts', './src/Button.tsx'],
          layer: 'client',
        },
      };
      const modules: StatsModule[] = [
        {
          identifier: `container entry (default) ${JSON.stringify(Object.entries(exposes))}`,
        },
        {
          identifier: 'consume shared module (default) react@19.0.0',
          moduleType: 'consume-shared-module',
          issuerName: './src/Button.tsx',
        },
      ];
      if (reverse) modules.reverse();
      const handler = new ModuleHandler({ name: 'host', exposes }, modules, {
        bundler: 'rspack',
      });
      const { exposesMap, sharedMap } = handler.collect();
      expect(Object.keys(exposesMap)).toEqual(['./Server', './Client']);
      expect(exposesMap['./Server'].requires).toEqual(['react']);
      expect(exposesMap['./Client'].requires).toEqual(['react']);
      expect([...sharedMap.react.usedIn]).toEqual(['./Server', './Client']);
    },
  );
});

it('decodes native ordered scope identities with UTF-8 lengths', () => {
  const component = (value: string) => `${Buffer.byteLength(value)}:${value}`;
  const key = `${component(`m2:${component('server scope')}${component('default')}`)}l${component('服务端')}${component('react')}`;
  const identifier = `provide shared module (server scope|default) (服务端) react@19.0.0 = /react.js [identity:${key}]`;
  expect(getSharedIdentity(identifier, 3)).toEqual({
    key,
    name: 'react',
    layer: '服务端',
    shareScope: ['server scope', 'default'],
  });
  const { sharedMap } = new ModuleHandler(
    { name: 'host' },
    [{ identifier, moduleType: 'provide-module' }],
    { bundler: 'rspack' },
  ).collect();
  expect(sharedMap[key]).toMatchObject({
    id: `host:shared:${key}`,
    name: 'react',
    version: '19.0.0',
    layer: '服务端',
    shareScope: ['server scope', 'default'],
  });
});

it('reads space-containing share keys from the structural identity suffix', () => {
  const key = '10:s7:defaultl9:服务端4:b) c';
  const identifier = `provide shared module (default) (服务端) b) c@19.0.0 = /first.js [identity:${key}]`;
  const { sharedMap, sharedProviderModules } = new ModuleHandler(
    { name: 'host' },
    [{ identifier, moduleType: 'provide-module' }],
    { bundler: 'rspack' },
  ).collect();
  expect(sharedMap[key]).toMatchObject({
    name: 'b) c',
    version: '19.0.0',
    layer: '服务端',
  });
  expect(sharedProviderModules[0]).toMatchObject({
    name: key,
    version: '19.0.0',
    request: '/first.js',
  });
});

it('attributes same-source aliases to the resolved importer layer', () => {
  const entries = [
    ['./Server', { import: ['./Button.js'], layer: 'server' }],
    ['./Client', { import: ['./Button.js'], layer: 'client' }],
  ];
  const modules = [
    { identifier: `container entry (default) ${JSON.stringify(entries)}` },
    {
      identifier: 'javascript/auto|/Button.js|server',
      name: './Button.js',
      layer: 'server',
    },
    {
      identifier: 'javascript/auto|/Button.js|client',
      name: './Button.js',
      layer: 'client',
    },
    {
      identifier: 'consume shared module (default) react@19.0.0',
      moduleType: 'consume-shared-module',
      issuerName: './Button.js',
      issuer: 'javascript/auto|/Button.js|server',
      reasons: [
        {
          moduleName: './Button.js',
          moduleIdentifier: 'javascript/auto|/Button.js|server',
        },
      ],
    },
  ];
  const { exposesMap, sharedMap } = new ModuleHandler(
    { name: 'host' },
    modules,
    { bundler: 'rspack' },
  ).collect();
  expect(exposesMap['./Server'].requires).toEqual(['react']);
  expect(exposesMap['./Client'].requires).toEqual([]);
  expect([...sharedMap.react.usedIn]).toEqual(['./Server']);
});

it('uses the built expose layer when a rule overrides its configured layer', () => {
  const modules = [
    {
      identifier:
        'container entry (default) [["./Button",{"import":["./Button.js"],"layer":"requested"}]]',
    },
    {
      identifier: 'javascript/auto|/Button.js|effective',
      name: './Button.js',
      layer: 'effective',
      reasons: [{ type: 'container exposed', userRequest: './Button.js' }],
    },
    {
      identifier: 'consume shared module (default) react@19.0.0',
      moduleType: 'consume-shared-module',
      issuerName: './Button.js',
      issuer: 'javascript/auto|/Button.js|effective',
    },
  ];
  const { exposesMap, sharedMap } = new ModuleHandler(
    { name: 'host' },
    modules,
    { bundler: 'rspack' },
  ).collect();
  expect(exposesMap['./Button'].requires).toEqual(['react']);
  expect([...sharedMap.react.usedIn]).toEqual(['./Button']);
});
