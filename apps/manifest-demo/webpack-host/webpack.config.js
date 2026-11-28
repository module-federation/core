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
module.exports = (_env, argv = {}) => {
  const isProduction = argv.mode === 'production';
  const sourcePath = path.resolve(__dirname, 'src');
  const runtimePluginPath = path.resolve(__dirname, 'runtimePlugin.ts');

  return {
    mode: isProduction ? 'production' : 'development',
    target: 'web',
    node: false,
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
      new ModuleFederationPlugin(require('./module-federation.config.cjs')),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src/index.html'),
      }),
    ],
    watchOptions: {
      ignored: ['**/node_modules/**', '**/@mf-types/**', '**/dist/**'],
    },
    devServer: {
      static: false,
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
      },
      devMiddleware: {
        writeToDisk: true,
      },
      historyApiFallback: true,
    },
    experiments: {
      outputModule: false,
      cacheUnaffected: true,
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
