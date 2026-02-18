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
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = (_env, argv = {}) => {
  const isProduction = argv.mode === 'production';
  const sourcePath = path.resolve(__dirname, 'src');
  const runtimePluginPath = path.resolve(__dirname, 'runtimePlugin.ts');

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
      scriptType: 'text/javascript',
      publicPath: 'http://localhost:3013/',
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
          include: [sourcePath, runtimePluginPath],
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
                    refresh: !isProduction,
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
        runtime: false,
        name: 'manifest_host',
        remotes: {
          remote1: 'webpack_provider@http://localhost:3009/mf-manifest.json',
          'manifest-provider':
            'rspack_manifest_provider@http://localhost:3011/mf-manifest.json',
          'js-entry-provider':
            'rspack_js_entry_provider@http://localhost:3012/remoteEntry.js',
        },
        filename: 'remoteEntry.js',
        shared: {
          lodash: {},
          antd: {},
          'react/': {
            singleton: true,
            requiredVersion: '^18.3.1',
          },
          react: {
            singleton: true,
            requiredVersion: '^18.3.1',
          },
          'react-dom': {
            singleton: true,
            requiredVersion: '^18.3.1',
          },
          'react-dom/': {
            singleton: true,
            requiredVersion: '^18.3.1',
          },
        },
        dataPrefetch: true,
        runtimePlugins: [path.join(__dirname, './runtimePlugin.ts')],
        experiments: {
          provideExternalRuntime: true,
          asyncStartup: true,
        },
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src/index.html'),
      }),
      !isProduction && new ReactRefreshWebpackPlugin({ overlay: false }),
    ].filter(Boolean),
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
      historyApiFallback: true,
    },
    optimization: {
      runtimeChunk: 'single',
      minimize: false,
      moduleIds: 'named',
      chunkIds: 'named',
      splitChunks: false,
    },
  };
};
