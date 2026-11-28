/*
 * @rstest-environment node
 */
import ModuleFederationPlugin from '../../../src/lib/container/ModuleFederationPlugin';

type Options = ConstructorParameters<typeof ModuleFederationPlugin>[0];

function definesFor(options: Options) {
  const definitions: Record<string, unknown>[] = [];
  class DefinePlugin {
    constructor(value: Record<string, unknown>) {
      definitions.push(value);
    }
    apply() {}
  }
  const compiler = {
    options: { plugins: [] },
    webpack: { DefinePlugin },
  };
  (
    new ModuleFederationPlugin(options) as unknown as {
      _patchBundlerConfig(compiler: unknown): void;
    }
  )._patchBundlerConfig(compiler);
  return Object.assign({}, ...definitions);
}

describe('ModuleFederationPlugin defines', () => {
  it('defines only ENV_TARGET, from experiments.optimization.target', () => {
    expect(
      definesFor({
        name: 'host',
        exposes: { './Button': './Button' },
        experiments: {
          optimization: {
            target: 'web',
            disableRemote: true,
            disableShared: true,
            disableSnapshot: true,
          },
        },
      }),
    ).toEqual({ ENV_TARGET: '"web"' });
  });

  it('defines nothing without a target', () => {
    expect(definesFor({ name: 'host' })).toEqual({});
  });
});
