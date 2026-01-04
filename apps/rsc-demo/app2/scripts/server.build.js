'use strict';

const path = require('path');
const ReactServerWebpackPlugin = require('react-server-dom-webpack/plugin');
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/webpack');
const ServerActionsBootstrapPlugin = require('@module-federation/rsc-tools/webpack/ServerActionsBootstrapPlugin');
const {
  WEBPACK_LAYERS,
  babelLoader,
} = require('@module-federation/rsc-tools/webpack/webpackShared');

const context = path.resolve(__dirname, '..');
const reactRoot = path.dirname(require.resolve('react/package.json'));
// React 19 exports don't expose these subpaths via "exports", so resolve by file path
const reactServerEntry = path.join(reactRoot, 'react.react-server.js');
const reactJSXServerEntry = path.join(reactRoot, 'jsx-runtime.react-server.js');
const reactJSXDevServerEntry = path.join(
  reactRoot,
  'jsx-dev-runtime.react-server.js',
);
const rsdwServerPath = path.resolve(
  require.resolve('react-server-dom-webpack/package.json'),
  '..',
  'server.node.js',
);
const rsdwServerUnbundledPath = require.resolve(
  'react-server-dom-webpack/server.node.unbundled',
);

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
const WORKSPACE_SHARED_ROOT = path.normalize(`${sharedRoot}${path.sep}`);

function isWorkspacePackageModule(modulePath) {
  if (typeof modulePath !== 'string' || modulePath.length === 0) return false;
  const normalized = path.normalize(modulePath.split('?')[0]);
  return WORKSPACE_PACKAGE_ROOTS.some((root) => normalized.startsWith(root));
}

// =====================================================================================
// Server bundle (RSC)
// =====================================================================================
const serverConfig = {
  context,
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
    publicPath: 'auto',
  },
  optimization: {
    minimize: false,
    chunkIds: 'named',
    moduleIds: 'named',
  },
  experiments: { layers: true },
  module: {
    rules: [
      // Allow imports without .js extension in ESM modules (only for workspace packages)
      {
        test: /\.m?js$/,
        include: (modulePath) => {
          if (typeof modulePath !== 'string' || modulePath.length === 0) {
            return false;
          }
          const normalized = path.normalize(modulePath.split('?')[0]);
          return normalized.startsWith(WORKSPACE_SHARED_ROOT);
        },
        resolve: { fullySpecified: false },
      },
      {
        test: /\.js$/,
        // Exclude node_modules EXCEPT our workspace packages
        exclude: (modulePath) => {
          if (isWorkspacePackageModule(modulePath)) return false;
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
        ],
      },
    ],
  },
  plugins: [
    // Ensure all 'use server' modules referenced by client code are bundled and
    // executed on startup so registerServerReference() runs.
    new ServerActionsBootstrapPlugin({
      entryName: 'server',
    }),
    new ReactServerWebpackPlugin({ isServer: true }),
    new ModuleFederationPlugin({
      name: 'app2',
      filename: 'remoteEntry.server.js',
      // CommonJS container; loaded via script remoteType on the host. Node
      // federation runtime will hydrate chunk loading for async-node target.
      library: { type: 'commonjs-module', name: 'app2' },
      runtime: false,
      experiments: { asyncStartup: true },
      manifest: {
        fileName: 'mf-manifest.server',
        rsc: {},
      },
      exposes: {
        './Button': './src/Button.js',
        './DemoCounterButton': './src/DemoCounterButton.js',
        './RemoteServerWidget': './src/RemoteServerWidget.server.js',
        './server-actions': './src/server-actions.js',
      },
      runtimePlugins: [
        require.resolve('@module-federation/node/runtimePlugin'),
        require.resolve(
          '@module-federation/rsc-tools/runtime/rscRuntimePlugin.js',
        ),
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
          eager: false,
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
          eager: false,
          requiredVersion: false,
          singleton: true,
          shareScope: 'rsc',
          layer: WEBPACK_LAYERS.rsc,
          issuerLayer: WEBPACK_LAYERS.rsc,
        },
        'react-server-dom-webpack/server.node.unbundled': {
          import: rsdwServerUnbundledPath,
          eager: false,
          requiredVersion: false,
          singleton: true,
          shareScope: 'rsc',
          layer: WEBPACK_LAYERS.rsc,
          issuerLayer: WEBPACK_LAYERS.rsc,
        },
        '@rsc-demo/shared': {
          singleton: true,
          eager: false,
          requiredVersion: false,
          shareScope: 'rsc',
          layer: WEBPACK_LAYERS.rsc,
          issuerLayer: WEBPACK_LAYERS.rsc,
        },
      },
      // Server bundle should only use the RSC share scope to pick react-server builds.
      shareScope: ['rsc'],
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
        'jsx-dev-runtime.react-server.js',
      ),
      // CRITICAL: Force all imports of react-server-dom-webpack/server.node to use our
      // patched wrapper that exposes getServerAction and the shared serverActionRegistry.
      // Without this alias, the MF share scope may provide the unpatched npm package version,
      // causing server actions to register to a different registry than the one used by
      // getServerAction() at runtime.
      'react-server-dom-webpack/server.node': rsdwServerPath,
      'react-server-dom-webpack/server': rsdwServerPath,
    },
  },
};

module.exports = serverConfig;
