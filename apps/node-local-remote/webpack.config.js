const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { ModuleFederationPlugin } = require('@module-federation/enhanced');
const swcLoader = require.resolve('swc-loader');

module.exports = (_env, argv = {}) => {
  const isProduction = argv.mode === 'production';
  const sourcePath = path.resolve(__dirname, 'src');

  return {
    mode: isProduction ? 'production' : 'development',
    target: 'async-node',
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
      publicPath: 'auto',
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
      new ModuleFederationPlugin({
        name: 'node-local-remote',
        dts: false,
        runtimePlugins: [
          require.resolve('@module-federation/node/runtimePlugin'),
        ],
        library: { type: 'commonjs-module' },
        filename: 'remoteEntry.js',
        exposes: {
          './test': './src/expose.js',
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
