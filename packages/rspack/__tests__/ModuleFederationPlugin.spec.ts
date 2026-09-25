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
