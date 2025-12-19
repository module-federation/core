'use strict';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactServerWebpackPlugin = require('react-server-dom-webpack/plugin');
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/webpack');
const {
  WEBPACK_LAYERS,
  babelLoader,
} = require('../../app-shared/scripts/webpackShared');

const context = path.resolve(__dirname, '..');

const isProduction = process.env.NODE_ENV === 'production';

// =====================================================================================
// Client bundle (browser)
// =====================================================================================
const clientConfig = {
  context,
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  entry: {
    main: {
      import: path.resolve(__dirname, '../src/framework/bootstrap.js'),
      layer: WEBPACK_LAYERS.client,
    },
  },
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: '[name].js',
    // Remote chunks must load from app2 origin when consumed by hosts
    publicPath: 'auto',
  },
  optimization: {
    minimize: false,
    chunkIds: 'named',
    moduleIds: 'named',
  },
  experiments: {
    layers: true,
  },
  module: {
    rules: [
      // Allow imports without .js extension in ESM modules (only for workspace packages)
      {
        test: /\.m?js$/,
        include: (modulePath) => {
          return (
            modulePath.includes('shared-components') ||
            modulePath.includes('shared-rsc')
          );
        },
        resolve: { fullySpecified: false },
      },
      {
        test: /\.js$/,
        // Exclude node_modules EXCEPT our workspace packages
        exclude: (modulePath) => {
          if (
            modulePath.includes('shared-components') ||
            modulePath.includes('shared-rsc')
          )
            return false;
          return /node_modules/.test(modulePath);
        },
        oneOf: [
          {
            issuerLayer: WEBPACK_LAYERS.rsc,
            layer: WEBPACK_LAYERS.rsc,
            use: [
              babelLoader,
              {
                loader: require.resolve(
                  'react-server-dom-webpack/rsc-server-loader',
                ),
              },
            ],
          },
          {
            issuerLayer: WEBPACK_LAYERS.ssr,
            layer: WEBPACK_LAYERS.ssr,
            use: [
              babelLoader,
              {
                loader: require.resolve(
                  'react-server-dom-webpack/rsc-ssr-loader',
                ),
              },
            ],
          },
          {
            layer: WEBPACK_LAYERS.client,
            use: [
              babelLoader,
              {
                loader: require.resolve(
                  'react-server-dom-webpack/rsc-client-loader',
                ),
              },
            ],
          },
        ],
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, '../public/index.html'),
    }),
    new ReactServerWebpackPlugin({ isServer: false }),
    new ModuleFederationPlugin({
      name: 'app2',
      filename: 'remoteEntry.client.js',
      runtime: false,
      remotes: {
        // Bidirectional demo: app2 can also consume app1's client exposes.
        app1: 'app1@http://localhost:4101/remoteEntry.client.js',
      },
      manifest: {
        rsc: {
          layer: 'client',
          isRSC: false,
          shareScope: 'client',
          conditionNames: ['browser', 'import', 'require', 'default'],
          remote: {
            name: 'app2',
            url: 'http://localhost:4102',
            actionsEndpoint: 'http://localhost:4102/react',
            serverContainer: 'http://localhost:4102/remoteEntry.server.js',
          },
        },
      },
      exposes: {
        './Button': './src/Button.js',
        './DemoCounterButton': './src/DemoCounterButton.js',
        './server-actions': './src/server-actions.js',
      },
      experiments: { asyncStartup: true },
      shared: {
        react: {
          singleton: true,
          eager: false,
          requiredVersion: false,
          shareScope: 'client',
          layer: WEBPACK_LAYERS.client,
          issuerLayer: WEBPACK_LAYERS.client,
          allowNodeModulesSuffixMatch: true,
        },
        'react-dom': {
          singleton: true,
          eager: false,
          requiredVersion: false,
          shareScope: 'client',
          layer: WEBPACK_LAYERS.client,
          issuerLayer: WEBPACK_LAYERS.client,
          allowNodeModulesSuffixMatch: true,
        },
        '@rsc-demo/shared-rsc': {
          singleton: true,
          eager: false,
          requiredVersion: false,
          shareScope: 'client',
          layer: WEBPACK_LAYERS.client,
          issuerLayer: WEBPACK_LAYERS.client,
        },
        'shared-components': {
          singleton: true,
          eager: false,
          requiredVersion: false,
          shareScope: 'client',
          layer: WEBPACK_LAYERS.client,
          issuerLayer: WEBPACK_LAYERS.client,
        },
      },
      shareScope: ['default', 'client'],
      shareStrategy: 'version-first',
    }),
  ],
  resolve: {
    conditionNames: ['browser', 'import', 'require', 'default'],
  },
};

module.exports = clientConfig;
