const path = require('path');
// const { registerPluginTSTranspiler } = require('nx/src/utils/nx-plugin.js');
// registerPluginTSTranspiler();
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
    devtool: false,
    entry: path.join(SRC_PATH, 'index.ts'),
    output: {
      path: DIST_PATH,
      filename: isDevelopment ? '[name].js' : '[name].[contenthash].js',
      publicPath: 'auto',
      clean: true,
      scriptType: 'text/javascript',
      environment: {
        asyncFunction: true,
      },
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
      // const ModuleFederationPlugin = webpack.container.ModuleFederationPlugin;
      new HtmlWebpackPlugin({
        template: path.join(SRC_PATH, 'index.html'),
      }),
      new MiniCssExtractPlugin({
        filename: isDevelopment ? '[name].css' : '[name].[contenthash].css',
        chunkFilename: isDevelopment ? '[id].css' : '[id].[contenthash].css',
      }),
      isWebpackServe && isDevelopment && new ReactRefreshWebpackPlugin(),
      new ModuleFederationPlugin({
        name: 'runtime_host',
        experiments: { asyncStartup: true },
        remotes: {
          // remote2: 'runtime_remote2@http://localhost:3007/remoteEntry.js',
          remote1: 'runtime_remote1@http://127.0.0.1:3006/mf-manifest.json',
          // remote1: `promise new Promise((resolve)=>{
          //   const raw = 'runtime_remote1@http://127.0.0.1:3006/remoteEntry.js'
          //   const [_, remoteUrlWithVersion] = raw.split('@')
          //   const script = document.createElement('script')
          //   script.src = remoteUrlWithVersion
          //   script.onload = () => {
          //     const proxy = {
          //       get: (request) => window.runtime_remote1.get(request),
          //       init: (arg) => {
          //         try {
          //           return window.runtime_remote1.init(arg)
          //         } catch(e) {
          //           console.log('runtime_remote1 container already initialized')
          //         }
          //       }
          //     }
          //     resolve(proxy)
          //   }
          //   document.head.appendChild(script);
          // })`,
        },
        // library: { type: 'var', name: 'runtime_remote' },
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
      // Temporary workaround - https://github.com/nrwl/nx/issues/16983
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
      port: 3005,
      hot: isWebpackServe && isDevelopment,
      historyApiFallback: true,
      static: DIST_PATH,
      devMiddleware: {
        writeToDisk: true,
      },
    },
  };
};
