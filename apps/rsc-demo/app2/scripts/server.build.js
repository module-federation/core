'use strict';

const path = require('path');
const ReactServerWebpackPlugin = require('@module-federation/react-server-dom-webpack/plugin');
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/webpack');
const resolvePluginExport = (mod) => (mod && mod.default ? mod.default : mod);
const ServerActionsBootstrapPlugin = resolvePluginExport(
  require('@module-federation/rsc/webpack/ServerActionsBootstrapPlugin'),
);
const AutoIncludeClientComponentsPlugin = resolvePluginExport(
  require('@module-federation/rsc/webpack/AutoIncludeClientComponentsPlugin'),
);
const ExtraFederationManifestPlugin = resolvePluginExport(
  require('@module-federation/rsc/webpack/ExtraFederationManifestPlugin'),
);
const {
  WEBPACK_LAYERS,
  babelLoader,
} = require('@module-federation/rsc/webpack/webpackShared');

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
  require.resolve('@module-federation/react-server-dom-webpack/package.json'),
  '..',
  'server.node.js',
);
const rsdwServerUnbundledPath = require.resolve(
  '@module-federation/react-server-dom-webpack/server.node.unbundled',
);

const isProduction = process.env.NODE_ENV === 'production';
const app2GetPublicPath =
  "const base=(typeof window!=='undefined'&&window.location?window.location.origin:(typeof process!=='undefined'&&process.env&&(process.env.APP2_BASE_URL||process.env.RSC_API_ORIGIN))||'http://localhost:4001');return base.endsWith('/')?base:base+'/'";
const ACTION_HEADER = 'next-action';
const ACTION_HEADER_FALLBACK = 'rsc-action';
const ROUTER_STATE_HEADER = 'next-router-state-tree';
const ACTIONS_ENDPOINT_PATH = '/react';

const rscTransportMetadata = {
  actionHeader: ACTION_HEADER,
  actionHeaderFallback: ACTION_HEADER_FALLBACK,
  routerStateHeader: ROUTER_STATE_HEADER,
  actionsEndpointPath: ACTIONS_ENDPOINT_PATH,
};

const appSharedRoot = path.dirname(
  require.resolve('@rsc-demo/framework/package.json'),
);
const sharedRoot = path.dirname(
  require.resolve('@rsc-demo/shared/package.json'),
);
const sharedEntry = path.join(sharedRoot, 'src/index.js');
const sharedServerActionsEntry = path.join(
  sharedRoot,
  'src/shared-server-actions.js',
);
const WORKSPACE_PACKAGE_ROOTS = [appSharedRoot, sharedRoot].map((p) =>
  path.normalize(`${p}${path.sep}`),
);
const WORKSPACE_SHARED_ROOT = path.normalize(`${sharedRoot}${path.sep}`);
const SERVER_COMPONENT_REGEX = /\.server\.[mc]?js$/;
const REACT_SERVER_RUNTIME_REGEX =
  /react-(jsx|jsx-dev)-runtime\.react-server|react-dom\.react-server|react\.react-server/;

function isWorkspacePackageModule(modulePath) {
  if (typeof modulePath !== 'string' || modulePath.length === 0) return false;
  const normalized = path.normalize(modulePath.split('?')[0]);
  return WORKSPACE_PACKAGE_ROOTS.some((root) => normalized.startsWith(root));
}

function isServerComponentIssuer(issuer, issuerLayer) {
  if (issuerLayer === WEBPACK_LAYERS.rsc) return true;
  if (typeof issuer !== 'string') return false;
  return SERVER_COMPONENT_REGEX.test(issuer);
}

function isReactServerRuntimeIssuer(issuer) {
  if (typeof issuer !== 'string') return false;
  return REACT_SERVER_RUNTIME_REGEX.test(issuer);
}

function shouldUseReactServerAliases(issuer, issuerLayer) {
  return (
    isServerComponentIssuer(issuer, issuerLayer) ||
    isReactServerRuntimeIssuer(issuer)
  );
}

function reactServerRuntimeAliasPlugin() {
  return {
    apply(compiler) {
      compiler.hooks.normalModuleFactory.tap(
        'ReactServerRuntimeAliasPlugin',
        (nmf) => {
          nmf.hooks.beforeResolve.tap(
            'ReactServerRuntimeAliasPlugin',
            (resolveData) => {
              if (!resolveData) return;
              const request = resolveData.request;
              if (
                request !== 'react' &&
                request !== 'react/jsx-runtime' &&
                request !== 'react/jsx-dev-runtime'
              ) {
                return;
              }
              const issuer = resolveData.contextInfo?.issuer;
              const issuerLayer = resolveData.contextInfo?.issuerLayer;
              if (!shouldUseReactServerAliases(issuer, issuerLayer)) return;
              if (request === 'react') {
                resolveData.request = reactServerEntry;
                return;
              }
              resolveData.request =
                request === 'react/jsx-runtime'
                  ? reactJSXServerEntry
                  : reactJSXDevServerEntry;
            },
          );
        },
      );
    },
  };
}

// =====================================================================================
// Server bundle (RSC + SSR in one compiler)
// =====================================================================================
const mfServerOptions = {
  dts: false,
  name: 'app2',
  filename: 'remoteEntry.server.js',
  // CommonJS container; loaded via script remoteType on the host. Node
  // federation runtime will hydrate chunk loading for async-node target.
  library: { type: 'commonjs-module', name: 'app2' },
  runtime: false,
  getPublicPath: app2GetPublicPath,
  experiments: { asyncStartup: true },
  remoteType: 'script',
  manifest: {
    fileName: 'mf-manifest.server',
    rsc: {
      layer: WEBPACK_LAYERS.rsc,
      shareScope: 'rsc',
      conditionNames: [
        'react-server',
        'rsc-demo',
        'node',
        'require',
        'default',
      ],
      ssrManifest: 'mf-manifest.ssr.json',
      ...rscTransportMetadata,
    },
  },
  exposes: {
    './RemoteServerWidget': './src/RemoteServerWidget.server.js',
    './server-actions': './src/server-actions.js',
  },
  // Bidirectional demo: app2 consumes app1's server manifest for HostBadge.
  remotes: {
    app1: 'app1@http://localhost:4101/mf-manifest.server.json',
  },
  runtimePlugins: [
    require.resolve('@module-federation/node/runtimePlugin'),
    require.resolve('@module-federation/rsc/runtime/rscRuntimePlugin.js'),
    require.resolve('@module-federation/rsc/runtime/rscSSRRuntimePlugin.js'),
  ],
  shared: [
    {
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
    },
    {
      react: {
        singleton: true,
        eager: false,
        requiredVersion: false,
        shareScope: 'client',
        layer: WEBPACK_LAYERS.ssr,
        issuerLayer: WEBPACK_LAYERS.ssr,
        allowNodeModulesSuffixMatch: true,
      },
    },
    {
      'react-dom': {
        singleton: true,
        eager: false,
        requiredVersion: false,
        shareScope: 'rsc',
        layer: WEBPACK_LAYERS.rsc,
        issuerLayer: WEBPACK_LAYERS.rsc,
        allowNodeModulesSuffixMatch: true,
      },
    },
    {
      'react-dom': {
        singleton: true,
        eager: false,
        requiredVersion: false,
        shareScope: 'client',
        layer: WEBPACK_LAYERS.ssr,
        issuerLayer: WEBPACK_LAYERS.ssr,
        allowNodeModulesSuffixMatch: true,
      },
    },
    {
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
    },
    {
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
    },
    {
      '@module-federation/react-server-dom-webpack': {
        singleton: true,
        eager: false,
        requiredVersion: false,
        shareScope: 'rsc',
        layer: WEBPACK_LAYERS.rsc,
        issuerLayer: WEBPACK_LAYERS.rsc,
      },
    },
    {
      '@module-federation/react-server-dom-webpack/server': {
        // Match require('@module-federation/react-server-dom-webpack/server') if any code uses it
        import: rsdwServerPath,
        eager: false,
        requiredVersion: false,
        singleton: true,
        shareScope: 'rsc',
        layer: WEBPACK_LAYERS.rsc,
        issuerLayer: WEBPACK_LAYERS.rsc,
      },
    },
    {
      '@module-federation/react-server-dom-webpack/server.node': {
        // The rsc-server-loader emits require('@module-federation/react-server-dom-webpack/server.node')
        // This resolves it to the correct server writer (no --conditions flag needed)
        import: rsdwServerPath,
        eager: false,
        requiredVersion: false,
        singleton: true,
        shareScope: 'rsc',
        layer: WEBPACK_LAYERS.rsc,
        issuerLayer: WEBPACK_LAYERS.rsc,
      },
    },
    {
      '@module-federation/react-server-dom-webpack/server.node.unbundled': {
        import: rsdwServerUnbundledPath,
        eager: false,
        requiredVersion: false,
        singleton: true,
        shareScope: 'rsc',
        layer: WEBPACK_LAYERS.rsc,
        issuerLayer: WEBPACK_LAYERS.rsc,
      },
    },
    {
      '@rsc-demo/shared': {
        import: path.join(sharedRoot, 'src/index.js'),
        singleton: true,
        eager: false,
        requiredVersion: false,
        shareScope: 'rsc',
        layer: WEBPACK_LAYERS.rsc,
        issuerLayer: WEBPACK_LAYERS.rsc,
      },
    },
  ],
  // Server bundle should initialize both share scopes.
  shareScope: ['rsc', 'client'],
  shareStrategy: 'version-first',
};

const serverConfig = {
  context,
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? false : 'cheap-module-source-map',
  target: 'async-node', // allows HTTP chunk loading for node MF runtime
  node: {
    // Use real __dirname so ssr-entry.js can find mf-manifest.json at runtime
    __dirname: false,
  },
  entry: {
    server: {
      import: path.resolve(__dirname, '../src/server-entry.js'),
      layer: WEBPACK_LAYERS.rsc,
      filename: 'server.rsc.js',
    },
    ssr: {
      import: '@rsc-demo/framework/ssr-entry',
      layer: WEBPACK_LAYERS.ssr,
      filename: 'ssr.js',
    },
  },
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: '[name].js',
    // Avoid clobbering client chunk filenames when builds share the same output dir.
    chunkFilename: 'server/[name].js',
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
    concatenateModules: false,
  },
  experiments: { layers: true },
  module: {
    rules: [
      // Ensure React server exports are resolved for all RSC-issuer modules,
      // including node_modules like react/jsx-runtime.react-server.js.
      {
        test: /\.m?js$/,
        issuerLayer: WEBPACK_LAYERS.rsc,
        resolve: {
          conditionNames: [
            'react-server',
            'rsc-demo',
            'node',
            'require',
            'default',
          ],
          alias: {
            react: reactServerEntry,
            'react/jsx-runtime': reactJSXServerEntry,
            'react/jsx-dev-runtime': reactJSXDevServerEntry,
          },
        },
      },
      {
        test: /\.m?js$/,
        issuer: SERVER_COMPONENT_REGEX,
        resolve: {
          conditionNames: [
            'react-server',
            'rsc-demo',
            'node',
            'require',
            'default',
          ],
          alias: {
            react: reactServerEntry,
            'react/jsx-runtime': reactJSXServerEntry,
            'react/jsx-dev-runtime': reactJSXDevServerEntry,
          },
        },
      },
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
        test: /\.m?js$/,
        // Exclude node_modules EXCEPT our workspace packages
        exclude: (modulePath) => {
          if (isWorkspacePackageModule(modulePath)) return false;
          return /node_modules/.test(modulePath);
        },
        oneOf: [
          {
            issuerLayer: WEBPACK_LAYERS.rsc,
            layer: WEBPACK_LAYERS.rsc,
            resolve: {
              conditionNames: [
                'react-server',
                'rsc-demo',
                'node',
                'require',
                'default',
              ],
              alias: {
                react: reactServerEntry,
                'react/jsx-runtime': reactJSXServerEntry,
                'react/jsx-dev-runtime': reactJSXDevServerEntry,
              },
            },
            use: [
              babelLoader,
              {
                loader: require.resolve(
                  '@module-federation/react-server-dom-webpack/rsc-server-loader',
                ),
              },
            ],
          },
          {
            issuerLayer: WEBPACK_LAYERS.ssr,
            layer: WEBPACK_LAYERS.ssr,
            resolve: {
              conditionNames: ['rsc-demo', 'node', 'require', 'default'],
            },
            use: [
              babelLoader,
              {
                loader: require.resolve(
                  '@module-federation/react-server-dom-webpack/rsc-ssr-loader',
                ),
              },
            ],
          },
          // Exposed modules (via MF container compilation) often don't carry a
          // webpack layer/issuerLayer. Ensure JSX parses and server components
          // resolve React via the react-server condition when bundled into the
          // server remoteEntry.
          {
            resolve: {
              conditionNames: [
                'react-server',
                'rsc-demo',
                'node',
                'require',
                'default',
              ],
              alias: {
                react: reactServerEntry,
                'react/jsx-runtime': reactJSXServerEntry,
                'react/jsx-dev-runtime': reactJSXDevServerEntry,
              },
            },
            use: [babelLoader],
          },
        ],
      },
      { test: /\.css$/, use: ['null-loader'] },
    ],
  },
  plugins: [
    reactServerRuntimeAliasPlugin(),
    // Ensure all 'use server' modules referenced by client code are bundled and
    // executed on startup so registerServerReference() runs.
    new ServerActionsBootstrapPlugin({
      entryName: 'server',
    }),
    new ReactServerWebpackPlugin({
      isServer: true,
      layer: WEBPACK_LAYERS.rsc,
    }),
    new ReactServerWebpackPlugin({
      isServer: false,
      layer: WEBPACK_LAYERS.ssr,
      clientManifestFilename: null,
      serverConsumerManifestFilename: 'react-ssr-manifest.json',
    }),
    new AutoIncludeClientComponentsPlugin({ entryName: 'ssr' }),
    new ModuleFederationPlugin(mfServerOptions),
    new ExtraFederationManifestPlugin({
      mfOptions: mfServerOptions,
      manifest: {
        fileName: 'mf-manifest.ssr',
        rsc: {
          layer: WEBPACK_LAYERS.ssr,
          shareScope: 'client',
          conditionNames: ['rsc-demo', 'node', 'require', 'default'],
          isRSC: false,
          ...rscTransportMetadata,
        },
      },
    }),
  ],
  resolve: {
    conditionNames: ['rsc-demo', 'node', 'require', 'default'],
    alias: {
      // CRITICAL: Force all imports of @module-federation/react-server-dom-webpack/server.node to use our
      // patched wrapper that exposes getServerAction and the shared serverActionRegistry.
      '@module-federation/react-server-dom-webpack/server.node': rsdwServerPath,
      '@module-federation/react-server-dom-webpack/server': rsdwServerPath,
      'react/jsx-runtime': reactJSXServerEntry,
      'react/jsx-dev-runtime': reactJSXDevServerEntry,
      '@rsc-demo/shared$': sharedEntry,
      '@rsc-demo/shared/shared-server-actions$': sharedServerActionsEntry,
    },
  },
};

module.exports = serverConfig;
