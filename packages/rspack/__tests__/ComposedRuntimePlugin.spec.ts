import fs from 'node:fs';
import path from 'node:path';
import { MIN_RUNTIME_VERSION } from '@module-federation/managers';
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

it('fails the build for an older runtime family', async () => {
  const store = path.resolve(__dirname, '../../../node_modules/.pnpm');
  const [older] = fs
    .readdirSync(store)
    .filter((dir) =>
      /^@module-federation\+runtime-tools@2\.\d+\.\d+$/.test(dir),
    );
  const implementation = path.join(
    store,
    older,
    'node_modules/@module-federation/runtime-tools',
  );
  const { compiler, taps } = rspack07Compiler();
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
  const compilation = { errors: [] as Error[], warnings: [] as Error[] };
  taps['thisCompilation'](compilation);

  expect(compilation.errors.map((e) => e.message)).toEqual([
    expect.stringMatching(
      new RegExp(
        `^The federation runtime cannot be composed: @module-federation/webpack-bundler-runtime at .* does not export "\\./compose": the installed runtime family lacks the subpath exports this build needs; update the @module-federation runtime packages to the release that added them \\(${MIN_RUNTIME_VERSION.replace(/\./g, '\\.')}\\)\\.$`,
      ),
    ),
  ]);
  expect(compilation.warnings).toEqual([]);
  expect(compiler.options.resolve.alias).toEqual({});
});
