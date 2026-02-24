const path = require('path');
const reactPath = path.dirname(require.resolve('react/package.json'));
const reactDomPath = path.dirname(require.resolve('react-dom/package.json'));
const swcLoader = require.resolve('swc-loader');
const styleLoader = require.resolve('style-loader');
const cssLoader = require.resolve('css-loader');
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

process.env.FEDERATION_DEBUG = true;
module.exports = (_env, argv = {}) => {
  const isProduction = argv.mode === 'production';
  const sourcePath = path.resolve(__dirname, 'src');

  return {
    mode: isProduction ? 'production' : 'development',
    target: 'web',
    context: __dirname,
    entry: {
      main: path.resolve(__dirname, 'src/index.tsx'),
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      chunkFilename: '[name].js',
      publicPath: 'http://127.0.0.1:3006/',
      scriptType: 'text/javascript',
      clean: true,
    },
    devtool: false,
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
      alias: {
        react: reactPath,
        'react-dom': reactDomPath,
      },
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
        name: 'runtime_remote1',
        filename: 'remoteEntry.js',
        exposes: {
          './useCustomRemoteHook': './src/components/useCustomRemoteHook',
          './WebpackSvg': './src/components/WebpackSvg',
          './WebpackPng': './src/components/WebpackPng',
        },
        shareStrategy: 'loaded-first',
        experiments: {
          asyncStartup: true,
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
        dts: {
          tsConfigPath: path.resolve(__dirname, 'tsconfig.app.json'),
        },
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
      port: 3006,
      allowedHosts: 'all',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods':
          'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers':
          'X-Requested-With, content-type, Authorization',
      },
      client: {
        overlay: false,
      },
      devMiddleware: {
        writeToDisk: true,
      },
    },
    optimization: {
      runtimeChunk: false,
      minimize: false,
      moduleIds: 'named',
    },
  };
};
