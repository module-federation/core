/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Zackary Jackson @ScriptedAlchemy
*/
'use strict';

import fs from 'fs';
import path from 'path';
import { injectRuleLoader, hasLoader } from './loaders/helpers';
import { exposeNextjsPages } from './loaders/nextPageMapLoader';
import {
  reKeyHostShared,
  DEFAULT_SHARE_SCOPE,
  extractUrlAndGlobal,
  generateRemoteTemplate,
  internalizeSharedPackages,
  getOutputPath,
} from './internal';
import StreamingTargetPlugin from '../node-plugin/streaming';
import NodeFederationPlugin from '../node-plugin/streaming/NodeRuntime';
import ChildFriendlyModuleFederationPlugin from './ModuleFederationPlugin';

const CHILD_PLUGIN_NAME = 'ChildFederationPlugin';

class RemoveRRRuntimePlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler) {
    const webpack = compiler.webpack;
    // only impacts dev mode - dont waste the memory during prod build
    if (compiler.options.mode === 'development') {
      compiler.hooks.thisCompilation.tap(
        'RemoveRRRuntimePlugin',
        (compilation) => {
          compilation.hooks.processAssets.tap(
            {
              name: 'RemoveRRRuntimePlugin',
              state:
                compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE,
            },
            (assets) => {
              //can this be improved? I need react refresh not to cause global collision in dev mode
              Object.keys(assets).forEach((filename) => {
                if (filename.endsWith('.js') || filename.endsWith('.mjs')) {
                  const asset = compilation.getAsset(filename);
                  // easiest way to solve it is to prevent react refresh helpers from running when its a federated module chunk
                  const newSource = asset.source
                    .source()
                    .replace(/RefreshHelpers/g, 'NoExist');
                  const updatedAsset = new webpack.sources.RawSource(newSource);

                  if (asset) {
                    compilation.updateAsset(filename, updatedAsset);
                  } else {
                    compilation.emitAsset(filename, updatedAsset);
                  }
                }
              });
            }
          );
        }
      );
    }
  }
}

const computeRemoteFilename = (isServer, filename) => {
  if (isServer && filename) {
    return path.basename(filename);
  }
  return filename;
};
const childCompilers = {};
class ChildFederation {
  constructor(options, extraOptions = {}) {
    this._options = options;
    this._extraOptions = extraOptions;
  }

  apply(compiler) {
    const webpack = compiler.webpack;
    const LibraryPlugin = webpack.library.EnableLibraryPlugin;
    const LoaderTargetPlugin = webpack.LoaderTargetPlugin;
    const NodeTargetPlugin = webpack.node.NodeTargetPlugin;
    const library = compiler.options.output.library;
    const isServer = compiler.options.name === 'server';
    const isDev = compiler.options.mode === 'development';
    let outputPath;
    if (isDev && isServer) {
      outputPath = path.join(getOutputPath(compiler), 'static/ssr');
    } else {
      if (isServer) {
        outputPath = path.join(getOutputPath(compiler), 'static/ssr');
      } else {
        outputPath = compiler.options.output.path;
      }
    }

    compiler.hooks.thisCompilation.tap(CHILD_PLUGIN_NAME, (compilation) => {
      const buildName = this._options.name;
      const childOutput = {
        ...compiler.options.output,
        path: outputPath,
        // path: deriveOutputPath(isServer, compiler.options.output.path),
        publicPath: 'auto',
        chunkLoadingGlobal: buildName + 'chunkLoader',
        uniqueName: buildName,
        library: {
          name: buildName,
          type: library.type,
        },
        chunkFilename: compiler.options.output.chunkFilename.replace(
          '.js',
          '-fed.js'
        ),
        filename: compiler.options.output.filename.replace('.js', '-fed.js'),
      };

      const externalizedShares = Object.entries(DEFAULT_SHARE_SCOPE).reduce(
        (acc, item) => {
          const [key, value] = item;
          acc[key] = { ...value, import: false };
          if (key === 'react/jsx-runtime') {
            delete acc[key].import;
          }
          return acc;
        },
        {}
      );

      const FederationPlugin = ChildFriendlyModuleFederationPlugin;

      const federationPluginOptions = {
        // library: {type: 'var', name: buildName},
        ...this._options,
        filename: computeRemoteFilename(isServer, this._options.filename),
        exposes: {
          ...this._options.exposes,
          ...(this._extraOptions.exposePages
            ? exposeNextjsPages(compiler.options.context)
            : {}),
        },
        runtime: false,
        shared: {
          ...(this._extraOptions.skipSharingNextInternals
            ? {}
            : externalizedShares),
          ...this._options.shared,
        },
      };

      let plugins;
      if (compiler.options.name === 'client') {
        plugins = [
          new FederationPlugin(federationPluginOptions),
          new webpack.web.JsonpTemplatePlugin(childOutput),
          new LoaderTargetPlugin('web'),
          new LibraryPlugin('var'),
          new webpack.DefinePlugin({
            'process.env.REMOTES': createRuntimeVariables(
              this._options.remotes
            ),
            'process.env.CURRENT_HOST': JSON.stringify(this._options.name),
          }),
          new AddRuntimeRequirementToPromiseExternal(),
        ];
      } else if (compiler.options.name === 'server') {
        plugins = [
          new FederationPlugin(federationPluginOptions),
          new webpack.node.NodeTemplatePlugin(childOutput),
          //TODO: Externals function needs to internalize any shared module for host and remote build
          new webpack.ExternalsPlugin(compiler.options.externalsType, [
            // next dynamic needs to be within webpack, cannot be externalized
            ...Object.keys(DEFAULT_SHARE_SCOPE).filter(
              (k) => k !== 'next/dynamic'
            ),
            'react/jsx-runtime',
            'react/jsx-dev-runtime',
          ]),
          // new LoaderTargetPlugin('async-node'),
          new StreamingTargetPlugin(federationPluginOptions, webpack),
          new LibraryPlugin(federationPluginOptions.library.type),
          // new webpack.DefinePlugin({
          //   'process.env.REMOTES': JSON.stringify(this._options.remotes),
          //   'process.env.CURRENT_HOST': JSON.stringify(this._options.name),
          // }),
          new AddRuntimeRequirementToPromiseExternal(),
        ];
      }
      const childCompiler = compilation.createChildCompiler(
        CHILD_PLUGIN_NAME,
        childOutput,
        plugins
      );

      childCompiler.outputPath = outputPath;

      new RemoveRRRuntimePlugin().apply(childCompiler);

      childCompiler.options.module.rules.forEach((rule) => {
        // next-image-loader fix which adds remote's hostname to the assets url
        if (
          this._extraOptions.enableImageLoaderFix &&
          hasLoader(rule, 'next-image-loader')
        ) {
          injectRuleLoader(rule, {
            loader: path.resolve(__dirname, './loaders/fixImageLoader.js'),
          });
        }

        // url-loader fix for which adds remote's hostname to the assets url
        if (
          this._extraOptions.enableUrlLoaderFix &&
          hasLoader(rule, 'url-loader')
        ) {
          injectRuleLoader({
            loader: path.resolve(__dirname, './loaders/fixUrlLoader.js'),
          });
        }
      });

      const MiniCss = childCompiler.options.plugins.find((p) => {
        return p.constructor.name === 'NextMiniCssExtractPlugin';
      });

      const removePlugins = [
        'NextJsRequireCacheHotReloader',
        'BuildManifestPlugin',
        'WellKnownErrorsPlugin',
        'WebpackBuildEventsPlugin',
        'HotModuleReplacementPlugin',
        'NextMiniCssExtractPlugin',
        'NextFederationPlugin',
        'CopyFilePlugin',
        'ProfilingPlugin',
        'DropClientPage',
        'ReactFreshWebpackPlugin',
      ];

      childCompiler.options.plugins = childCompiler.options.plugins.filter(
        (plugin) => !removePlugins.includes(plugin.constructor.name)
      );

      if (MiniCss) {
        // grab mini-css and reconfigure it to avoid conflicts with host
        new MiniCss.constructor({
          ...MiniCss.options,
          filename: MiniCss.options.filename.replace('.css', '-fed.css'),
          chunkFilename: MiniCss.options.chunkFilename.replace(
            '.css',
            '-fed.css'
          ),
        }).apply(childCompiler);
      }

      childCompiler.options.experiments.lazyCompilation = false;
      childCompiler.options.optimization.runtimeChunk = false;
      // no custom chunk splitting should be derived from host (next)
      delete childCompiler.options.optimization.splitChunks;
      childCompiler.outputFileSystem = fs;

      // TODO: this can likely be deleted now, if running server child compiler under client is the best way to go
      // help wanted for all asset pipeline stuff below
      // let childAssets
      // if (isServer) {
      //   childAssets = new Promise((resolve) => {
      //     childCompiler.hooks.afterEmit.tap(
      //       CHILD_PLUGIN_NAME,
      //       (childCompilation) => {
      //         console.log('after emit assets server');
      //         resolve(childCompilation.assets);
      //       }
      //     );
      //   });
      // } else {
      //   if(isDev) {
      //     childAssets = new Promise((resolve) => {
      //       childCompiler.hooks.afterEmit.tap(
      //         CHILD_PLUGIN_NAME,
      //         (childCompilation) => {
      //           resolve(childCompilation.assets);
      //         }
      //       );
      //     });
      //
      //   } else {
      //
      //       TODO: improve this
      //       childAssets = new Promise((resolve, reject) => {
      //         fs.readdir(
      //           path.join(childCompiler.context, '.next/ssr'),
      //           function (err, files) {
      //             if (err) {
      //               reject('Unable to scan directory: ' + err);
      //               return;
      //             }
      //
      //             const allFiles = files.map(function (file) {
      //               return new Promise((res, rej) => {
      //                 fs.readFile(
      //                   path.join(childCompiler.context, '.next/ssr', file),
      //                   (err, data) => {
      //                     if (err) rej(err);
      //                     compilation.assets[path.join('static/ssr', file)] = new compiler.webpack.sources.RawSource(data)
      //                     res();
      //                   }
      //                 );
      //               });
      //             });
      //             Promise.all(allFiles).then(resolve).catch(reject)
      //           }
      //         );
      //       });
      //   }
      // }
      // on main compiler add extra assets from server output to browser build
      // compilation.hooks.additionalAssets.tapPromise(CHILD_PLUGIN_NAME, () => {
      //   console.log('additional hooks', compiler.options.name);
      //   console.log('in additional assets hook for main build');
      //   return childAssets
      // });

      // cache the serer compiler instance, we will run the server child compiler during the client main compilation
      // we need to do this because i need access to data from the client build to inject into the server build
      // in prod builds, server build runs first, followed by client build
      // in dev, client build runs first, followed by server build
      childCompilers[compiler.options.name] = childCompiler;

      if (isDev) {
        // in dev, run the compilers in the order they are created (client, server)
        childCompiler.run((err, stats) => {
          if (err) {
            console.error(err);
            throw err;
          }
        });
        // in prod, if client
      } else if (!isServer) {
        //wrong hook for this
        // add hook for additional assets to prevent compile from sealing.
        compilation.hooks.additionalAssets.tapPromise(CHILD_PLUGIN_NAME, () => {
          return new Promise((res, rej) => {
            // run server child compilation during client main compilation
            childCompilers['server'].run((err) => {
              if (err) rej(err);
              res();
            });
          });
        });
        // run client child compiler like normal
        childCompiler.run((err, stats) => {
          if (err) {
            console.error(err);
            throw err;
          }
        });
      }
    });
  }
}

class AddRuntimeRequirementToPromiseExternal {
  apply(compiler) {
    compiler.hooks.compilation.tap(
      'AddRuntimeRequirementToPromiseExternal',
      (compilation) => {
        const RuntimeGlobals = compiler.webpack.RuntimeGlobals;
        // if (compilation.outputOptions.trustedTypes) {
        compilation.hooks.additionalModuleRuntimeRequirements.tap(
          'AddRuntimeRequirementToPromiseExternal',
          (module, set, context) => {
            if (module.externalType === 'promise') {
              set.add(RuntimeGlobals.loadScript);
              set.add(RuntimeGlobals.require);
            }
          }
        );
        // }
      }
    );
  }
}

function createRuntimeVariables(remotes) {
  return Object.entries(remotes).reduce((acc, remote) => {
    // handle promise new promise and external new promise
    if (remote[1].startsWith('promise ') || remote[1].startsWith('external ')) {
      const promiseCall = remote[1]
        .replace('promise ', '')
        .replace('external ', '');
      acc[remote[0]] = `function() {
        return ${promiseCall}
      }`;
      return acc;
    }
    // if somehow its just the @ syntax or something else, pass it through
    acc[remote[0]] = remote[1];
    return acc;
  }, {});
}

class NextFederationPlugin {
  constructor(options) {
    const { extraOptions, ...mainOpts } = options;
    this._options = mainOpts;
    this._extraOptions = extraOptions;
  }

  apply(compiler) {
    const isServer = compiler.options.name === 'server';
    const webpack = compiler.webpack;
    if (compiler.options.name === 'server') {
      // target false because we use our own target for node env
      compiler.options.target = false;
      new StreamingTargetPlugin(this._options, webpack).apply(compiler);
      this._options.library = {};
      this._options.library.type = 'commonjs-module';
      this._options.library.name = this._options.name;
      // output remote to ssr if server
      this._options.filename = this._options.filename.replace(
        '/chunks',
        '/ssr'
      );

      // should this be a plugin that we apply to the compiler?
      internalizeSharedPackages(this._options, compiler);
    } else {
      if (this._options.remotes) {
        const parsedRemotes = Object.entries(this._options.remotes).reduce(
          (acc, remote) => {
            if (remote[1].includes('@')) {
              const [url, global] = extractUrlAndGlobal(remote[1]);
              acc[remote[0]] = generateRemoteTemplate(url, global);
              return acc;
            }
            acc[remote[0]] = remote[1];
            return acc;
          },
          {}
        );
        this._options.remotes = parsedRemotes;
      }
    }

    const ModuleFederationPlugin = {
      client: webpack.container.ModuleFederationPlugin,
      server: NodeFederationPlugin,
    }[compiler.options.name];
    // ignore edge runtime and middleware builds
    if (ModuleFederationPlugin) {
      const internalShare = reKeyHostShared(this._options.shared);
      const hostFederationPluginOptions = {
        ...this._options,
        exposes: {},
        shared: {
          noop: {
            import: 'data:text/javascript,module.exports = {};',
            requiredVersion: false,
            eager: true,
            version: '0',
          },
          ...internalShare,
        },
      };

      // compiler.options.output.chunkFilename = compiler.options.output.chunkFilename.replace(
      //     '.js',
      //     '-[chunkhash].js'
      //   )
      //   compiler.options.output.filename = compiler.options.output.filename.replace(
      //   '.js',
      //   '-[contenthash].js'
      // ),
      compiler.options.optimization.chunkIds = 'named';

      new ModuleFederationPlugin(hostFederationPluginOptions, {
        ModuleFederationPlugin,
      }).apply(compiler);
      //todo runtime variable creation needs to be applied for server and client builds
      new webpack.DefinePlugin({
        'process.env.REMOTES': createRuntimeVariables(this._options.remotes),
        'process.env.CURRENT_HOST': JSON.stringify(this._options.name),
      }).apply(compiler);
      new ChildFederation(this._options, this._extraOptions).apply(compiler);
      new AddRuntimeRequirementToPromiseExternal().apply(compiler);
    }
  }
}

module.exports = NextFederationPlugin;
