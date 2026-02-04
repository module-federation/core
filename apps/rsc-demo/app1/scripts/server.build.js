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
  require.resolve('@module-federation/react-server-dom-webpack/package.json'),
  '..',
  'server.node.js',
);
const rsdwServerUnbundledPath = require.resolve(
  '@module-federation/react-server-dom-webpack/server.node.unbundled',
);

// Allow overriding remote location; default to HTTP for local dev server.
const app2RemoteUrl =
  process.env.APP2_REMOTE_URL ||
  'http://localhost:4102/mf-manifest.server.json';

const context = path.resolve(__dirname, '..');
const isProduction = process.env.NODE_ENV === 'production';

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
                request !== 'react/jsx-runtime' &&
                request !== 'react/jsx-dev-runtime'
              ) {
                return;
              }
              const issuer = resolveData.contextInfo?.issuer;
              const issuerLayer = resolveData.contextInfo?.issuerLayer;
              if (!isServerComponentIssuer(issuer, issuerLayer)) return;
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

/**
 * Server bundle configuration (RSC + SSR in one compiler)
 */
const mfServerOptions = {
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
    },
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
  // Initialize both share scopes so RSC + SSR can resolve their own shares.
  shareScope: ['rsc', 'client'],
  shareStrategy: 'version-first',
};

const serverConfig = {
  context,
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  target: 'async-node',
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
    libraryTarget: 'commonjs2',
    // Allow Node federation runtime to fetch chunks over HTTP (needed for remote entry)
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
        test: /\.m?js$/,
        // Exclude node_modules EXCEPT our workspace packages
        exclude: (modulePath) => {
          if (isWorkspacePackageModule(modulePath)) return false;
          return /node_modules/.test(modulePath);
        },
        oneOf: [
          // RSC layer: Server Components
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
          // SSR layer: Server-Side Rendering
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
          // Exposed modules (via MF container compilation) may not carry layers.
          // Keep JSX parsing + react-server resolution consistent for the server
          // remoteEntry bundle.
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
    // Generate server actions manifest for local 'use server' modules.
    new ReactServerWebpackPlugin({
      isServer: true,
      layer: WEBPACK_LAYERS.rsc,
    }),
    // Generate SSR manifest for client component resolution during SSR.
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
        },
      },
    }),
  ],
  resolve: {
    // Default (SSR) resolve uses node conditions
    conditionNames: ['rsc-demo', 'node', 'require', 'default'],
    alias: {
      // CRITICAL: Force all imports of @module-federation/react-server-dom-webpack/server.node to use our
      // patched wrapper that exposes getServerAction and the shared serverActionRegistry.
      '@module-federation/react-server-dom-webpack/server.node': rsdwServerPath,
      '@module-federation/react-server-dom-webpack/server': rsdwServerPath,
      '@rsc-demo/shared$': sharedEntry,
      '@rsc-demo/shared/shared-server-actions$': sharedServerActionsEntry,
    },
  },
};

module.exports = serverConfig;
