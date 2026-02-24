const path = require('path');
const swcLoader = require.resolve('swc-loader');
const styleLoader = require.resolve('style-loader');
const cssLoader = require.resolve('css-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/webpack');
process.env.FEDERATION_DEBUG = true;

module.exports = (_env, argv = {}) => {
  const isProduction = argv.mode === 'production';
  const sourcePath = path.resolve(__dirname, 'src');

  return {
    mode: isProduction ? 'production' : 'development',
    target: 'web',
    context: __dirname,
    entry: {
      main: path.resolve(__dirname, 'src/main.ts'),
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      chunkFilename: '[name].js',
      publicPath: 'http://localhost:3003/',
      scriptType: 'text/javascript',
      clean: true,
    },
    devtool: false,
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          include: sourcePath,
          use: {
            loader: swcLoader,
            options: {
              sourceMaps: true,
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
        {
          test: /\.module\.css$/,
          use: [
            styleLoader,
            {
              loader: cssLoader,
              options: {
                modules: {
                  localIdentName: '[name]__[local]__[hash:base64:5]',
                },
              },
            },
          ],
        },
        {
          test: /\.css$/,
          exclude: /\.module\.css$/,
          use: [styleLoader, cssLoader],
        },
        {
          test: /\.(png|svg|jpe?g|gif|webp)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'react_ts_host',
        filename: 'remoteEntry.js',
        remotes: {
          react_ts_nested_remote:
            'react_ts_nested_remote@http://localhost:3005/mf-manifest.json',
        },
        experiments: {
          asyncStartup: true,
        },
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'src/favicon.ico'),
            to: 'favicon.ico',
          },
        ],
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src/index.html'),
      }),
    ],
    watchOptions: {
      ignored: ['**/node_modules/**', '**/@mf-types/**', '**/dist/**'],
    },
    devServer: {
      host: '127.0.0.1',
      allowedHosts: 'all',
      historyApiFallback: true,
      client: {
        overlay: false,
      },
      devMiddleware: {
        writeToDisk: true,
      },
    },
    experiments: {
      outputModule: false,
    },
    optimization: {
      runtimeChunk: false,
      minimize: false,
    },
  };
};
