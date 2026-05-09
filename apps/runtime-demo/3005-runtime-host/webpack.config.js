/* eslint-env node */

const path = require('path');
const reactPath = path.dirname(require.resolve('react/package.json'));
const reactDomPath = path.dirname(require.resolve('react-dom/package.json'));
const swcLoader = require.resolve('swc-loader');
const styleLoader = require.resolve('style-loader');
const cssLoader = require.resolve('css-loader');
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/webpack');
const {
  ObservabilityBuildPlugin,
} = require('@module-federation/observability-plugin/build');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (_env, argv = {}) => {
  const isProduction = argv.mode === 'production';
  const sourcePath = path.resolve(__dirname, 'src');
  const moduleFederationOptions = {
    name: 'runtime_host',
    experiments: { asyncStartup: true },
    remotes: {
      remote1: 'runtime_remote1@http://127.0.0.1:3006/mf-manifest.json',
    },
    filename: 'remoteEntry.js',
    exposes: {
      './Button': './src/Button.tsx',
    },
    dts: {
      tsConfigPath: path.resolve(__dirname, 'tsconfig.app.json'),
    },
    shareStrategy: 'loaded-first',
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
  };

  return {
    mode: isProduction ? 'production' : 'development',
    target: 'web',
    context: __dirname,
    entry: {
      main: path.resolve(__dirname, 'src/index.ts'),
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      chunkFilename: '[name].js',
      scriptType: 'text/javascript',
      publicPath: 'auto',
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
      new ModuleFederationPlugin(moduleFederationOptions),
      new ObservabilityBuildPlugin({
        moduleFederation: moduleFederationOptions,
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
      historyApiFallback: true,
      client: {
        overlay: false,
      },
      devMiddleware: {
        writeToDisk: true,
      },
      setupMiddlewares: (middlewares, devServer) => {
        if (!devServer.app) {
          return middlewares;
        }

        const sendJson = (response, body) => {
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify(body));
        };
        const sendJs = (response, body) => {
          response.setHeader('Content-Type', 'application/javascript');
          response.end(body);
        };
        const createManifest = ({ name, globalName, publicPath }) => ({
          id: name,
          name,
          metaData: {
            name,
            type: 'app',
            buildInfo: {
              buildVersion: 'observability-fixture',
              buildName: name,
            },
            remoteEntry: {
              name: 'remoteEntry.js',
              path: '',
              type: 'global',
            },
            types: {
              path: '',
              name: '',
              zip: '',
              api: '',
            },
            globalName,
            pluginVersion: 'observability-fixture',
            publicPath,
          },
          shared: [],
          remotes: [],
          exposes: [
            {
              id: `${name}:Button`,
              name: 'Button',
              assets: {
                js: {
                  sync: [],
                  async: [],
                },
                css: {
                  sync: [],
                  async: [],
                },
              },
              path: './Button',
            },
          ],
        });

        devServer.app.get(
          '/observability-fixtures/missing-fields/mf-manifest.json',
          (_request, response) => {
            sendJson(response, {
              id: 'observability_missing_fields_remote',
              name: 'observability_missing_fields_remote',
            });
          },
        );
        devServer.app.get(
          '/observability-fixtures/retry-recovered/mf-manifest.json',
          (_request, response) => {
            sendJson(
              response,
              createManifest({
                name: 'observability_retry_recovered_remote',
                globalName: 'observability_retry_recovered_remote',
                publicPath:
                  'http://127.0.0.1:3005/observability-fixtures/retry-recovered/',
              }),
            );
          },
        );
        devServer.app.get(
          '/observability-fixtures/retry-recovered/remoteEntry.js',
          (request, response) => {
            if (request.query.retryCount !== '1') {
              response.statusCode = 503;
              response.end('observability retry fixture failed before retry');
              return;
            }

            sendJs(
              response,
              [
                'window.observability_retry_recovered_remote = {',
                '  init: function() {},',
                '  get: function() {',
                '    return Promise.resolve(function() {',
                '      return { default: function ObservabilityRetryRecovered() { return null; } };',
                '    });',
                '  }',
                '};',
              ].join('\n'),
            );
          },
        );
        devServer.app.get(
          '/observability-fixtures/wrong-global/mf-manifest.json',
          (_request, response) => {
            sendJson(
              response,
              createManifest({
                name: 'observability_wrong_global_remote',
                globalName: 'observability_wrong_global_expected',
                publicPath:
                  'http://127.0.0.1:3005/observability-fixtures/wrong-global/',
              }),
            );
          },
        );
        devServer.app.get(
          '/observability-fixtures/wrong-global/remoteEntry.js',
          (_request, response) => {
            sendJs(
              response,
              [
                'window.observability_wrong_global_actual = {',
                '  init: function() {},',
                '  get: function() {',
                '    return Promise.resolve(function() {',
                '      return { default: function ObservabilityWrongGlobal() { return null; } };',
                '    });',
                '  }',
                '};',
              ].join('\n'),
            );
          },
        );
        devServer.app.get(
          '/observability-fixtures/execution-error/mf-manifest.json',
          (_request, response) => {
            sendJson(
              response,
              createManifest({
                name: 'observability_execution_error_remote',
                globalName: 'observability_execution_error_remote',
                publicPath:
                  'http://127.0.0.1:3005/observability-fixtures/execution-error/',
              }),
            );
          },
        );
        devServer.app.get(
          '/observability-fixtures/execution-error/remoteEntry.js',
          (_request, response) => {
            sendJs(
              response,
              "throw new Error('observability remoteEntry execution failed');",
            );
          },
        );
        return middlewares;
      },
    },
    optimization: {
      runtimeChunk: false,
      minimize: false,
      moduleIds: 'named',
    },
  };
};
