import { ComposedRuntimePlugin } from '../src/ComposedRuntimePlugin';
import { resolveRspackRuntimeImplementation } from '../src/ModuleFederationPlugin';

type Tap = (...args: any[]) => unknown;

// @rspack/core 0.7 sets compiler.webpack but not compiler.rspack, and has no experiments export.
function rspack07Compiler() {
  const taps: Record<string, Tap> = {};
  const hook = (name: string) => ({
    tap: (_: string, fn: Tap) => (taps[name] = fn),
    tapPromise: (_: string, fn: Tap) => (taps[name] = fn),
  });
  const compiler = {
    context: __dirname,
    options: { resolve: { alias: {} }, externals: undefined },
    hooks: {
      environment: hook('environment'),
      beforeRun: hook('beforeRun'),
      watchRun: hook('watchRun'),
      thisCompilation: hook('thisCompilation'),
    },
    webpack: {
      WebpackError: Error,
    },
  };
  return { compiler, taps };
}

it('keeps the full runtime and warns on an @rspack/core without compiler.rspack', async () => {
  const { compiler, taps } = rspack07Compiler();
  const implementation = resolveRspackRuntimeImplementation();
  new ComposedRuntimePlugin(
    { name: 'host' },
    {
      runtimeTools: implementation,
      bundlerRuntime: require.resolve(
        '@module-federation/webpack-bundler-runtime',
        { paths: [implementation] },
      ),
      runtime: require.resolve('@module-federation/runtime', {
        paths: [implementation],
      }),
    },
    'host:1.0.0',
  ).apply(compiler as never);

  taps['environment']();
  await taps['beforeRun']();
  const compilation = { warnings: [] as Error[] };
  taps['thisCompilation'](compilation);

  expect(compilation.warnings.map((w) => w.message)).toEqual([
    expect.stringContaining(
      'this @rspack/core has no experiments.VirtualModulesPlugin',
    ),
  ]);
  expect(compiler.options.resolve.alias).toEqual({});
});
