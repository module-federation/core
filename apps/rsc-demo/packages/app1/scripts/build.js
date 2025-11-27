/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

const path = require('path');
const rimraf = require('rimraf');
const webpack = require('webpack');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactServerWebpackPlugin = require('react-server-dom-webpack/plugin');
const {ModuleFederationPlugin} = require('@module-federation/enhanced/webpack');
const {
  WEBPACK_LAYERS,
  babelLoader,
} = require('../../app-shared/scripts/webpackShared');
// React 19 exports don't expose these subpaths via "exports", so resolve by file path
const reactPkgRoot = path.dirname(require.resolve('react/package.json'));
const reactServerEntry = path.join(reactPkgRoot, 'react.react-server.js');
const reactJSXServerEntry = path.join(
  reactPkgRoot,
  'jsx-runtime.react-server.js'
);
const reactJSXDevServerEntry = path.join(
  reactPkgRoot,
  'jsx-dev-runtime.react-server.js'
);
const rsdwServerPath = path.resolve(
  require.resolve('react-server-dom-webpack/package.json'),
  '..',
  'server.node.js'
);
const rsdwServerUnbundledPath = require.resolve(
  'react-server-dom-webpack/server.node.unbundled'
);

const isProduction = process.env.NODE_ENV === 'production';
const isWatchMode = process.argv.includes('--watch');
rimraf.sync(path.resolve(__dirname, '../build'));

/**
 * Client bundle configuration
 *
 * Uses webpack layers for proper code separation:
 * - 'use server' modules → createServerReference() calls (tree-shaken)
 * - 'use client' modules → actual component code (bundled)
 * - Server components → excluded from client bundle
 */
const webpackConfig = {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  entry: {
    main: {
      import: path.resolve(__dirname, '../src/framework/bootstrap.js'),
      layer: WEBPACK_LAYERS.client, // Entry point is in client layer
    },
  },
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: '[name].js',
    publicPath: 'http://localhost:4101/',
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
          // Include shared-components (workspace package)
          if (
            modulePath.includes('shared-components') ||
            modulePath.includes('shared-rsc')
          )
            return false;
          // Exclude other node_modules
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
                  'react-server-dom-webpack/rsc-server-loader'
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
                  'react-server-dom-webpack/rsc-ssr-loader'
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
                  'react-server-dom-webpack/rsc-client-loader'
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
    new ReactServerWebpackPlugin({isServer: false}),
    // Enable Module Federation for the client bundle (app1 as a host).
    // This runs in the client layer, so we use a dedicated 'client' shareScope
    // and mark shares as client-layer React/DOM.
    new ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.client.js',
      // Consume app2's federated modules (Button, DemoCounterButton)
      remotes: {
        app2: 'app2@http://localhost:4102/remoteEntry.client.js',
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
      // Initialize default + client scopes; this share lives in 'client'.
      shareScope: ['default', 'client'],
      shareStrategy: 'version-first',
    }),
  ],
  resolve: {
    // Condition names for proper module resolution per layer
    // Client bundle uses browser conditions
    conditionNames: ['browser', 'import', 'require', 'default'],
  },
};

/**
 * Server bundle configuration (for RSC rendering)
 *
 * This builds the RSC server entry with resolve.conditionNames: ['react-server', ...]
 * which means React packages resolve to their server versions at BUILD time.
 * No --conditions=react-server flag needed at runtime!
 */
const serverConfig = {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  target: 'async-node',
  entry: {
    server: {
      // Bundle server-entry.js which exports ReactApp and rendering utilities
      import: path.resolve(__dirname, '../src/server-entry.js'),
      layer: WEBPACK_LAYERS.rsc, // Entry point is in RSC layer
    },
  },
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: '[name].rsc.js',
    libraryTarget: 'commonjs2',
    // Allow Node federation runtime to fetch chunks over HTTP (needed for remote entry)
    publicPath: 'http://localhost:4101/',
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
        resolve: {fullySpecified: false},
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
          // RSC layer for server bundle
          {
            issuerLayer: WEBPACK_LAYERS.rsc,
            layer: WEBPACK_LAYERS.rsc,
            use: [
              babelLoader,
              {
                loader: require.resolve(
                  'react-server-dom-webpack/rsc-server-loader'
                ),
              },
            ],
          },
          // Default to RSC layer for server bundle
          {
            layer: WEBPACK_LAYERS.rsc,
            use: [
              babelLoader,
              {
                loader: require.resolve(
                  'react-server-dom-webpack/rsc-server-loader'
                ),
              },
            ],
          },
        ],
      },
    ],
  },
  plugins: [
    // Generate server actions manifest for 'use server' modules from the server bundle
    new ReactServerWebpackPlugin({
      isServer: true,
      extraServerActionsManifests: [
        path.resolve(
          __dirname,
          '../../app2/build/react-server-actions-manifest.json'
        ),
      ],
    }),
    // Enable Module Federation for the RSC server bundle (app1 as a Node host).
    // This is the RSC layer, so we use a dedicated 'rsc' shareScope and
    // mark React/RSDW as rsc-layer shares.
    //
    // SERVER-SIDE FEDERATION: app1 consumes app2's RSC container for:
    // - Server components (rendered in app1's RSC stream)
    // - Client component references (serialized as $L client refs)
    //
    // TODO (Option 2 - Deep MF Integration):
    // To fully federate server actions via MF (not HTTP forwarding), we would need to:
    // 1. Modify rsc-server-loader.js to call registerServerReference for remote modules
    // 2. Modify react-server-dom-webpack-plugin.js to include remote actions in manifest
    // 3. Ensure remote 'use server' modules register with host's serverActionRegistry
    // See: packages/react-server-dom-webpack/cjs/rsc-server-loader.js
    // See: packages/react-server-dom-webpack/cjs/react-server-dom-webpack-plugin.js
    new ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.server.js',
      // Consume app2's RSC container for server-side federation
      remotes: {
        app2: 'app2@http://localhost:4102/remoteEntry.server.js',
      },
      experiments: {
        asyncStartup: true,
      },
      runtimePlugins: [
        require.resolve('@module-federation/node/runtimePlugin'),
        require.resolve('../../app-shared/scripts/rscRuntimePlugin.js'),
      ],
      shared: {
        react: {
          singleton: true,
          eager: false,
          requiredVersion: false,
          shareScope: 'rsc',
          layer: WEBPACK_LAYERS.rsc,
          issuerLayer: WEBPACK_LAYERS.rsc,
          import: reactServerEntry,
          shareKey: 'react',
          shareScope: 'rsc',
          allowNodeModulesSuffixMatch: true,
        },
        'react-dom': {
          singleton: true,
          eager: false,
          requiredVersion: false,
          shareScope: 'rsc',
          layer: WEBPACK_LAYERS.rsc,
          issuerLayer: WEBPACK_LAYERS.rsc,
          allowNodeModulesSuffixMatch: true,
        },
        'react/jsx-runtime': {
          singleton: true,
          eager: false,
          requiredVersion: false,
          shareScope: 'rsc',
          layer: WEBPACK_LAYERS.rsc,
          issuerLayer: WEBPACK_LAYERS.rsc,
          import: reactJSXServerEntry,
          shareKey: 'react/jsx-runtime',
          allowNodeModulesSuffixMatch: true,
        },
        'react/jsx-dev-runtime': {
          singleton: true,
          eager: false,
          requiredVersion: false,
          shareScope: 'rsc',
          layer: WEBPACK_LAYERS.rsc,
          issuerLayer: WEBPACK_LAYERS.rsc,
          import: reactJSXDevServerEntry,
          shareKey: 'react/jsx-dev-runtime',
          allowNodeModulesSuffixMatch: true,
        },
        'react-server-dom-webpack': {
          singleton: true,
          eager: false,
          requiredVersion: false,
          shareScope: 'rsc',
          layer: WEBPACK_LAYERS.rsc,
          issuerLayer: WEBPACK_LAYERS.rsc,
        },
        'react-server-dom-webpack/server': {
          // Match require('react-server-dom-webpack/server') if any code uses it
          import: rsdwServerPath,
          requiredVersion: false,
          singleton: true,
          shareScope: 'rsc',
          layer: WEBPACK_LAYERS.rsc,
          issuerLayer: WEBPACK_LAYERS.rsc,
        },
        'react-server-dom-webpack/server.node': {
          // The rsc-server-loader emits require('react-server-dom-webpack/server.node')
          // This resolves it to the correct server writer (no --conditions flag needed)
          import: rsdwServerPath,
          requiredVersion: false,
          singleton: true,
          shareScope: 'rsc',
          layer: WEBPACK_LAYERS.rsc,
          issuerLayer: WEBPACK_LAYERS.rsc,
        },
        'react-server-dom-webpack/server.node.unbundled': {
          import: rsdwServerUnbundledPath,
          requiredVersion: false,
          singleton: true,
          shareScope: 'rsc',
          layer: WEBPACK_LAYERS.rsc,
          issuerLayer: WEBPACK_LAYERS.rsc,
        },
        '@rsc-demo/shared-rsc': {
          singleton: true,
          eager: false,
          requiredVersion: false,
          shareScope: 'rsc',
          layer: WEBPACK_LAYERS.rsc,
          issuerLayer: WEBPACK_LAYERS.rsc,
        },
        'shared-components': {
          singleton: true,
          eager: false,
          requiredVersion: false,
          shareScope: 'rsc',
          layer: WEBPACK_LAYERS.rsc,
          issuerLayer: WEBPACK_LAYERS.rsc,
        },
      },
      // Initialize default + rsc scopes; this share lives in 'rsc'.
      shareScope: ['default', 'rsc'],
      shareStrategy: 'version-first',
    }),
  ],
  resolve: {
    // Server uses react-server condition for proper RSC module resolution
    conditionNames: ['react-server', 'node', 'import', 'require', 'default'],
  },
};

/**
 * SSR bundle configuration (for server-side rendering of client components)
 * This builds client components for Node.js execution during SSR
 */
const ssrConfig = {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  target: 'node',
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
        resolve: {fullySpecified: false},
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
          // SSR layer: transforms 'use server' to stubs, keeps client components
          {
            issuerLayer: WEBPACK_LAYERS.ssr,
            layer: WEBPACK_LAYERS.ssr,
            use: [
              babelLoader,
              {
                loader: require.resolve(
                  'react-server-dom-webpack/rsc-ssr-loader'
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
                  'react-server-dom-webpack/rsc-ssr-loader'
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
      extraServerActionsManifests: [
        path.resolve(
          __dirname,
          '../../app2/build/react-server-actions-manifest.json'
        ),
      ],
    }),
  ],
  resolve: {
    // SSR uses node conditions
    conditionNames: ['node', 'import', 'require', 'default'],
  },
  externals: {
    // Externalize React packages to use the same instances as the server
    react: 'commonjs react',
    'react-dom': 'commonjs react-dom',
    'react-dom/server': 'commonjs react-dom/server',
    'react-server-dom-webpack': 'commonjs react-server-dom-webpack',
    'react-server-dom-webpack/server':
      'commonjs react-server-dom-webpack/server',
  },
};

function handleStats(err, stats) {
  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    if (!isWatchMode) {
      process.exit(1);
    }
    return;
  }
  const info = stats.toJson();
  if (stats.hasErrors()) {
    console.log('Finished running webpack with errors.');
    info.errors.forEach((e) => console.error(e));
    if (!isWatchMode) {
      process.exit(1);
    }
  } else {
    console.log('Finished running webpack.');
  }
}

const compiler = webpack([webpackConfig, serverConfig, ssrConfig]);

if (isWatchMode) {
  console.log('Starting webpack (client + rsc) in watch mode...');
  compiler.watch({aggregateTimeout: 300, poll: undefined}, handleStats);
} else {
  compiler.run((err, stats) => {
    handleStats(err, stats);
  });
}
