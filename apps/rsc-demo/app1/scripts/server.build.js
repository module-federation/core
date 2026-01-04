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

// React 19 exports don't expose these subpaths via "exports", so resolve by file path
const reactPkgRoot = path.dirname(require.resolve('react/package.json'));
const reactServerEntry = path.join(reactPkgRoot, 'react.react-server.js');
const reactJSXServerEntry = path.join(
  reactPkgRoot,
  'jsx-runtime.react-server.js',
);
const reactJSXDevServerEntry = path.join(
  reactPkgRoot,
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

// Allow overriding remote location; default to HTTP for local dev server.
const app2RemoteUrl =
  process.env.APP2_REMOTE_URL ||
  'http://localhost:4102/mf-manifest.server.json';

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
const WORKSPACE_SHARED_ROOT = path.normalize(`${sharedRoot}${path.sep}`);

function isWorkspacePackageModule(modulePath) {
  if (typeof modulePath !== 'string' || modulePath.length === 0) return false;
  const normalized = path.normalize(modulePath.split('?')[0]);
  return WORKSPACE_PACKAGE_ROOTS.some((root) => normalized.startsWith(root));
}

/**
 * Server bundle configuration (for RSC rendering)
 *
 * This builds the RSC server entry with resolve.conditionNames: ['react-server', ...]
 * which means React packages resolve to their server versions at BUILD time.
 * No --conditions=react-server flag needed at runtime!
 */
const serverConfig = {
  context,
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
          // RSC layer for server bundle
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
          // Default to RSC layer for server bundle
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
    // Generate server actions manifest for local 'use server' modules.
    // Remote actions are registered at runtime via rscRuntimePlugin using the
    // remote's published manifest URL (mf-stats additionalData).
    new ReactServerWebpackPlugin({
      isServer: true,
    }),
    // Enable Module Federation for the RSC server bundle (app1 as a Node host).
    // This is the RSC layer, so we use a dedicated 'rsc' shareScope and
    // mark React/RSDW as rsc-layer shares.
    //
    // SERVER-SIDE FEDERATION: app1 consumes app2's RSC container for:
    // - Server components (rendered in app1's RSC stream)
    // - Client component references (serialized as $L client refs)
    //
    // MF-native server actions (default):
    // - app2 exposes './server-actions' and publishes its server actions manifest URL
    //   via mf-stats additionalData.rsc.
    // - rscRuntimePlugin loads that manifest and registers server references into the
    //   shared serverActionRegistry when the remote action module is loaded via MF.
    // - app1's Express action handler triggers that registration on-demand before
    //   resolving the action ID (fallback: HTTP forwarding).
    new ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.server.js',
      runtime: false,
      // Consume app2's RSC container via manifest.json over HTTP
      remotes: {
        app2: `app2@${app2RemoteUrl}`,
      },
      remoteType: 'script',
      experiments: {
        asyncStartup: true,
      },
      // Use a server-specific manifest name so we don't clobber the client mf-stats.json
      // (which now carries the clientComponents registry for SSR).
      manifest: {
        fileName: 'mf-manifest.server',
        rsc: {},
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
      // Initialize only the RSC share scope for server bundle to force react-server shares.
      shareScope: ['rsc'],
      shareStrategy: 'version-first',
    }),
  ],
  resolve: {
    // Server uses react-server condition for proper RSC module resolution
    conditionNames: ['react-server', 'node', 'import', 'require', 'default'],
    alias: {
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
