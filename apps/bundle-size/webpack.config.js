const path = require('path');
const swcLoader = require.resolve('swc-loader');
const styleLoader = require.resolve('style-loader');
const cssLoader = require.resolve('css-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/webpack');

module.exports = (_env, argv = {}) => {
  const isProduction = argv.mode === 'production';
  const sourcePath = path.resolve(__dirname, 'src');

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
      publicPath: 'auto',
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
        name: 'bundle_size',
        experiments: {
          externalRuntime: false,
          asyncStartup: true,
          optimization: {
            disableSnapshot: true,
            target: 'web',
          },
        },
        remotes: {},
        filename: 'remoteEntry.js',
        exposes: {
          './HelloWorld': './src/HelloWorld.tsx',
        },
        dts: {
          tsConfigPath: path.resolve(__dirname, 'tsconfig.app.json'),
        },
        shareStrategy: 'loaded-first',
        shared: {
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
      innerGraph: true,
      minimize: true,
    },
  };
};
