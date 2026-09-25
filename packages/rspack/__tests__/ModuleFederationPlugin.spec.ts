import * as pluginEntry from '../src/plugin';
import {
  ModuleFederationPlugin,
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
          request === '@module-federation/runtime-tools/bundler'
        ) {
          throw new Error(`Cannot find module '${request}'`);
        }
        if (request === '@module-federation/runtime-tools/dist/index.js') {
          return '/legacy/runtime-tools/dist/index.js';
        }

        throw new Error(`Unexpected request: ${request}`);
      },
    ) as typeof require.resolve;

    expect(
      resolveRspackRuntimeImplementation('/legacy/runtime-tools', resolve),
    ).toBe('/legacy/runtime-tools/dist/index.js');
  });

  it('falls back to legacy cjs runtime entries when esm legacy builds are unavailable', () => {
    const resolve = jest.fn(
      (request: string, options?: { paths?: string[] }) => {
        const basedFromLegacy = options?.paths?.[0] === '/legacy/runtime-tools';

        if (
          basedFromLegacy &&
          (request === '@module-federation/runtime-tools/bundler' ||
            request === '@module-federation/runtime-tools/dist/index.js')
        ) {
          throw new Error(`Cannot find module '${request}'`);
        }
        if (request === '@module-federation/runtime-tools/dist/index.cjs') {
          return '/legacy/runtime-tools/dist/index.cjs';
        }

        throw new Error(`Unexpected request: ${request}`);
      },
    ) as typeof require.resolve;

    expect(
      resolveRspackRuntimeImplementation('/legacy/runtime-tools', resolve),
    ).toBe('/legacy/runtime-tools/dist/index.cjs');
  });
});

describe('@module-federation/rspack/plugin', () => {
  it('no longer exports resolveRspackRuntimeAlias', () => {
    expect(pluginEntry).not.toHaveProperty('resolveRspackRuntimeAlias');
  });
});

describe('runtime optimization defines', () => {
  it('defines only ENV_TARGET, from experiments.optimization.target', () => {
    expect(
      getOptimizationDefines(
        { target: 'web', disableRemote: true, disableShared: true },
        { './Button': './src/Button' },
      ),
    ).toEqual({ ENV_TARGET: '"web"' });
  });

  it('defines nothing without a target', () => {
    expect(
      getOptimizationDefines({ disableSnapshot: true }, { './Button': './B' }),
    ).toEqual({});
  });
});
