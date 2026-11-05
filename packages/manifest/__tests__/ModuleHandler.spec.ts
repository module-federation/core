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
      normalizedOptions: Record<
        string,
        { requiredVersion?: string; version?: string }
      > = {};
      init(options?: {
        shared?: Record<string, { requiredVersion?: string; version?: string }>;
      }) {
        this.normalizedOptions = { ...(options?.shared || {}) };
      }
    },
  }),
  { virtual: true },
);

import type { moduleFederationPlugin } from '@module-federation/sdk';
import { ModuleHandler } from '../src/ModuleHandler';

describe('ModuleHandler', () => {
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

  describe('shared share scopes', () => {
    const collectShared = (
      identifiers: string[],
      bundler: 'webpack' | 'rspack',
      shared?: moduleFederationPlugin.ModuleFederationPluginOptions['shared'],
    ) => {
      const modules = identifiers.map(
        (identifier) =>
          ({
            identifier,
            moduleType: identifier.startsWith('provide')
              ? 'provide-module'
              : 'consume-shared-module',
          }) as StatsModule,
      );
      const { sharedMap } = new ModuleHandler(
        { name: 'host', shared },
        modules,
        {
          bundler,
        },
      ).collect();
      return Object.values(sharedMap);
    };

    it('records the share scope from rspack identifiers', () => {
      const shared = collectShared(
        [
          'provide shared module (custom) react@18.3.1 = /app/node_modules/react/index.js',
          'consume shared module (custom) react@^18.0.0 (strict) (fallback: /app/node_modules/react/index.js)',
        ],
        'rspack',
      );

      expect(shared).toHaveLength(1);
      expect(shared[0]).toMatchObject({
        id: 'host:react',
        name: 'react',
        version: '18.3.1',
        shareScope: 'custom',
      });
    });

    it('records every scope of a multi-scope rspack entry', () => {
      const shared = collectShared(
        [
          'provide shared module (default|custom) react@18.3.1 = /app/node_modules/react/index.js',
        ],
        'rspack',
      );

      expect(shared[0].shareScope).toEqual(['default', 'custom']);
    });

    it('keeps one entry per scope when a package is shared in two scopes', () => {
      const shared = collectShared(
        [
          'provide shared module (default) react@18.3.1 = /app/node_modules/react/index.js',
          'provide shared module (legacy) react@17.0.2 = /app/node_modules/react17/index.js',
        ],
        'rspack',
      );

      expect(
        shared.map(({ name, version, shareScope }) => ({
          name,
          version,
          shareScope,
        })),
      ).toEqual([
        { name: 'react', version: '18.3.1', shareScope: 'default' },
        { name: 'react', version: '17.0.2', shareScope: 'legacy' },
      ]);
      expect(new Set(shared.map(({ id }) => id)).size).toBe(2);
    });

    it('records the share scope from webpack identifiers', () => {
      const shared = collectShared(
        [
          'provide module (custom) react@18.2.0 = /app/node_modules/react/index.js',
          'consume-shared-module|custom|react|=18.2.0|false|/app/node_modules/react/index.js|true|false|undefined',
        ],
        'webpack',
      );

      expect(shared).toHaveLength(1);
      expect(shared[0]).toMatchObject({
        id: 'host:react',
        name: 'react',
        version: '18.2.0',
        shareScope: 'custom',
      });
    });

    it('parses webpack consume identifiers with an array share scope', () => {
      const shared = collectShared(
        [
          'consume-shared-module|default|custom|react|=18.2.0|false|/app/node_modules/react/index.js|true|false|undefined',
        ],
        'webpack',
      );

      expect(shared).toHaveLength(1);
      expect(shared[0]).toMatchObject({
        name: 'react',
        version: '18.2.0',
        shareScope: ['default', 'custom'],
      });
    });

    it('parses webpack consume identifiers whose required version is an OR range', () => {
      const shared = collectShared(
        [
          'consume-shared-module|default|react|^17 || ^18|false|/app/node_modules/react/index.js|true|false|undefined',
          'consume-shared-module|default|custom|react-dom|^17 || ^18 || ^19|false|undefined|true|false|undefined',
        ],
        'webpack',
        {
          react: { version: '18.2.0', requiredVersion: '^17 || ^18' },
          'react-dom': {
            version: '18.2.0',
            requiredVersion: '^17 || ^18 || ^19',
            import: false,
          },
        },
      );

      expect(
        shared.map(({ name, version, shareScope }) => ({
          name,
          version,
          shareScope,
        })),
      ).toEqual([
        { name: 'react', version: '18.2.0', shareScope: 'default' },
        {
          name: 'react-dom',
          version: '18.2.0',
          shareScope: ['default', 'custom'],
        },
      ]);
    });
  });
});
