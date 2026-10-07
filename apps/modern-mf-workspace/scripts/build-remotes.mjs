import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rspack } from '@rspack/core';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const remotes = {
  catalog: 'Catalog.tsx',
  preferences: 'Preferences.tsx',
  recommendations_v1: 'Recommendations.tsx',
  recommendations_v2: 'Recommendations.tsx',
  details: 'Details.tsx',
};
export async function buildRemotes() {
  const configs = Object.entries(remotes).map(([name, source]) => ({
    name,
    mode: 'development',
    context: root,
    target: 'web',
    entry: {},
    devtool: 'source-map',
    output: {
      path: path.join(root, '.local/remotes', name),
      publicPath: 'auto',
      uniqueName: name,
      clean: true,
    },
    resolve: { extensions: ['.tsx', '.ts', '.jsx', '.js'] },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: { syntax: 'typescript', tsx: true },
              target: 'es2022',
              transform: { react: { runtime: 'automatic' } },
            },
          },
        },
        { test: /\.css$/, type: 'css' },
      ],
    },
    experiments: { css: true },
    plugins: [
      new ModuleFederationPlugin({
        name,
        filename: 'remoteEntry.js',
        exposes: { './App': `./src/remotes/${source}` },
        manifest: true,
        dts: false,
        shared: {
          react: { singleton: true, requiredVersion: '18.3.1' },
          'react-dom': { singleton: true, requiredVersion: '18.3.1' },
        },
      }),
    ],
  }));
  await new Promise((resolve, reject) => {
    const compiler = rspack(configs);
    compiler.run((error, stats) => {
      compiler.close((closeError) => {
        if (error || closeError) return reject(error || closeError);
        if (stats.hasErrors())
          return reject(
            new Error(stats.toString({ all: false, errors: true })),
          );
        console.log(
          stats.toString({
            all: false,
            timings: true,
            errors: true,
            warnings: true,
          }),
        );
        resolve();
      });
    });
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await buildRemotes();
