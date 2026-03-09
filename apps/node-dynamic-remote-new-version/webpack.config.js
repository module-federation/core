const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { UniversalFederationPlugin } = require('@module-federation/node');
const swcLoader = require.resolve('swc-loader');

module.exports = (_env, argv = {}) => {
  const isProduction = argv.mode === 'production';
  const sourcePath = path.resolve(__dirname, 'src');

  return {
    mode: isProduction ? 'production' : 'development',
    target: 'node',
    context: __dirname,
    cache: false,
    devtool: false,
    entry: {
      main: path.resolve(__dirname, 'src/main.tsx'),
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      chunkFilename: '[name].js',
      clean: true,
    },
    externalsPresets: { node: true },
    externals: [nodeExternals()],
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          include: sourcePath,
          exclude: /node_modules/,
          use: {
            loader: swcLoader,
            options: {
              sourceMaps: !isProduction,
              jsc: {
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                  decorators: true,
                },
                transform: {
                  react: {
                    runtime: 'automatic',
                    development: !isProduction,
                  },
                },
              },
            },
          },
        },
      ],
    },
    plugins: [
      new UniversalFederationPlugin({
        isServer: true,
        name: 'node_dynamic_remote',
        library: { type: 'commonjs-module' },
        filename: 'remoteEntry.js',
        exposes: {
          './test': './src/expose.js',
          './test-with-axios': './src/expose-with-axios.js',
          './test-with-lodash': './src/expose-with-lodash.js',
        },
        shared: {
          axios: { singleton: true },
          lodash: { singleton: true },
        },
      }),
    ],
    watchOptions: {
      ignored: ['**/node_modules/**', '**/@mf-types/**', '**/dist/**'],
    },
    devServer: {
      client: {
        overlay: false,
      },
      devMiddleware: {
        writeToDisk: true,
      },
    },
    optimization: {
      minimize: isProduction,
      runtimeChunk: false,
      moduleIds: 'named',
    },
  };
};
