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
      init() {}
    },
    SharedManager: class {
      normalizedOptions: Record<string, { requiredVersion?: string }> = {};
      init() {}
    },
  }),
  { virtual: true },
);

import type { moduleFederationPlugin } from '@module-federation/sdk';
// eslint-disable-next-line import/first
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
});
