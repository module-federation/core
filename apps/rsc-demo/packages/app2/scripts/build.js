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
const context = path.resolve(__dirname, '..');
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

class AutoIncludeClientComponentsPlugin {
  apply(compiler) {
    compiler.hooks.finishMake.tapAsync(
      'AutoIncludeClientComponentsPlugin',
      async (compilation, callback) => {
        try {
          const {getEntryRuntime} = require('webpack/lib/util/runtime');
          const manifestPath = path.join(
            compiler.options.output.path,
            'react-client-manifest.json'
          );
          if (!fs.existsSync(manifestPath)) return callback();

          const clientManifest = JSON.parse(
            fs.readFileSync(manifestPath, 'utf8')
          );
          const entries = Object.values(clientManifest || {});
          if (!entries.length) return callback();
          const runtime = getEntryRuntime(compilation, 'ssr');
          let SingleEntryDependency;
          try {
            // webpack >= 5.98
            SingleEntryDependency = require('webpack/lib/dependencies/SingleEntryDependency');
          } catch (_e) {
            // webpack <= 5.97
            SingleEntryDependency = require('webpack/lib/dependencies/EntryDependency');
          }
          const unique = new Set(
            entries
              .map((e) => e && e.id)
              .filter(Boolean)
              .map((moduleId) => {
                const withoutPrefix = String(moduleId).replace(
                  /^\(client\)\//,
                  ''
                );
                return withoutPrefix.startsWith('.')
                  ? withoutPrefix
                  : `./${withoutPrefix}`;
              })
          );
          const includes = [...unique].map(
            (req) =>
              new Promise((resolve, reject) => {
                const dep = new SingleEntryDependency(req);
                dep.loc = {name: 'rsc-client-include'};
                compilation.addInclude(
                  compiler.context,
                  dep,
                  {name: 'ssr'},
                  (err, mod) => {
                    if (err) return reject(err);
                    if (mod) {
                      try {
                        compilation.moduleGraph
                          .getExportsInfo(mod)
                          .setUsedInUnknownWay(runtime);
                      } catch (_e) {
                        // best effort: don't fail the build if webpack internals change
                      }
                    }
                    resolve();
                  }
                );
              })
          );
          await Promise.all(includes);
          callback();
        } catch (err) {
          callback(err);
        }
      }
    );
  }
}

// Clean build directory before starting
rimraf.sync(path.resolve(__dirname, '../build'));

// =====================================================================================
// Client bundle (browser)
// =====================================================================================
const webpackConfig = {
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
      runtime: false,
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
          exposeTypes: {
            './Button': 'client-component',
            './DemoCounterButton': 'client-component',
            './server-actions': 'server-action-stubs',
          },
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
      // CommonJS container; loaded via script remoteType on the host. Node
      // federation runtime will hydrate chunk loading for async-node target.
      library: {type: 'commonjs-module', name: 'app2'},
      runtime: false,
      experiments: {asyncStartup: true},
      manifest: {
        fileName: 'mf-manifest.server',
        rsc: {
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
        'jsx-dev-runtime.react-server.js'
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

// =====================================================================================
// SSR bundle (for server-side rendering of client components)
// =====================================================================================
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
      layer: WEBPACK_LAYERS.ssr,
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
      // Use a different filename to avoid overwriting the RSC manifest
      // SSR doesn't need server actions (they're stubs that throw errors)
      serverActionsManifestFilename: 'react-ssr-server-actions.json',
    }),
    new ModuleFederationPlugin({
      name: 'app2-ssr',
      filename: 'remoteEntry.ssr.js',
      runtime: false,
      manifest: {
        fileName: 'mf-manifest.ssr',
        rsc: {
          layer: 'ssr',
          shareScope: 'client',
        },
      },
      remotes: {
        app1: 'app1@http://localhost:4101/remoteEntry.client.js',
      },
      experiments: {asyncStartup: true},
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
    conditionNames: ['node', 'import', 'require', 'default'],
  },
};

// =====================================================================================
function handleStats(err, stats) {
  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    process.exit(1);
  }
  const info = stats.toJson();
  if (stats.hasErrors()) {
    console.log('Finished running webpack with errors.');
    info.errors.forEach((e) => console.error(e));
    process.exit(1);
  } else {
    console.log('Finished running webpack.');
  }
}

function runWebpack(config) {
  return new Promise((resolve) => {
    const compiler = webpack(config);
    compiler.run((err, stats) => {
      handleStats(err, stats);
      compiler.close(() => resolve(stats));
    });
  });
}

(async () => {
  await runWebpack([webpackConfig, serverConfig]);
  await runWebpack(ssrConfig);
})();
