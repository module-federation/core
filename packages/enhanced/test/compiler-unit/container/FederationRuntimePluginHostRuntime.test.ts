// @ts-nocheck
/*
 * @jest-environment node
 */

import fs from 'fs';
import os from 'os';
import path from 'path';

const TEMP_PROJECT_PREFIX = 'mf-host-runtime-';

const writeFile = (filePath: string, contents: string) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents);
};

describe('FederationRuntimePlugin host runtime integration', () => {
  jest.setTimeout(45000);

  const createdDirs: string[] = [];

  afterAll(() => {
    for (const dir of createdDirs) {
      if (fs.existsSync(dir)) {
        try {
          fs.rmSync(dir, { recursive: true, force: true });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn(`Failed to remove temp dir ${dir}`, error);
        }
      }
    }
  });

  const createTempProject = () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), TEMP_PROJECT_PREFIX));
    createdDirs.push(tempDir);
    return tempDir;
  };

  it('attaches the federation runtime dependency to the host runtime chunk', async () => {
    const projectDir = createTempProject();
    const srcDir = path.join(projectDir, 'src');

    writeFile(
      path.join(srcDir, 'index.ts'),
      `
import('./bootstrap');
`,
    );

    writeFile(
      path.join(srcDir, 'bootstrap.ts'),
      `
import 'remoteContainer/feature';

export const run = () => 'ok';
`,
    );

    writeFile(
      path.join(projectDir, 'package.json'),
      JSON.stringify({ name: 'mf-host-runtime', version: '1.0.0' }),
    );

    writeFile(
      path.join(projectDir, 'webpack.config.js'),
      `
const path = require('path');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');

module.exports = {
  mode: 'development',
  devtool: false,
  target: 'web',
  context: __dirname,
  entry: {
    main: './src/index.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[name].js',
    publicPath: 'auto',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: require.resolve('swc-loader'),
          options: {
            swcrc: false,
            sourceMaps: false,
            jsc: {
              parser: { syntax: 'typescript', tsx: false },
              target: 'es2020',
            },
          },
        },
      },
    ],
  },
  optimization: {
    runtimeChunk: false,
    minimize: false,
    moduleIds: 'named',
    chunkIds: 'named',
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'runtime_host_test',
      filename: 'remoteEntry.js',
      experiments: { asyncStartup: true },
      remotes: {
        remoteContainer: 'remoteContainer@http://127.0.0.1:3006/remoteEntry.js',
      },
      exposes: {
        './feature': './src/index.ts',
      },
      shared: {
        react: { singleton: true, requiredVersion: false },
        'react-dom': { singleton: true, requiredVersion: false },
      },
      dts: false,
    }),
  ],
};
`,
    );

    writeFile(
      path.join(projectDir, 'run-webpack.js'),
      `
const webpackCli = require.resolve('webpack-cli/bin/cli.js');
const path = require('path');

const args = [webpackCli, '--config', path.resolve(__dirname, 'webpack.config.js')];

const child = require('child_process').spawn(process.execPath, args, {
  stdio: 'inherit',
  cwd: __dirname,
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
`,
    );

    const { spawnSync } = require('child_process');
    const result = spawnSync(process.execPath, ['run-webpack.js'], {
      cwd: projectDir,
      encoding: 'utf-8',
    });

    const combinedOutput = `${result.stdout || ''}\n${result.stderr || ''}`;
    expect(result.status).not.toBe(0);
    expect(combinedOutput).toContain(
      'webpack-bundler-runtime/dist/index.esm.js',
    );
    expect(combinedOutput).toContain('has no id assigned');
    expect(combinedOutput).toContain('swc-loader');
  });
});
