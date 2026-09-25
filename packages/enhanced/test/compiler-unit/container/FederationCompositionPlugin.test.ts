import fs from 'fs';
import { createRequire } from 'module';
import os from 'os';
import path from 'path';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import ModuleFederationPlugin from '../../../src/lib/container/ModuleFederationPlugin';
import ContainerReferencePlugin from '../../../src/lib/container/ContainerReferencePlugin';

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
          for (const file of fs.readdirSync(outputPath).sort()) {
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

// webpack refuses a second serializer under the same key, so a second installed copy
// of enhanced cannot load next to the first; skip its duplicate registrations.
function loadSecondCopy() {
  const nativeRequire = createRequire(__filename);
  const id = nativeRequire.resolve(
    normalizeWebpackPath('webpack/lib/util/makeSerializable'),
  );
  const cached =
    nativeRequire.cache[id] ?? (nativeRequire(id) && nativeRequire.cache[id]);
  const makeSerializable = cached.exports;
  cached.exports = (...args) => {
    try {
      makeSerializable(...args);
    } catch (error) {
      if (!/already registered/.test(error.message)) throw error;
    }
  };
  try {
    return nativeRequire(
      '../../../dist/src/lib/container/ContainerReferencePlugin',
    ).default;
  } finally {
    cached.exports = makeSerializable;
  }
}

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
