/**
 * Build script for app2 (remote)
 * - Client bundle (browser)
 * - RSC server bundle
 * - SSR bundle
 * Uses Module Federation (enhanced) with HTTP-based remotes.
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
const reactRoot = path.dirname(require.resolve('react/package.json'));
// React 19 exports don't expose these subpaths via "exports", so resolve by file path
const reactServerEntry = path.join(reactRoot, 'react.react-server.js');
const reactJSXServerEntry = path.join(reactRoot, 'jsx-runtime.react-server.js');
const reactJSXDevServerEntry = path.join(
  reactRoot,
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

// =====================================================================================
// Client bundle (browser)
// =====================================================================================
const webpackConfig = {
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
    publicPath: 'http://localhost:4102/',
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
          {
            issuerLayer: WEBPACK_LAYERS.rsc,
            layer: WEBPACK_LAYERS.rsc,
            use: [
              babelLoader,
              {
                loader: require.resolve(
                  'react-server-dom-webpack/rsc-server-loader'
                ),
                options: {
                  reactServerEntry,
                  reactJSXServerEntry,
                  reactJSXDevServerEntry,
                },
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
                  'react-server-dom-webpack/rsc-ssr-loader'
                ),
                options: {
                  reactServerEntry,
                  reactJSXServerEntry,
                  reactJSXDevServerEntry,
                },
              },
            ],
          },
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
      {test: /\.css$/, use: ['style-loader', 'css-loader']},
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, '../public/index.html'),
    }),
    new ReactServerWebpackPlugin({isServer: false}),
    new ModuleFederationPlugin({
      name: 'app2',
      filename: 'remoteEntry.client.js',
      manifest: {
        additionalData: ({stats}) => {
          stats.rsc = {
            layer: 'client',
            isRSC: false,
            shareScope: 'client',
            conditionNames: ['browser', 'import', 'require', 'default'],
            remote: {
              name: 'app2',
              url: 'http://localhost:4102',
              actionsEndpoint: 'http://localhost:4102/react',
            },
            exposeTypes: {
              './Button': 'client-component',
              './DemoCounterButton': 'client-component',
              './server-actions': 'server-action-stubs',
            },
          };
          return stats;
        },
      },
      exposes: {
        './Button': './src/Button.js',
        './DemoCounterButton': './src/DemoCounterButton.js',
        './server-actions': './src/server-actions.js',
      },
      experiments: {asyncStartup: true},
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

// =====================================================================================
// Server bundle (RSC)
// =====================================================================================
const serverConfig = {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  target: 'async-node', // allows HTTP chunk loading for node MF runtime
  entry: {
    server: {
      import: path.resolve(__dirname, '../src/server-entry.js'),
      layer: WEBPACK_LAYERS.rsc,
    },
  },
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: '[name].rsc.js',
    libraryTarget: 'commonjs2',
    publicPath: 'http://localhost:4102/',
  },
  optimization: {
    minimize: false,
    chunkIds: 'named',
    moduleIds: 'named',
  },
  experiments: {layers: true},
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
    new ReactServerWebpackPlugin({isServer: true}),
    new ModuleFederationPlugin({
      name: 'app2',
      filename: 'remoteEntry.server.js',
      manifest: {
        additionalData: ({stats}) => {
          stats.rsc = {
            layer: 'rsc',
            isRSC: true,
            shareScope: 'rsc',
            conditionNames: [
              'react-server',
              'node',
              'import',
              'require',
              'default',
            ],
            remote: {
              name: 'app2',
              url: 'http://localhost:4102',
              actionsEndpoint: 'http://localhost:4102/react',
              serverContainer: 'http://localhost:4102/remoteEntry.server.js',
            },
            exposeTypes: {
              './Button': 'client-component',
              './DemoCounterButton': 'client-component',
              './server-actions': 'server-action',
            },
            serverActionsManifest:
              'http://localhost:4102/react-server-actions-manifest.json',
            clientManifest: 'http://localhost:4102/react-client-manifest.json',
          };
          return stats;
        },
      },
      exposes: {
        './Button': './src/Button.js',
        './DemoCounterButton': './src/DemoCounterButton.js',
        './server-actions': './src/server-actions.js',
      },
      runtimePlugins: [
        require.resolve('@module-federation/node/runtimePlugin'),
        require.resolve('../../app-shared/scripts/rscRuntimePlugin.js'),
      ],
      experiments: {asyncStartup: true},
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
      shareScope: ['default', 'rsc'],
      shareStrategy: 'version-first',
    }),
  ],
  resolve: {
    conditionNames: ['react-server', 'node', 'import', 'require', 'default'],
    alias: {
      react: path.join(reactRoot, 'react.react-server.js'),
      'react/jsx-runtime': path.join(reactRoot, 'jsx-runtime.react-server.js'),
      'react/jsx-dev-runtime': path.join(
        reactRoot,
        'jsx-dev-runtime.react-server.js'
      ),
    },
  },
};

// =====================================================================================
// SSR bundle (for server-side rendering of client components)
// =====================================================================================
const ssrConfig = {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  target: 'node',
  entry: {
    ssr: {
      import: path.resolve(__dirname, '../src/framework/ssr-entry.js'),
      layer: WEBPACK_LAYERS.ssr,
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
  experiments: {layers: true},
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
      {test: /\.css$/, use: ['null-loader']},
    ],
  },
  plugins: [
    new ReactServerWebpackPlugin({
      isServer: true,
      ssrManifestFilename: 'react-ssr-manifest.json',
    }),
  ],
  resolve: {
    conditionNames: ['node', 'import', 'require', 'default'],
  },
  externals: {
    react: 'commonjs react',
    'react-dom': 'commonjs react-dom',
    'react-dom/server': 'commonjs react-dom/server',
    'react-server-dom-webpack': 'commonjs react-server-dom-webpack',
    'react-server-dom-webpack/server':
      'commonjs react-server-dom-webpack/server',
  },
};

// =====================================================================================
function handleStats(err, stats) {
  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    if (!isWatchMode) process.exit(1);
    return;
  }
  const info = stats.toJson();
  if (stats.hasErrors()) {
    console.log('Finished running webpack with errors.');
    info.errors.forEach((e) => console.error(e));
    if (!isWatchMode) process.exit(1);
  } else {
    console.log('Finished running webpack.');

    // Provide app2-remote.js for server-side federation tests (alias of remoteEntry.server.js)
    const remoteEntryPath = path.resolve(
      __dirname,
      '../build/remoteEntry.server.js'
    );
    const remoteAliasPath = path.resolve(__dirname, '../build/app2-remote.js');
    if (fs.existsSync(remoteEntryPath)) {
      fs.copyFileSync(remoteEntryPath, remoteAliasPath);
    }
  }
}

const compiler = webpack([webpackConfig, serverConfig, ssrConfig]);

if (isWatchMode) {
  console.log('Starting webpack (client + rsc + ssr) in watch mode...');
  compiler.watch({aggregateTimeout: 300, poll: undefined}, handleStats);
} else {
  compiler.run((err, stats) => {
    handleStats(err, stats);
  });
}
