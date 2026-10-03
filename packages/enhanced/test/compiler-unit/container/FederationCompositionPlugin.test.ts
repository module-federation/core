import fs from 'fs';
import { createRequire } from 'module';
import os from 'os';
import path from 'path';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import ModuleFederationPlugin from '../../../src/lib/container/ModuleFederationPlugin';
import ContainerReferencePlugin from '../../../src/lib/container/ContainerReferencePlugin';
import FederationRuntimePlugin from '../../../src/lib/container/runtime/FederationRuntimePlugin';
import { COVERED_BY_OPTIONS } from '../../../src/lib/container/runtime/FederationCompositionPlugin';

const webpack = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

const pnpmStore = path.resolve(__dirname, '../../../../../node_modules/.pnpm');
const olderRuntimeTools = () => {
  const [older] = fs
    .readdirSync(pnpmStore)
    .filter((dir) =>
      /^@module-federation\+runtime-tools@2\.\d+\.\d+$/.test(dir),
    );
  return path.join(
    pnpmStore,
    older,
    'node_modules/@module-federation/runtime-tools',
  );
};

const COMPOSE = /webpack-bundler-runtime[\\/]dist[\\/]compose\.js$/;
const REMOTES_ADAPTER =
  /webpack-bundler-runtime[\\/]dist[\\/]adapters[\\/]remotes\.js$/;

let dirs: string[] = [];
afterAll(() => {
  for (const dir of dirs) fs.rmSync(dir, { recursive: true, force: true });
});

function fixture(files: Record<string, string>) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-composition-'));
  dirs.push(dir);
  for (const [file, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), content);
  }
  return dir;
}

function compile(context: string, config: Record<string, unknown>) {
  const outputPath = path.join(context, `dist-${dirs.length}-${Math.random()}`);
  return new Promise<{ stats: any; output: Record<string, string> }>(
    (resolve, reject) => {
      webpack(
        {
          context,
          mode: 'production',
          devtool: false,
          // Two builds of one checkout can otherwise concatenate around different roots.
          parallelism: 1,
          target: 'async-node',
          entry: './index.js',
          optimization: { minimize: false },
          output: { path: outputPath, uniqueName: 'composition-unit' },
          ...config,
        },
        (err, stats) => {
          if (err) return reject(err);
          const output = {};
          const files = fs.existsSync(outputPath)
            ? fs.readdirSync(outputPath)
            : [];
          for (const file of files.sort()) {
            if (file.endsWith('.js'))
              output[file] = fs.readFileSync(
                path.join(outputPath, file),
                'utf8',
              );
          }
          resolve({
            stats: stats.toJson({
              all: false,
              errors: true,
              warnings: true,
              modules: true,
              nestedModules: true,
            }),
            output,
          });
        },
      );
    },
  );
}

const moduleNames = (stats) => {
  const names = [];
  const visit = (modules = []) => {
    for (const module of modules) {
      if (module.nameForCondition) names.push(module.nameForCondition);
      visit(module.modules);
    }
  };
  visit(stats.modules);
  return names;
};

const messages = (list) => list.map(({ message }) => message);

// The built package is a second copy of enhanced next to the source under test.
const loadSecondCopy = () =>
  createRequire(__filename)(
    '../../../dist/src/lib/container/ContainerReferencePlugin',
  ).default;

describe('FederationCompositionPlugin', () => {
  const host = (experiments, extra = {}) =>
    new ModuleFederationPlugin({
      name: 'composition_host',
      remotes: { remote: 'remote@http://localhost:3001/remoteEntry.js' },
      dts: false,
      manifest: false,
      experiments,
      ...extra,
    });

  it('selects the legacy bootstrap, unchanged, for an older runtime family', async () => {
    const context = fixture({ 'index.js': 'export default 1;' });
    const implementation = olderRuntimeTools();
    const off = await compile(context, {
      plugins: [host(undefined, { implementation })],
    });
    const on = await compile(context, {
      plugins: [host({ composedRuntime: true }, { implementation })],
    });

    expect(messages(on.stats.errors)).toEqual([]);
    expect(messages(on.stats.warnings)).toEqual([
      expect.stringMatching(
        /composedRuntime is set, but this build uses the full federation runtime because @module-federation\/webpack-bundler-runtime at .* does not export "\.\/compose"/,
      ),
    ]);
    expect(moduleNames(on.stats).some((name) => COMPOSE.test(name))).toBe(
      false,
    );
    expect(on.output).toEqual(off.output);
  });

  it('isolates runtime aliases in a real child compiler without mutating parent resolver options', async () => {
    const context = fixture({ 'index.js': 'export default 1;' });
    let parentResolve;
    let parentAlias;
    let child;
    let inherited;
    const aliases = { react: ['/first/react', '/second/react'] };
    const { stats } = await compile(context, {
      resolve: { alias: aliases },
      plugins: [
        {
          apply(compiler) {
            compiler.hooks.thisCompilation.tap(
              'ChildAliasProof',
              (compilation) => {
                parentResolve = compiler.options.resolve;
                parentAlias = parentResolve.alias;
                child = compilation.createChildCompiler('resolver-child', {});
                inherited = child.options.resolve === parentResolve;
                new FederationRuntimePlugin().setRuntimeAlias(child);
              },
            );
          },
        },
      ],
    });
    expect(messages(stats.errors)).toEqual([]);
    expect(inherited).toBe(true);
    expect(parentResolve.alias).toBe(parentAlias);
    expect(parentAlias).toEqual({ react: ['/first/react', '/second/react'] });
    expect(child.options.resolve).not.toBe(parentResolve);
    expect(child.options.resolve.alias).not.toBe(parentAlias);
    expect(child.options.resolve.alias.react).toEqual(aliases.react);
    expect(child.options.resolve.alias['@module-federation/runtime$']).toEqual(
      expect.any(String),
    );
  });

  it('selects legacy when a function external names runtime-core', async () => {
    const context = fixture({ 'index.js': 'export default 1;' });
    const { stats } = await compile(context, {
      externals: [
        ({ request }, callback) =>
          request === '@module-federation/runtime-core'
            ? callback(null, 'var {}')
            : callback(),
      ],
      plugins: [host({ composedRuntime: true })],
    });

    expect(messages(stats.warnings)).toEqual([
      expect.stringMatching(
        /because @module-federation\/runtime-core is externalized/,
      ),
    ]);
    expect(moduleNames(stats).some((name) => COMPOSE.test(name))).toBe(false);
  });

  it.each([
    ['object', { '@module-federation/runtime-core': 'var {}' }],
    ['regexp', /^@module-federation\/runtime-core$/],
    [
      'callback',
      ({ request }, callback) =>
        callback(
          null,
          request === '@module-federation/runtime-core' ? 'var {}' : undefined,
        ),
    ],
    [
      'promise',
      async ({ request }) =>
        request === '@module-federation/runtime-core' ? 'var {}' : undefined,
    ],
    [
      'byLayer',
      { byLayer: { ssr: { '@module-federation/runtime-core': 'var {}' } } },
    ],
    [
      'composition subpath',
      { '@module-federation/runtime-core/kernel': 'var {}' },
    ],
  ])(
    'selects the full runtime for ordinary %s externals and keeps explicit defines',
    async (_, externals) => {
      const context = fixture({
        'index.js': 'export default typeof FEDERATION_OPTIMIZE_NO_SHARED;',
      });
      const { stats, output } = await compile(context, {
        externals,
        externalsType: 'commonjs',
        plugins: [host({ composedRuntime: true })],
      });
      expect(messages(stats.errors)).toEqual([]);
      expect(messages(stats.warnings)).toEqual([
        expect.stringContaining('is externalized'),
      ]);
      expect(moduleNames(stats).some((name) => COMPOSE.test(name))).toBe(false);
      expect(output['main.js']).not.toContain(
        'typeof FEDERATION_OPTIMIZE_NO_SHARED',
      );
    },
  );

  it('rejects an issuer-sensitive subpath external in the actual composed graph', async () => {
    const context = fixture({
      'index.js':
        'import "@module-federation/runtime-core/kernel"; export default 1;',
    });
    const { stats } = await compile(context, {
      externals: [
        ({ request, contextInfo }, callback) =>
          callback(
            null,
            request === '@module-federation/runtime-core/kernel' &&
              contextInfo.issuer.endsWith('/index.js')
              ? 'var {}'
              : undefined,
          ),
      ],
      plugins: [host({ composedRuntime: true })],
    });
    expect(messages(stats.errors)).toEqual([
      expect.stringContaining(
        '"@module-federation/runtime-core/kernel" is external',
      ),
    ]);
    expect(moduleNames(stats).some((name) => COMPOSE.test(name))).toBe(true);
  });

  it('selects legacy when the user aliases a runtime package', async () => {
    const context = fixture({ 'index.js': 'export default 1;' });
    const { stats } = await compile(context, {
      resolve: {
        alias: {
          '@module-federation/runtime$': path.join(
            path.dirname(require.resolve('@module-federation/runtime')),
            'index.js',
          ),
        },
      },
      plugins: [host({ composedRuntime: true })],
    });

    expect(messages(stats.warnings)).toEqual([
      expect.stringMatching(
        /because @module-federation\/runtime is aliased by resolve\.alias\["@module-federation\/runtime\$"\]/,
      ),
    ]);
    expect(moduleNames(stats).some((name) => COMPOSE.test(name))).toBe(false);
  });

  it('reports a rule-level runtime family alias and proves the two kernel identities in the emitted bundle', async () => {
    const core = path.resolve(__dirname, '../../../../runtime-core');
    const kernel = path.join(core, 'dist/kernel.js');
    const context = fixture({
      'index.js': `import { FederationKernel as selected } from ${JSON.stringify(kernel)};
        import { FederationKernel as aliased } from '@module-federation/runtime-core/kernel';
        export default { same: selected === aliased, instance: Object.create(selected.prototype) instanceof aliased };`,
    });
    const fork = path.join(context, 'runtime-core-fork');
    fs.mkdirSync(fork);
    fs.copyFileSync(
      path.join(core, 'package.json'),
      path.join(fork, 'package.json'),
    );
    fs.cpSync(path.join(core, 'dist'), path.join(fork, 'dist'), {
      recursive: true,
    });
    fs.symlinkSync(
      path.join(core, 'node_modules'),
      path.join(fork, 'node_modules'),
    );
    const outputPath = path.join(context, 'identity-dist');
    const { stats } = await compile(context, {
      output: { path: outputPath, library: { type: 'commonjs2' } },
      module: {
        rules: [
          {
            test: /index\.js$/,
            include: fs.realpathSync(context),
            resolve: {
              alias: {
                '@module-federation/runtime-core/kernel$': path.join(
                  fork,
                  'dist/kernel.js',
                ),
              },
            },
          },
        ],
      },
      plugins: [host({ composedRuntime: true })],
    });
    expect(messages(stats.errors)).toEqual([]);
    expect(messages(stats.warnings)).toEqual([
      expect.stringContaining('outside the runtime family'),
    ]);
    const names = moduleNames(stats);
    expect(names).toContain(kernel);
    expect(names).toContain(fs.realpathSync(path.join(fork, 'dist/kernel.js')));
    expect(
      createRequire(__filename)(path.join(outputPath, 'main.js')).default,
    ).toEqual({ same: false, instance: false });
  });

  it('emits ENV_TARGET but no capability or build-id define when composed', async () => {
    const context = fixture({
      'index.js':
        'export default [typeof FEDERATION_BUILD_IDENTIFIER, typeof FEDERATION_OPTIMIZE_NO_SHARED, ENV_TARGET];',
    });
    const composed = await compile(context, {
      plugins: [
        host({ composedRuntime: true, optimization: { target: 'web' } }),
      ],
    });
    const legacy = await compile(context, {
      plugins: [host({ optimization: { target: 'web' } })],
    });

    expect(messages(composed.stats.errors)).toEqual([]);
    expect(composed.output['main.js']).toContain(
      '[typeof FEDERATION_BUILD_IDENTIFIER, typeof FEDERATION_OPTIMIZE_NO_SHARED, "web"]',
    );
    expect(legacy.output['main.js']).toContain('["string", "boolean", "web"]');
  });

  it('plans once across two copies of enhanced', async () => {
    const OtherContainerReferencePlugin = loadSecondCopy();
    const context = fixture({ 'index.js': 'export default 1;' });
    const { stats } = await compile(context, {
      plugins: [
        new ModuleFederationPlugin({
          name: 'composition_host',
          exposes: { './index': './index.js' },
          dts: false,
          manifest: false,
          experiments: { composedRuntime: true },
        }),
        new OtherContainerReferencePlugin({
          remoteType: 'script',
          remotes: { remote: 'remote@http://localhost:3001/remoteEntry.js' },
        }),
      ],
    });

    expect(OtherContainerReferencePlugin).not.toBe(ContainerReferencePlugin);
    expect(messages(stats.errors)).toEqual([]);
    expect(messages(stats.warnings)).toEqual([]);
    expect(moduleNames(stats).some((name) => REMOTES_ADAPTER.test(name))).toBe(
      true,
    );
  });

  it('errors when a plugin externalizes a runtime package in a composed build', async () => {
    const context = fixture({
      'index.js':
        'import("@module-federation/runtime-core"); export default 1;',
    });
    const { stats } = await compile(context, {
      plugins: [
        host({ composedRuntime: true }),
        {
          apply(compiler) {
            new compiler.webpack.ExternalsPlugin('global', {
              '@module-federation/runtime-core': 'RC',
            }).apply(compiler);
          },
        },
      ],
    });

    expect(messages(stats.errors)).toEqual([
      expect.stringMatching(
        /^"@module-federation\/runtime-core" is external, but the composed federation bootstrap imports the runtime/,
      ),
    ]);
  });

  it('errors when a remote module is built without the remotes adapter', async () => {
    const context = fixture({
      'index.js': 'import("remote/Button"); export default 1;',
    });
    const { stats } = await compile(context, {
      plugins: [
        new ModuleFederationPlugin({
          name: 'composition_host',
          exposes: { './index': './index.js' },
          dts: false,
          manifest: false,
          experiments: { composedRuntime: true },
        }),
        // Claims ModuleFederationPlugin covers it, so nothing registers the remotes need.
        new ContainerReferencePlugin(
          {
            remoteType: 'script',
            remotes: { remote: 'remote@http://localhost:3001/remoteEntry.js' },
          },
          COVERED_BY_OPTIONS,
        ),
      ],
    });

    expect(messages(stats.errors)).toEqual([
      expect.stringMatching(
        /^A remote-module is in the graph but the federation bootstrap has no "remotes" adapter/,
      ),
    ]);
  });

  it('warns when the plan never ran', async () => {
    const context = fixture({ 'index.js': 'export default 1;' });
    const { stats } = await compile(context, {
      plugins: [
        {
          apply(compiler) {
            compiler.hooks.afterResolvers.tap('Late', () =>
              host({ composedRuntime: true }).apply(compiler),
            );
          },
        },
      ],
    });

    expect(messages(stats.warnings)).toEqual([
      expect.stringMatching(
        /composedRuntime is set, but this build uses the full federation runtime because the federation plan never ran/,
      ),
    ]);
  });

  it('refuses a participant registered after the plan is sealed', async () => {
    const context = fixture({ 'index.js': 'export default 1;' });
    let error;
    const late = {
      apply(compiler) {
        compiler.hooks.thisCompilation.tap('Late', () => {
          try {
            new ContainerReferencePlugin({
              remoteType: 'script',
              remotes: { late: 'late@http://localhost:3002/remoteEntry.js' },
            }).apply(compiler);
          } catch (thrown) {
            error = thrown;
          }
        });
      },
    };

    await compile(context, {
      plugins: [host({ composedRuntime: true }), late],
    });

    expect(error?.message).toMatch(
      /after the federation runtime plan was sealed/,
    );
  });

  it('builds the shared tree-shaking compiler alongside a composed host', async () => {
    const context = fixture({
      'index.js': 'import("./app");',
      'app.js': 'import { a } from "ui-lib"; export default a;',
      'node_modules/ui-lib/package.json': JSON.stringify({
        name: 'ui-lib',
        version: '1.0.0',
        main: 'index.js',
      }),
      'node_modules/ui-lib/index.js': 'export const a = 1; export const b = 2;',
    });
    const { stats } = await compile(context, {
      plugins: [
        host(
          { composedRuntime: true },
          {
            library: { type: 'commonjs-module', name: 'composition_host' },
            shared: {
              'ui-lib': {
                requiredVersion: '*',
                treeShaking: { mode: 'runtime-infer' },
              },
            },
          },
        ),
      ],
    });

    expect(messages(stats.errors)).toEqual([]);
    expect(moduleNames(stats).some((name) => COMPOSE.test(name))).toBe(true);
  });
});
