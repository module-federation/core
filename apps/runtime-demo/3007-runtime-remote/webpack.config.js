const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/webpack');

const DIST_PATH = path.resolve(__dirname, 'dist');
const SRC_PATH = path.resolve(__dirname, 'src');

module.exports = (_env = {}, argv = {}) => {
  const mode = argv.mode || process.env.NODE_ENV || 'development';
  const isDevelopment = mode === 'development';
  const isWebpackServe = Boolean(
    argv.env?.WEBPACK_SERVE ?? process.env.WEBPACK_SERVE === 'true',
  );

  return {
    mode,
    devtool: isDevelopment ? 'source-map' : false,
    entry: path.join(SRC_PATH, 'index.tsx'),
    output: {
      path: DIST_PATH,
      filename: isDevelopment ? '[name].js' : '[name].[contenthash].js',
      publicPath: 'http://127.0.0.1:3007/',
      clean: true,
      scriptType: 'text/javascript',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: {
            loader: require.resolve('swc-loader'),
            options: {
              swcrc: false,
              sourceMaps: isDevelopment,
              jsc: {
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                },
                transform: {
                  react: {
                    runtime: 'automatic',
                    development: isDevelopment,
                    refresh: isWebpackServe && isDevelopment,
                  },
                },
                target: 'es2017',
              },
            },
          },
        },
        {
          test: /\.css$/i,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 0,
              },
            },
          ],
        },
        {
          test: /\.(png|svg|jpe?g|gif)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(SRC_PATH, 'index.html'),
      }),
      new MiniCssExtractPlugin({
        filename: isDevelopment ? '[name].css' : '[name].[contenthash].css',
        chunkFilename: isDevelopment ? '[id].css' : '[id].[contenthash].css',
      }),
      isWebpackServe && isDevelopment && new ReactRefreshWebpackPlugin(),
      new ModuleFederationPlugin({
        name: 'runtime_remote2',
        filename: 'remoteEntry.js',
        exposes: {
          './ButtonOldAnt': './src/components/ButtonOldAnt',
        },
        shared: {
          lodash: {
            singleton: true,
            requiredVersion: '^4.0.0',
          },
          antd: {
            singleton: true,
            requiredVersion: '^4.0.0',
          },
          react: {
            singleton: true,
            requiredVersion: '^18.2.0',
          },
          'react/': {
            singleton: true,
            requiredVersion: '^18.2.0',
          },
          'react-dom': {
            singleton: true,
            requiredVersion: '^18.2.0',
          },
          'react-dom/': {
            singleton: true,
            requiredVersion: '^18.2.0',
          },
        },
        shareStrategy: 'loaded-first',
        dev: {
          disableLiveReload: true,
        },
      }),
    ].filter(Boolean),
    optimization: {
      runtimeChunk: false,
      minimize: false,
      moduleIds: 'named',
    },
    performance: {
      hints: false,
    },
    experiments: {
      outputModule: false,
    },
    watchOptions: {
      ignored: ['**/node_modules/**', '**/@mf-types/**', '**/dist/**'],
    },
    devServer: {
      host: '127.0.0.1',
      allowedHosts: 'all',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      port: 3007,
      hot: isWebpackServe && isDevelopment,
      liveReload: false,
      historyApiFallback: true,
      static: DIST_PATH,
    },
  };
};
