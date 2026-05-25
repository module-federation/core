function mockModuleFederationPluginDependencies(
  dtsPluginFactory = () => ({
    DtsPlugin: class {
      apply = jest.fn();
      addRuntimePlugins = jest.fn();
    },
  }),
) {
  const noopLogger = {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };

  jest.doMock('@module-federation/dts-plugin', dtsPluginFactory, {
    virtual: true,
  });
  jest.doMock(
    '@module-federation/sdk',
    () => ({
      bindLoggerToCompiler: jest.fn(),
      composeKeyWithSeparator: (...parts: string[]) => parts.join(':'),
      createInfrastructureLogger: jest.fn(() => noopLogger),
      createLogger: jest.fn(() => noopLogger),
      moduleFederationPlugin: {},
    }),
    { virtual: true },
  );
  jest.doMock(
    '@module-federation/manifest',
    () => ({
      StatsPlugin: class {
        apply = jest.fn();
      },
    }),
    { virtual: true },
  );
  jest.doMock(
    '@module-federation/managers',
    () => ({
      ContainerManager: class {
        init = jest.fn();

        get enable() {
          return false;
        }

        get containerPluginExposesOptions() {
          return {};
        }
      },
      utils: {
        getBuildVersion: () => 'test-build',
      },
    }),
    { virtual: true },
  );
  jest.doMock(
    '@module-federation/bridge-react-webpack-plugin',
    () => ({
      __esModule: true,
      default: jest.fn(),
    }),
    { virtual: true },
  );
  jest.doMock('../src/RemoteEntryPlugin', () => ({
    RemoteEntryPlugin: class {
      apply = jest.fn();
    },
  }));
}

async function importModuleFederationPlugin() {
  mockModuleFederationPluginDependencies();

  return import('../src/ModuleFederationPlugin');
}

describe('runtime resolution compatibility', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('prefers the bundler implementation when available', async () => {
    const { resolveRspackRuntimeImplementation } =
      await importModuleFederationPlugin();
    const resolve = jest.fn((request: string) => {
      if (request === '@module-federation/runtime-tools/bundler') {
        return '/workspace/runtime-tools/dist/bundler.js';
      }

      throw new Error(`Unexpected request: ${request}`);
    }) as typeof require.resolve;

    expect(resolveRspackRuntimeImplementation(undefined, resolve)).toBe(
      '/workspace/runtime-tools/dist/bundler.js',
    );
  });

  it('falls back to legacy esm runtime entries for older implementations', async () => {
    const { resolveRspackRuntimeAlias } = await importModuleFederationPlugin();
    const resolve = jest.fn(
      (request: string, options?: { paths?: string[] }) => {
        const basedFromLegacy = options?.paths?.[0] === '/legacy/runtime-tools';

        if (
          basedFromLegacy &&
          request === '@module-federation/runtime/bundler'
        ) {
          throw new Error(`Cannot find module '${request}'`);
        }
        if (request === '@module-federation/runtime/dist/index.js') {
          return '/legacy/runtime/dist/index.js';
        }

        throw new Error(`Unexpected request: ${request}`);
      },
    ) as typeof require.resolve;

    expect(resolveRspackRuntimeAlias('/legacy/runtime-tools', resolve)).toBe(
      '/legacy/runtime/dist/index.js',
    );
  });

  it('falls back to legacy cjs runtime entries when esm legacy builds are unavailable', async () => {
    const { resolveRspackRuntimeAlias } = await importModuleFederationPlugin();
    const resolve = jest.fn(
      (request: string, options?: { paths?: string[] }) => {
        const basedFromLegacy = options?.paths?.[0] === '/legacy/runtime-tools';

        if (
          basedFromLegacy &&
          (request === '@module-federation/runtime/bundler' ||
            request === '@module-federation/runtime/dist/index.js')
        ) {
          throw new Error(`Cannot find module '${request}'`);
        }
        if (request === '@module-federation/runtime/dist/index.cjs') {
          return '/legacy/runtime/dist/index.cjs';
        }

        throw new Error(`Unexpected request: ${request}`);
      },
    ) as typeof require.resolve;

    expect(resolveRspackRuntimeAlias('/legacy/runtime-tools', resolve)).toBe(
      '/legacy/runtime/dist/index.cjs',
    );
  });
});

describe('ModuleFederationPlugin', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('does not load the DTS plugin when the plugin module is imported', async () => {
    const dtsPluginFactory = jest.fn(() => {
      throw new Error('DTS plugin should not be loaded');
    });
    mockModuleFederationPluginDependencies(dtsPluginFactory);

    await expect(
      import('../src/ModuleFederationPlugin'),
    ).resolves.toBeDefined();
    expect(dtsPluginFactory).not.toHaveBeenCalled();
  });
});
