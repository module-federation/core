import {
  ModuleFederationPlugin,
  resolveRspackRuntimeAlias,
  resolveRspackRuntimeImplementation,
} from '../src/ModuleFederationPlugin';

function getOptimizationDefines(
  optimization?: NonNullable<
    NonNullable<
      ConstructorParameters<typeof ModuleFederationPlugin>[0]['experiments']
    >['optimization']
  >,
  exposes?: ConstructorParameters<typeof ModuleFederationPlugin>[0]['exposes'],
) {
  let definitions: Record<string, string | boolean> = {};
  class DefinePlugin {
    constructor(options: Record<string, string | boolean>) {
      definitions = options;
    }

    apply() {}
  }

  const plugin = new ModuleFederationPlugin({
    name: 'test',
    exposes,
    experiments: { optimization },
  });

  (plugin as any)._patchBundlerConfig({
    webpack: { DefinePlugin },
  });

  return definitions;
}

describe('runtime resolution compatibility', () => {
  it('prefers the bundler implementation when available', () => {
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

  it('falls back to legacy esm runtime entries for older implementations', () => {
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

  it('falls back to legacy cjs runtime entries when esm legacy builds are unavailable', () => {
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

describe('runtime capability optimization defines', () => {
  it('keeps all runtime capabilities enabled by default', () => {
    expect(getOptimizationDefines()).toMatchObject({
      FEDERATION_OPTIMIZE_NO_REMOTE: false,
      FEDERATION_OPTIMIZE_NO_SHARED: false,
      FEDERATION_HAS_EXPOSES: false,
    });
  });

  it('derives expose capability from the container configuration', () => {
    expect(getOptimizationDefines(undefined, {})).toMatchObject({
      FEDERATION_HAS_EXPOSES: false,
    });
    expect(
      getOptimizationDefines(undefined, {
        './Button': './src/Button',
      }),
    ).toMatchObject({
      FEDERATION_HAS_EXPOSES: true,
    });
  });

  it('defines each disabled runtime capability independently', () => {
    expect(
      getOptimizationDefines({
        disableRemote: true,
        disableShared: true,
      }),
    ).toMatchObject({
      FEDERATION_OPTIMIZE_NO_REMOTE: true,
      FEDERATION_OPTIMIZE_NO_SHARED: true,
    });
  });
});

describe('dts plugin loading', () => {
  function createCompiler() {
    class NoopPlugin {
      apply() {}
    }
    return {
      context: __dirname,
      options: {
        plugins: [],
        resolve: { alias: {} },
      },
      webpack: {
        DefinePlugin: NoopPlugin,
        container: { ModuleFederationPlugin: NoopPlugin },
      },
      hooks: {
        afterPlugins: { tap: jest.fn() },
      },
    };
  }

  function loadPluginWithDtsFactory(
    dtsPluginFactory: () => Record<string, unknown>,
  ) {
    let Plugin!: typeof ModuleFederationPlugin;
    jest.isolateModules(() => {
      jest.doMock('@module-federation/dts-plugin', dtsPluginFactory);
      ({ ModuleFederationPlugin: Plugin } =
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('../src/ModuleFederationPlugin') as typeof import('../src/ModuleFederationPlugin'));
    });
    return Plugin;
  }

  afterEach(() => {
    jest.dontMock('@module-federation/dts-plugin');
  });

  it('does not load @module-federation/dts-plugin when dts is disabled', () => {
    const dtsPluginFactory = jest.fn(() => ({ DtsPlugin: jest.fn() }));
    const Plugin = loadPluginWithDtsFactory(dtsPluginFactory);

    new Plugin({ name: 'host', dts: false, manifest: false }).apply(
      createCompiler() as any,
    );

    expect(dtsPluginFactory).not.toHaveBeenCalled();
  });

  it('loads and applies @module-federation/dts-plugin when dts is enabled', () => {
    const dtsApply = jest.fn();
    const addRuntimePlugins = jest.fn();
    const DtsPlugin = jest.fn(() => ({ apply: dtsApply, addRuntimePlugins }));
    const dtsPluginFactory = jest.fn(() => ({ DtsPlugin }));
    const Plugin = loadPluginWithDtsFactory(dtsPluginFactory);

    expect(dtsPluginFactory).not.toHaveBeenCalled();

    const compiler = createCompiler();
    new Plugin({ name: 'host', manifest: false }).apply(compiler as any);

    expect(dtsPluginFactory).toHaveBeenCalledTimes(1);
    expect(DtsPlugin).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'host' }),
    );
    expect(dtsApply).toHaveBeenCalledWith(compiler);
    expect(addRuntimePlugins).toHaveBeenCalled();
  });
});
