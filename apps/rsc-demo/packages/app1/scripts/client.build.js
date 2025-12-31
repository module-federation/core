'use strict';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactServerWebpackPlugin = require('react-server-dom-webpack/plugin');
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/webpack');
const CollectServerActionsPlugin = require('@rsc-demo/app-shared/webpack/CollectServerActionsPlugin');
const {
  WEBPACK_LAYERS,
  babelLoader,
} = require('@rsc-demo/app-shared/webpack/webpackShared');

const context = path.resolve(__dirname, '..');
const isProduction = process.env.NODE_ENV === 'production';

const appSharedRoot = path.dirname(
  require.resolve('@rsc-demo/app-shared/package.json'),
);
const sharedRoot = path.dirname(
  require.resolve('@rsc-demo/shared/package.json'),
);
const WORKSPACE_PACKAGE_ROOTS = [appSharedRoot, sharedRoot].map((p) =>
  path.normalize(`${p}${path.sep}`),
);

function isWorkspacePackageModule(modulePath) {
  if (typeof modulePath !== 'string' || modulePath.length === 0) return false;
  const normalized = path.normalize(modulePath.split('?')[0]);
  return WORKSPACE_PACKAGE_ROOTS.some((root) => normalized.startsWith(root));
}

/**
 * Client bundle configuration
 *
 * Uses webpack layers for proper code separation:
 * - 'use server' modules → createServerReference() calls (tree-shaken)
 * - 'use client' modules → actual component code (bundled)
 * - Server components → excluded from client bundle
 */
const clientConfig = {
  context,
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  entry: {
    main: {
      import: require.resolve('@rsc-demo/app-shared/framework/bootstrap'),
      layer: WEBPACK_LAYERS.client, // Entry point is in client layer
    },
  },
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: '[name].js',
    publicPath: 'auto',
  },
  optimization: {
    minimize: false,
    chunkIds: 'named',
    moduleIds: 'named',
  },
  // Enable webpack layers (stable feature)
  experiments: {
    layers: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        // Exclude node_modules EXCEPT our workspace packages
        exclude: (modulePath) => {
          if (isWorkspacePackageModule(modulePath)) return false;
          return /node_modules/.test(modulePath);
        },
        // Use oneOf for layer-based loader selection
        oneOf: [
          // RSC layer: Server Components
          // Transforms 'use client' → client reference proxies
          // Transforms 'use server' → registerServerReference
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
          // SSR layer: Server-Side Rendering
          // Transforms 'use server' → error stubs (can't call actions during SSR)
          // Passes through 'use client' (renders actual components)
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
          // Client/Browser layer (default)
          // Transforms 'use server' → createServerReference() stubs
          // Passes through 'use client' (actual component code)
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
      // CSS handling (if needed)
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, '../public/index.html'),
    }),
    // Generate client manifest for 'use client' components
    new ReactServerWebpackPlugin({ isServer: false }),
    // Collect 'use server' modules seen by the client build so the RSC server
    // can bootstrap them without manual imports.
    new CollectServerActionsPlugin(),
    // Enable Module Federation for the client bundle (app1 as a host).
    // This runs in the client layer, so we use a dedicated 'client' shareScope
    // and mark shares as client-layer React/DOM.
    new ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.client.js',
      runtime: false,
      // Consume app2's federated modules (Button, DemoCounterButton)
      remotes: {
        app2: 'app2@http://localhost:4102/remoteEntry.client.js',
      },
      // Also act as a remote so app2 can consume app1 in bidirectional tests/demos.
      exposes: {
        './HostBadge': './src/HostBadge.js',
      },
      experiments: {
        asyncStartup: true,
      },
      shared: {
        react: {
          singleton: true,
          eager: false,
          requiredVersion: false,
          shareScope: 'client',
          layer: WEBPACK_LAYERS.client,
          issuerLayer: WEBPACK_LAYERS.client,
        },
        'react-dom': {
          singleton: true,
          eager: false,
          requiredVersion: false,
          shareScope: 'client',
          layer: WEBPACK_LAYERS.client,
          issuerLayer: WEBPACK_LAYERS.client,
        },
        '@rsc-demo/shared': {
          singleton: true,
          eager: false,
          requiredVersion: false,
          shareScope: 'client',
          layer: WEBPACK_LAYERS.client,
          issuerLayer: WEBPACK_LAYERS.client,
        },
      },
      // Initialize default + client scopes; this share lives in 'client'.
      shareScope: ['default', 'client'],
      shareStrategy: 'version-first',
      /**
       * Attach RSC-aware metadata to mf-stats/mf-manifest so SSR can resolve
       * client references without app-level copy/paste logic.
       */
      manifest: {
        rsc: {},
      },
    }),
  ],
  resolve: {
    // Condition names for proper module resolution per layer
    // Client bundle uses browser conditions
    conditionNames: ['browser', 'import', 'require', 'default'],
  },
};

module.exports = clientConfig;
