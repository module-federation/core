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

// eslint-disable-next-line import/first
import { ModuleHandler } from '../src/ModuleHandler';

describe('ModuleHandler', () => {
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
});
