import fs from 'fs';
import { createRequire } from 'module';
import os from 'os';
import path from 'path';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import ModuleFederationPlugin from '../../../src/lib/container/ModuleFederationPlugin';
import ContainerReferencePlugin from '../../../src/lib/container/ContainerReferencePlugin';
import { FAMILY_PACKAGES } from '@module-federation/managers';
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

// Copy built package artifacts so custom implementations have genuinely distinct
// package roots, while keeping unrelated dependencies from the locked install.
function copyRuntimeFamily(context: string, name: string): string {
  const family = path.join(context, name, 'node_modules');
  for (const pkg of FAMILY_PACKAGES) {
    const source = fs.realpathSync(
      path.resolve(__dirname, '../../../../', pkg.split('/')[1]),
    );
    const target = path.join(family, pkg);
    fs.mkdirSync(target, { recursive: true });
    fs.copyFileSync(
      path.join(source, 'package.json'),
      path.join(target, 'package.json'),
    );
    fs.cpSync(path.join(source, 'dist'), path.join(target, 'dist'), {
      recursive: true,
    });
    const { dependencies = {} } = JSON.parse(
      fs.readFileSync(path.join(source, 'package.json'), 'utf8'),
    );
    for (const dependency of Object.keys(dependencies)) {
      if (FAMILY_PACKAGES.some((pkg) => pkg === dependency)) continue;
      const link = path.join(target, 'node_modules', dependency);
      fs.mkdirSync(path.dirname(link), { recursive: true });
      fs.symlinkSync(
        fs.realpathSync(path.join(source, 'node_modules', dependency)),
        link,
      );
    }
  }
  return path.join(family, '@module-federation/runtime-tools');
}

const loadOtherFederationPlugin = () =>
  createRequire(__filename)(
    '../../../dist/src/lib/container/ModuleFederationPlugin',
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

  it('falls back with explicit defines for a custom require-only composition export', async () => {
    const context = fixture({
      'index.js': 'export default typeof FEDERATION_OPTIMIZE_NO_SHARED;',
    });
    for (const pkg of [
      'runtime-tools',
      'webpack-bundler-runtime',
      'runtime',
      'runtime-core',
      'sdk',
      'error-codes',
    ]) {
      const source = path.resolve(__dirname, '../../../../', pkg);
      const target = path.join(context, 'node_modules/@module-federation', pkg);
      fs.mkdirSync(target, { recursive: true });
      fs.copyFileSync(
        path.join(source, 'package.json'),
        path.join(target, 'package.json'),
      );
      fs.cpSync(path.join(source, 'dist'), path.join(target, 'dist'), {
        recursive: true,
      });
    }
    const file = path.join(
      context,
      'node_modules/@module-federation/webpack-bundler-runtime/package.json',
    );
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    data.exports['./compose'] = { require: './dist/compose.cjs' };
    fs.writeFileSync(file, JSON.stringify(data));
    const implementation = path.join(
      context,
      'node_modules/@module-federation/runtime-tools',
    );
    const off = await compile(context, {
      plugins: [host(undefined, { implementation })],
    });
    const on = await compile(context, {
      plugins: [host({ composedRuntime: true }, { implementation })],
    });
    expect(messages(on.stats.errors)).toEqual([]);
    expect(messages(on.stats.warnings)).toEqual([
      expect.stringContaining('cannot resolve "./compose" for ESM composition'),
    ]);
    expect(moduleNames(on.stats).some((name) => COMPOSE.test(name))).toBe(
      false,
    );
    expect(on.output).toEqual(off.output);
    expect(on.output['main.js']).not.toContain(
      'typeof FEDERATION_OPTIMIZE_NO_SHARED',
    );
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

  it('preserves array aliases and parent resolver options in a real child compilation', async () => {
    const context = fixture({
      'index.js': 'import value from "child-only"; export default value;',
      'value.js': 'export default 42;',
    });
    const configuredAlias = [
      {
        name: 'child-only',
        alias: path.join(context, 'value.js'),
        onlyModule: true,
      },
    ];
    let parentResolve;
    let parentAlias;
    let child;
    const { stats } = await compile(context, {
      resolve: { alias: configuredAlias },
      output: {
        path: path.join(context, 'array-dist'),
        library: { type: 'commonjs2' },
      },
      plugins: [
        {
          apply(compiler) {
            compiler.hooks.thisCompilation.tap(
              'ChildArrayAliasProof',
              (compilation) => {
                parentResolve = compiler.options.resolve;
                parentAlias = parentResolve.alias;
                child = compilation.createChildCompiler('array-child', {});
                new FederationRuntimePlugin().setRuntimeAlias(child);
              },
            );
          },
        },
        host({ composedRuntime: true }),
      ],
    });
    expect(messages(stats.errors)).toEqual([]);
    expect(Array.isArray(parentAlias)).toBe(true);
    expect(parentResolve.alias).toBe(parentAlias);
    expect(child.options.resolve).not.toBe(parentResolve);
    expect(Array.isArray(child.options.resolve.alias)).toBe(true);
    expect(child.options.resolve.alias).not.toBe(parentAlias);
    expect(child.options.resolve.alias[0]).toEqual(configuredAlias[0]);
    expect(child.options.resolve.alias[0]).not.toBe(parentAlias[0]);
    expect(parentAlias[0]).toEqual(configuredAlias[0]);
    expect(
      createRequire(__filename)(path.join(context, 'array-dist/main.js'))
        .default,
    ).toBe(42);
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

  it.each([false, true])(
    'rejects two enhanced copies requesting different custom families (reverse=%s)',
    async (reverse) => {
      const OtherPlugin = loadOtherFederationPlugin();
      const context = fixture({ 'index.js': 'export default 1;' });
      const implementations = ['family-a', 'family-b'].map((name) =>
        copyRuntimeFamily(context, name),
      );
      const plugins = [ModuleFederationPlugin, OtherPlugin].map(
        (Plugin, index) =>
          new Plugin({
            name: `family_host_${index}`,
            dts: false,
            manifest: false,
            implementation: implementations[index],
            experiments: { composedRuntime: true },
          }),
      );
      if (reverse) plugins.reverse();
      await expect(compile(context, { plugins })).rejects.toThrow(
        /incompatible runtime families/,
      );
    },
  );

  it.each([false, true])(
    'rejects two enhanced copies requesting different targets (reverse=%s)',
    async (reverse) => {
      const OtherPlugin = loadOtherFederationPlugin();
      const context = fixture({ 'index.js': 'export default 1;' });
      const plugins = [
        new ModuleFederationPlugin({
          name: 'web_host',
          dts: false,
          manifest: false,
          experiments: {
            composedRuntime: true,
            optimization: { target: 'web' },
          },
        }),
        new OtherPlugin({
          name: 'node_host',
          dts: false,
          manifest: false,
          experiments: {
            composedRuntime: true,
            optimization: { target: 'node' },
          },
        }),
      ];
      if (reverse) plugins.reverse();
      await expect(compile(context, { plugins })).rejects.toThrow(
        /incompatible targets/,
      );
    },
  );

  it.each([false, true])(
    'uses one custom family across compatible enhanced copies (reverse=%s)',
    async (reverse) => {
      const OtherPlugin = loadOtherFederationPlugin();
      const context = fixture({ 'index.js': 'export default 1;' });
      const implementation = copyRuntimeFamily(context, 'family-a');
      const plugins = [ModuleFederationPlugin, OtherPlugin].map(
        (Plugin, index) =>
          new Plugin({
            name: `compatible_host_${index}`,
            dts: false,
            manifest: false,
            implementation,
            experiments: { composedRuntime: true },
          }),
      );
      if (reverse) plugins.reverse();
      const { stats } = await compile(context, { plugins });
      expect(messages(stats.errors)).toEqual([]);
      expect(messages(stats.warnings)).toEqual([]);
      const composeModules = moduleNames(stats).filter((name) =>
        COMPOSE.test(name),
      );
      expect(composeModules).toHaveLength(1);
      expect(composeModules[0]).toContain(path.join(context, 'family-a'));
    },
  );

  it.each([
    null,
    true,
    {},
    { participants: [], sealed: false },
    { version: 2, participants: [], sealed: false },
    { version: 1, participants: [], sealed: 'no' },
    { version: 1, participants: [], sealed: false, planner: {} },
    { version: 1, participants: [], sealed: false, entry: { source: 1 } },
    {
      version: 1,
      participants: [{ kind: 'options', needs: [], disable: {} }],
      sealed: false,
    },
    {
      version: 1,
      participants: [{ kind: 'needs', needs: ['unknown'] }],
      sealed: false,
    },
  ])('rejects an invalid shared compiler slot: %j', async (slot) => {
    const context = fixture({ 'index.js': 'export default 1;' });
    await expect(
      compile(context, {
        plugins: [
          {
            apply(compiler) {
              compiler[Symbol.for('module-federation.composition/1')] = slot;
            },
          },
          host({ composedRuntime: true }),
        ],
      }),
    ).rejects.toThrow(
      /Invalid module-federation\.composition\/1 compiler slot/,
    );
  });

  it.each([false, true])(
    'retains standalone remotes needs across a wrapped opt-in from another copy (reverse=%s)',
    async (reverse) => {
      const OtherPlugin = loadOtherFederationPlugin();
      const context = fixture({ 'index.js': 'import("remote/Button");' });
      const plugins = [
        new ContainerReferencePlugin({
          remoteType: 'script',
          remotes: { remote: 'remote@http://localhost:3001/remoteEntry.js' },
        }),
        {
          apply(compiler) {
            new OtherPlugin({
              name: 'wrapped_host',
              dts: false,
              manifest: false,
              experiments: { composedRuntime: true },
            }).apply(compiler);
          },
        },
      ];
      if (reverse) plugins.reverse();
      const { stats } = await compile(context, { plugins });
      expect(messages(stats.errors)).toEqual([]);
      expect(messages(stats.warnings)).toEqual([]);
      expect(
        moduleNames(stats).some((name) => REMOTES_ADAPTER.test(name)),
      ).toBe(true);
    },
  );

  it('retains early needs when the wrapped opt-in registers in afterPlugins', async () => {
    const OtherPlugin = loadOtherFederationPlugin();
    const context = fixture({ 'index.js': 'import("remote/Button");' });
    const { stats } = await compile(context, {
      plugins: [
        new ContainerReferencePlugin({
          remoteType: 'script',
          remotes: { remote: 'remote@http://localhost:3001/remoteEntry.js' },
        }),
        {
          apply(compiler) {
            compiler.hooks.afterPlugins.tap('WrappedOptIn', () => {
              new OtherPlugin({
                name: 'wrapped_host',
                dts: false,
                manifest: false,
                experiments: { composedRuntime: true },
              }).apply(compiler);
            });
          },
        },
      ],
    });
    expect(messages(stats.errors)).toEqual([]);
    expect(messages(stats.warnings)).toEqual([]);
    expect(moduleNames(stats).some((name) => REMOTES_ADAPTER.test(name))).toBe(
      true,
    );
  });

  it.each([false, true])(
    'preserves the full runtime with an old slot while opted out (oldFirst=%s)',
    async (oldFirst) => {
      const context = fixture({ 'index.js': 'export default 1;' });
      const legacyWriter = {
        apply(compiler) {
          const key = Symbol.for('module-federation.composition/1');
          const slot = (compiler[key] ??= { participants: [], sealed: false });
          slot.participants.push({ kind: 'options', needs: [], disable: {} });
        },
      };
      const plugins = [host({ composedRuntime: false }), legacyWriter];
      if (oldFirst) plugins.reverse();
      const { stats } = await compile(context, { plugins });
      expect(messages(stats.errors)).toEqual([]);
      expect(messages(stats.warnings)).toEqual([]);
      expect(moduleNames(stats).some((name) => COMPOSE.test(name))).toBe(false);
    },
  );

  it.each([false, true])(
    'uses the full runtime for same-protocol mixed opt-in and opt-out (reverse=%s)',
    async (reverse) => {
      const OtherPlugin = loadOtherFederationPlugin();
      const context = fixture({ 'index.js': 'export default 1;' });
      const plugins = [
        host({ composedRuntime: true }),
        new OtherPlugin({
          name: 'composition_host',
          dts: false,
          manifest: false,
          experiments: { composedRuntime: false },
        }),
      ];
      if (reverse) plugins.reverse();
      const { stats } = await compile(context, { plugins });
      expect(messages(stats.errors)).toEqual([]);
      expect(messages(stats.warnings)).toEqual([
        expect.stringMatching(
          /another federation options participant did not enable composedRuntime/,
        ),
      ]);
      expect(moduleNames(stats).some((name) => COMPOSE.test(name))).toBe(false);
    },
  );

  it('keeps an earlier opt-out when a wrapper applies an opt-in from another copy later', async () => {
    const OtherPlugin = loadOtherFederationPlugin();
    const context = fixture({ 'index.js': 'export default 1;' });
    const { stats } = await compile(context, {
      plugins: [
        {
          apply(compiler) {
            host({ composedRuntime: false }).apply(compiler);
            new OtherPlugin({
              name: 'composition_host',
              dts: false,
              manifest: false,
              experiments: { composedRuntime: true },
            }).apply(compiler);
          },
        },
      ],
    });
    expect(messages(stats.errors)).toEqual([]);
    expect(messages(stats.warnings)).toEqual([
      expect.stringMatching(
        /another federation options participant did not enable composedRuntime/,
      ),
    ]);
    expect(moduleNames(stats).some((name) => COMPOSE.test(name))).toBe(false);
  });

  it.each([false, true])(
    'rejects an old copy options registration in either order (oldFirst=%s)',
    async (oldFirst) => {
      const context = fixture({ 'index.js': 'export default 1;' });
      const legacyWriter = {
        apply(compiler) {
          // This is the old copy's executable slot/register algorithm.
          const key = Symbol.for('module-federation.composition/1');
          const slot = (compiler[key] ??= { participants: [], sealed: false });
          slot.participants.push({ kind: 'options', needs: [], disable: {} });
        },
      };
      const plugins = [host({ composedRuntime: true }), legacyWriter];
      if (oldFirst) plugins.reverse();
      await expect(compile(context, { plugins })).rejects.toThrow(
        /Invalid module-federation\.composition\/1 compiler slot/,
      );
    },
  );

  it('revalidates a malformed needs participant written in afterPlugins', async () => {
    const context = fixture({ 'index.js': 'export default 1;' });
    await expect(
      compile(context, {
        plugins: [
          host({ composedRuntime: true }),
          {
            apply(compiler) {
              compiler.hooks.afterPlugins.tap('OldNeedsWriter', () => {
                compiler[
                  Symbol.for('module-federation.composition/1')
                ].participants.push({ kind: 'needs', needs: ['unknown'] });
              });
            },
          },
        ],
      }),
    ).rejects.toThrow(
      /Invalid module-federation\.composition\/1 compiler slot/,
    );
  });

  it('rejects replacing a valid slot after the planner registered', async () => {
    const context = fixture({ 'index.js': 'export default 1;' });
    await expect(
      compile(context, {
        plugins: [
          host({ composedRuntime: true }),
          {
            apply(compiler) {
              const key = Symbol.for('module-federation.composition/1');
              compiler[key] = { ...compiler[key] };
            },
          },
        ],
      }),
    ).rejects.toThrow(/slot was replaced after the planner registered/);
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
