import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
import type { Compiler } from 'webpack';
import { getSelectionSlot } from '@module-federation/managers/runtime-selection';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import ModuleFederationPlugin from '../../../src/lib/container/ModuleFederationPlugin';

const webpack = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

type PluginOptions = ConstructorParameters<typeof ModuleFederationPlugin>[0];

const definesEntry = `module.exports = {
  noRemote: FEDERATION_OPTIMIZE_NO_REMOTE,
  noShared: FEDERATION_OPTIMIZE_NO_SHARED,
  noSnapshot: FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN,
  hasExposes: FEDERATION_HAS_EXPOSES,
  envTarget: typeof ENV_TARGET === 'undefined' ? undefined : ENV_TARGET,
};
`;

describe('runtime selection in a webpack compiler', () => {
  let tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs = [];
  });

  function createCompiler(plugins: Array<{ apply(compiler: Compiler): void }>) {
    const context = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-select-'));
    tempDirs.push(context);
    fs.writeFileSync(path.join(context, 'index.js'), definesEntry);
    fs.writeFileSync(path.join(context, 'value.js'), 'module.exports = 1;\n');
    return webpack({
      mode: 'development',
      devtool: false,
      context,
      target: 'node',
      entry: { main: './index.js' },
      output: {
        path: path.join(context, 'dist'),
        library: { type: 'commonjs2' },
        uniqueName: 'webpack-selection',
      },
      plugins,
    });
  }

  function run(compiler: Compiler) {
    return new Promise<void>((resolve, reject) => {
      compiler.run((err, stats) => {
        compiler.close(() => undefined);
        if (err) return reject(err);
        if (stats?.hasErrors()) {
          return reject(
            new Error(stats.toString({ all: false, errors: true })),
          );
        }
        resolve();
      });
    });
  }

  async function buildDefines(options: PluginOptions) {
    const compiler = createCompiler([
      new ModuleFederationPlugin({ dts: false, manifest: false, ...options }),
    ]);
    await run(compiler);
    const output = path.join(compiler.options.output.path!, 'main.js');
    return createRequire(output)(output);
  }

  it('keeps all runtime capabilities enabled by default', async () => {
    await expect(buildDefines({ name: 'host' })).resolves.toEqual({
      noRemote: false,
      noShared: false,
      noSnapshot: false,
      hasExposes: false,
      envTarget: undefined,
    });
  });

  it('defines the capabilities the plugin options disable', async () => {
    await expect(
      buildDefines({
        name: 'provider',
        filename: 'remoteEntry.js',
        exposes: { './value': './value.js' },
        experiments: {
          optimization: {
            disableRemote: true,
            disableShared: true,
            disableSnapshot: true,
            target: 'node',
          },
        },
      }),
    ).resolves.toEqual({
      noRemote: true,
      noShared: true,
      noSnapshot: true,
      hasExposes: true,
      envTarget: 'node',
    });
  });

  it('gives child compilers the parent selection', async () => {
    let child: Compiler | undefined;
    const compiler = createCompiler([
      new ModuleFederationPlugin({
        name: 'host',
        dts: false,
        manifest: false,
        experiments: { optimization: { disableShared: true } },
      }),
      {
        apply(compiler) {
          compiler.hooks.make.tap('ChildProbe', (compilation) => {
            child = compilation.createChildCompiler('probe', {}, []);
          });
        },
      },
    ]);
    await run(compiler);

    const parentSlot = getSelectionSlot(compiler);
    const childSlot = getSelectionSlot(child!);
    expect(childSlot.finalized).toBe(true);
    expect(childSlot.profile).toEqual(parentSlot.profile);
    expect(childSlot.profile?.shared).toBe('forbidden');
    expect(childSlot.image).toBe(parentSlot.image);
  });
});
