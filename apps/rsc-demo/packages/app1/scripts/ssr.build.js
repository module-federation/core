'use strict';

const path = require('path');
const webpack = require('webpack');
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/webpack');
const ReactServerWebpackPlugin = require('react-server-dom-webpack/plugin');
const {
  WEBPACK_LAYERS,
  babelLoader,
} = require('../../app-shared/scripts/webpackShared');
const AutoIncludeClientComponentsPlugin = require('../../app-shared/scripts/AutoIncludeClientComponentsPlugin');

const context = path.resolve(__dirname, '..');

const isProduction = process.env.NODE_ENV === 'production';

/**
 * SSR bundle configuration (for server-side rendering of client components)
 * This builds client components for Node.js execution during SSR
 */
const ssrConfig = {
  context,
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  target: 'async-node',
  node: {
    // Use real __dirname so ssr-entry.js can find mf-manifest.json at runtime
    __dirname: false,
  },
  entry: {
    ssr: {
      import: path.resolve(__dirname, '../src/framework/ssr-entry.js'),
      layer: WEBPACK_LAYERS.ssr, // Entry point is in SSR layer
    },
  },
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    publicPath: 'auto',
  },
  optimization: {
    minimize: false,
    chunkIds: 'named',
    moduleIds: 'named',
    // Preserve 'default' export names so React SSR can resolve client components
    mangleExports: false,
    // Disable module concatenation so client components have individual module IDs
    // This is required for SSR to resolve client component references from the flight stream
    concatenateModules: false,
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
          return modulePath.includes('rsc-demo-shared');
        },
        resolve: { fullySpecified: false },
      },
      {
        test: /\.js$/,
        // Exclude node_modules EXCEPT our workspace packages
        exclude: (modulePath) => {
          if (modulePath.includes('rsc-demo-shared')) return false;
          return /node_modules/.test(modulePath);
        },
        oneOf: [
          // SSR layer: transforms 'use server' to stubs, keeps client components
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
          // Default to SSR layer for SSR bundle
          {
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
        ],
      },
      // CSS handling (if needed)
      {
        test: /\.css$/,
        use: ['null-loader'], // Ignore CSS in SSR bundle
      },
    ],
  },
  plugins: [
    // Generate SSR manifest for client component resolution during SSR
    new ReactServerWebpackPlugin({
      isServer: true,
      ssrManifestFilename: 'react-ssr-manifest.json',
      // Use a different filename to avoid overwriting the RSC manifest
      // SSR doesn't need server actions (they're stubs that throw errors)
      serverActionsManifestFilename: 'react-ssr-server-actions.json',
    }),
    // Lightweight federation runtime to run SSR runtime plugins (no exposes needed)
    new ModuleFederationPlugin({
      name: 'app1-ssr',
      filename: 'remoteEntry.ssr.js',
      runtime: false,
      manifest: {
        fileName: 'mf-manifest.ssr',
        rsc: {},
      },
      remotes: {
        // Use the remote's SSR manifest (Node-friendly) rather than the browser remoteEntry.
        app2: 'app2@http://localhost:4102/mf-manifest.ssr.json',
      },
      experiments: { asyncStartup: true },
      runtimePlugins: [
        require.resolve('@module-federation/node/runtimePlugin'),
        require.resolve('../../app-shared/scripts/rscSSRRuntimePlugin.js'),
      ],
      shared: {
        react: {
          singleton: true,
          eager: false,
          requiredVersion: false,
          shareScope: 'client',
          layer: WEBPACK_LAYERS.ssr,
          issuerLayer: WEBPACK_LAYERS.ssr,
        },
        'react-dom': {
          singleton: true,
          eager: false,
          requiredVersion: false,
          shareScope: 'client',
          layer: WEBPACK_LAYERS.ssr,
          issuerLayer: WEBPACK_LAYERS.ssr,
        },
      },
      shareScope: ['client'],
      shareStrategy: 'version-first',
    }),
    new AutoIncludeClientComponentsPlugin(),
  ],
  resolve: {
    // SSR uses node conditions
    conditionNames: ['node', 'import', 'require', 'default'],
  },
};

module.exports = ssrConfig;
