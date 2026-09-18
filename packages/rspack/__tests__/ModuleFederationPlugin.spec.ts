import {
  ModuleFederationPlugin,
  resolveRspackRuntimeAlias,
  resolveRspackRuntimeImplementation,
  runtimeCapabilityDefines,
} from '../src/ModuleFederationPlugin';

function getOptimizationDefines(
  optimization?: NonNullable<
    NonNullable<
      ConstructorParameters<typeof ModuleFederationPlugin>[0]['experiments']
    >['optimization']
  >,
  exposes?: ConstructorParameters<typeof ModuleFederationPlugin>[0]['exposes'],
) {
  return runtimeCapabilityDefines({
    name: 'test',
    exposes,
    experiments: { optimization },
  });
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

  it('does not replace a missing custom family member from another install', () => {
    expect(() => resolveRspackRuntimeAlias('/legacy/runtime-tools')).toThrow(
      /No package\.json found|Could not resolve|missing-anchor/,
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
