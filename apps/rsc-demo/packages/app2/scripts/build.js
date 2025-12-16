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
const {
  getProxiedPluginState,
} = require('../../app-shared/scripts/rscPluginState');
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

class WriteSSRAdditionalDataPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync(
      'WriteSSRAdditionalDataPlugin',
      (compilation, callback) => {
        try {
          const outDir = compilation.outputOptions.path;
          const ssrManifestPath = path.join(outDir, 'react-ssr-manifest.json');
          const mfPath = path.join(outDir, 'mf-manifest.ssr.json');

          if (!fs.existsSync(ssrManifestPath) || !fs.existsSync(mfPath)) {
            callback();
            return;
          }

          const ssrManifest = JSON.parse(
            fs.readFileSync(ssrManifestPath, 'utf8')
          );
          const moduleMap = ssrManifest.moduleMap || {};
          const clientComponents = {};
          for (const [moduleId, exportsMap] of Object.entries(moduleMap)) {
            const anyExport = exportsMap['*'] || Object.values(exportsMap)[0];
            const specifier = anyExport?.specifier || moduleId;
            const ssrRequest = moduleId.replace(/^\(client\)/, '(ssr)');
            clientComponents[moduleId] = {
              moduleId,
              request: ssrRequest,
              ssrRequest,
              chunks: [],
              exports: Object.keys(exportsMap),
              filePath: specifier?.replace?.(/^file:\/\//, ''),
            };
          }

          const mf = JSON.parse(fs.readFileSync(mfPath, 'utf8'));
          mf.additionalData = mf.additionalData || {};
          mf.additionalData.rsc = {
            layer: 'ssr',
            shareScope: 'client',
            clientComponents,
          };
          fs.writeFileSync(mfPath, JSON.stringify(mf, null, 2));
        } catch (_e) {
          // best effort
        }
        callback();
      }
    );
  }
}

class AutoIncludeClientComponentsPlugin {
  apply(compiler) {
    compiler.hooks.finishMake.tapAsync(
      'AutoIncludeClientComponentsPlugin',
      async (compilation, callback) => {
        try {
          const {getEntryRuntime} = require('webpack/lib/util/runtime');
          const state = getProxiedPluginState({
            ssrModuleIds: {},
            clientComponents: {},
            ssrManifestProcessed: false,
          });
          const entries = Object.values(state.clientComponents || {});
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
            entries.map((e) => e.request || e.filePath || e.moduleId)
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
        additionalData: async ({stats, compilation}) => {
          const asset = compilation.getAsset('react-client-manifest.json');
          const clientComponents = {};
          const state = getProxiedPluginState({
            ssrModuleIds: {},
            clientComponents: {},
            ssrManifestProcessed: false,
          });

          if (asset) {
            const manifestJson = JSON.parse(asset.source.source().toString());

            for (const [filePath, entry] of Object.entries(manifestJson)) {
              const moduleId = entry.id;
              const exportName =
                entry.name && entry.name !== '*' ? entry.name : 'default';
              const ssrRequest =
                state.ssrModuleIds[moduleId] ||
                moduleId.replace(/^\(client\)/, '(ssr)');

              clientComponents[moduleId] = {
                moduleId,
                request: moduleId.replace(/^\(client\)\//, './'),
                ssrRequest,
                chunks: entry.chunks || [],
                exports: exportName ? [exportName] : [],
                filePath: filePath.replace(/^file:\/\//, ''),
              };
              state.clientComponents[moduleId] =
                state.clientComponents[moduleId] || clientComponents[moduleId];
              state.ssrModuleIds[moduleId] =
                state.ssrModuleIds[moduleId] || ssrRequest;
            }
          }

          const rscData = {
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
            clientComponents,
          };

          stats.additionalData = stats.additionalData || {};
          stats.additionalData.rsc = rscData;
          stats.rsc = rscData;
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
        additionalData: () => ({
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
        }),
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
        additionalData: ({stats, compilation}) => {
          const asset = compilation.getAsset('react-ssr-manifest.json');
          if (!asset) return stats;
          const ssrManifest = JSON.parse(asset.source.source().toString());
          const moduleMap = ssrManifest?.moduleMap || {};
          const clientComponents = {};
          for (const [moduleId, exportsMap] of Object.entries(moduleMap)) {
            const anyExport = exportsMap['*'] || Object.values(exportsMap)[0];
            const specifier = anyExport?.specifier || moduleId;
            const ssrRequest = moduleId.replace(/^\(client\)/, '(ssr)');
            clientComponents[moduleId] = {
              moduleId,
              request: ssrRequest,
              chunks: [],
              exports: Object.keys(exportsMap),
              filePath: specifier.replace(/^file:\/\//, ''),
            };
          }
          stats.additionalData = stats.additionalData || {};
          stats.additionalData.rsc = {
            layer: 'ssr',
            shareScope: 'client',
            clientComponents,
          };
          stats.rsc = stats.additionalData.rsc;
          return stats;
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
          requiredVersion: false,
          shareScope: 'client',
          layer: WEBPACK_LAYERS.ssr,
          issuerLayer: WEBPACK_LAYERS.ssr,
        },
        'react-dom': {
          singleton: true,
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
    new WriteSSRAdditionalDataPlugin(),
    // Note: SSR registry injection is handled post-build in build.js (injectSSRRegistry)
    // because ReactServerWebpackPlugin writes the manifest after webpack plugins complete.
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

function runWebpack(config) {
  return new Promise((resolve) => {
    const compiler = webpack(config);
    compiler.run((err, stats) => {
      handleStats(err, stats);
      compiler.close(() => resolve(stats));
    });
  });
}

/**
 * TODO(federation-ssr): MF SSR manifest currently omits additionalData. Patch it
 * post-build from react-ssr-manifest.json so runtimes get rsc.clientComponents
 * without string rewriting. Replace with proper MF hook when available.
 */
function patchSSRManifest() {
  const buildDir = path.resolve(__dirname, '../build');
  const ssrManifestPath = path.join(buildDir, 'react-ssr-manifest.json');
  const mfSSRPath = path.join(buildDir, 'mf-manifest.ssr.json');
  if (!fs.existsSync(ssrManifestPath) || !fs.existsSync(mfSSRPath)) return;

  try {
    const ssrManifest = JSON.parse(fs.readFileSync(ssrManifestPath, 'utf8'));
    const moduleMap = ssrManifest.moduleMap || {};
    const clientComponents = {};
    for (const [moduleId, exportsMap] of Object.entries(moduleMap)) {
      const anyExport = exportsMap['*'] || Object.values(exportsMap)[0];
      const specifier = anyExport?.specifier || moduleId;
      const ssrRequest = moduleId.replace(/^\(client\)/, '(ssr)');
      clientComponents[moduleId] = {
        moduleId,
        request: ssrRequest,
        ssrRequest,
        chunks: [],
        exports: Object.keys(exportsMap),
        filePath: specifier?.replace?.(/^file:\/\//, ''),
      };
    }
    const mf = JSON.parse(fs.readFileSync(mfSSRPath, 'utf8'));
    mf.additionalData = mf.additionalData || {};
    mf.additionalData.rsc = {
      layer: 'ssr',
      shareScope: 'client',
      clientComponents,
    };
    fs.writeFileSync(mfSSRPath, JSON.stringify(mf, null, 2));
  } catch (e) {
    console.warn('[patchSSRManifest] best-effort patch failed:', e.message);
  }
}

function patchServerRemoteGlobal() {
  const remoteEntryPath = path.resolve(
    __dirname,
    '../build/remoteEntry.server.js'
  );
  if (!fs.existsSync(remoteEntryPath)) return;
  const bridge =
    '\n;(function(){try{if(typeof globalThis!=="undefined"&&typeof module!=="undefined"&&module.exports&&!globalThis.app2){var m=module.exports;globalThis.app2=m.app2||m;}}catch(e){}})();\n';
  const contents = fs.readFileSync(remoteEntryPath, 'utf8');
  if (!contents.includes('globalThis.app2')) {
    fs.appendFileSync(remoteEntryPath, bridge);
  }
}

/**
 * Inject SSR registry into ssr.js bundle post-build.
 * This must run after compiler.run() completes because ReactServerWebpackPlugin
 * writes the manifest during the 'done' hook, which runs after our webpack plugins.
 */
function injectSSRRegistry() {
  const buildDir = path.resolve(__dirname, '../build');
  const ssrManifestPath = path.join(buildDir, 'react-ssr-manifest.json');
  const ssrPath = path.join(buildDir, 'ssr.js');
  if (!fs.existsSync(ssrManifestPath) || !fs.existsSync(ssrPath)) return;

  try {
    const ssrManifest = JSON.parse(fs.readFileSync(ssrManifestPath, 'utf8'));
    const moduleMap = ssrManifest.moduleMap || {};
    const clientComponents = {};
    for (const [moduleId, exportsMap] of Object.entries(moduleMap)) {
      const anyExport = exportsMap['*'] || Object.values(exportsMap)[0];
      const specifier = anyExport?.specifier || moduleId;
      const ssrRequest = moduleId.replace(/^\(client\)/, '(ssr)');
      clientComponents[moduleId] = {
        moduleId,
        request: ssrRequest,
        ssrRequest,
        chunks: [],
        exports: Object.keys(exportsMap),
        filePath: specifier?.replace?.(/^file:\/\//, ''),
      };
    }
    const registryCode = `globalThis.__RSC_SSR_REGISTRY_INJECTED__=${JSON.stringify(clientComponents)};`;
    const ssrContent = fs.readFileSync(ssrPath, 'utf-8');
    fs.writeFileSync(ssrPath, registryCode + '\n' + ssrContent);
  } catch (e) {
    console.warn(
      '[injectSSRRegistry] best-effort injection failed:',
      e.message
    );
  }
}

(async () => {
  await runWebpack([webpackConfig, serverConfig]);
  await runWebpack(ssrConfig);
  patchSSRManifest();
  injectSSRRegistry();
  patchServerRemoteGlobal();
})();
