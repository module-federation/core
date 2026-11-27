const { supportsWebpackFeature } = require('../../helpers/webpackFeatures');
import AsyncBoundaryPlugin from '../../../src/lib/container/AsyncBoundaryPlugin';
import ModuleFederationPlugin from '../../../src/lib/container/ModuleFederationPlugin';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Stats } from 'webpack';

const webpack = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

describe(`AsyncBoundaryPlugin ESM startup with Webpack ${webpack.version}`, () => {
  let context: string;

  beforeEach(() => {
    context = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-async-esm-'));
    fs.writeFileSync(
      path.join(context, 'package.json'),
      JSON.stringify({ name: 'async-esm-host', version: '1.0.0' }),
    );
    fs.writeFileSync(
      path.join(context, 'main.js'),
      "import shared from './shared.js'; export const value = shared + 1;",
    );
    fs.writeFileSync(path.join(context, 'shared.js'), 'export default 1;');
  });

  afterEach(() => {
    fs.rmSync(context, { recursive: true, force: true });
  });

  it('exports the entry of an ESM host that imports a shared module', async () => {
    const compiler = webpack({
      mode: 'development',
      devtool: false,
      context,
      target: 'node22',
      entry: './main.js',
      // Webpack before 5.102 needs the experiment. Later versions have none.
      experiments: {
        outputModule: true,
        ...(supportsWebpackFeature('topLevelAwaitWithoutExperiment')
          ? {}
          : { topLevelAwait: true }),
      },
      output: {
        path: path.join(context, 'dist'),
        filename: '[name].mjs',
        chunkFilename: '[name].chunk.mjs',
        module: true,
        chunkFormat: 'module',
        chunkLoading: 'import',
        library: { type: 'module' },
        uniqueName: 'async-esm-host',
      },
      plugins: [
        new ModuleFederationPlugin({
          name: 'host',
          shared: { './shared.js': { requiredVersion: false } },
          dts: false,
          manifest: false,
        }),
        new AsyncBoundaryPlugin(),
      ],
    });
    try {
      const stats = await new Promise<Stats | undefined>((resolve, reject) => {
        compiler.run((error, result) =>
          error ? reject(error) : resolve(result),
        );
      });
      if (!stats) throw new Error('Webpack did not return stats');
      expect(
        stats.hasErrors(),
        stats.toString({ all: false, errors: true }),
      ).toBe(false);
    } finally {
      await new Promise<void>((resolve, reject) => {
        compiler.close((error) => (error ? reject(error) : resolve()));
      });
    }

    const entry = pathToFileURL(path.join(context, 'dist/main.mjs')).href;
    const output = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `const m = await import(${JSON.stringify(entry)}); console.log(JSON.stringify({ value: m.value }));`,
      ],
      { encoding: 'utf8', env: { ...process.env, NODE_OPTIONS: '' } },
    );
    expect(JSON.parse(output)).toEqual({ value: 2 });
  });
});
