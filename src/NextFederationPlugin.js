/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra and Zackary Jackson @ScriptedAlchemy
*/

('use strict');
import fs from "fs";
import mv from 'mv';
import path from 'path';
import {injectRuleLoader, hasLoader} from './loaders/helpers';
import {exposeNextjsPages} from './loaders/nextPageMapLoader'
import {reKeyHostShared, DEFAULT_SHARE_SCOPE, extractUrlAndGlobal} from './internal'
import StreamingTargetPlugin from '../node-plugin/streaming';
import NodeFederationPlugin from '../node-plugin/streaming/NodeRuntime';
import ChildFriendlyModuleFederationPlugin from "./ModuleFederationPlugin";

const CHILD_PLUGIN_NAME = 'ChildFederationPlugin';

class RemoveRRRuntimePlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler) {
    const webpack = compiler.webpack;

    compiler.hooks.thisCompilation.tap(
      'RemoveRRRuntimePlugin',
      (compilation) => {
        compilation.hooks.processAssets.tap(
          {
            name: 'RemoveRRRuntimePlugin',
            state: compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE,
          },
          (assets) => {
            Object.keys(assets).forEach((filename) => {
              if (filename.endsWith('.js') || filename.endsWith('.mjs')) {
                const asset = compilation.getAsset(filename);
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

//TODO: this should use webpack asset stage hooks instead to read & add additional assets to a compilation
const moveFilesToClientDirectory = (isServer, stats) => {
  if (isServer) {
    const staticDirExists = fs.existsSync(path.join(stats.compilation.options.output.path.split('/server/')[0], 'static'))
    fs.mkdirSync(path.join(stats.compilation.options.output.path.split('/server/')[0], 'ssr'));
    Object.keys(stats.compilation.assets).forEach((asset) => {
      // older versions of next.js have a different output order
      const absolutePath = path.join(stats.compilation.options.output.path, asset);

      if (!staticDirExists) {
        mv(absolutePath, path.join(stats.compilation.options.output.path.split('/server/')[0], 'ssr', asset), {mkdirp: true}, (err) => {
          if (err) {
            throw err
          }
        })
      } else {
        mv(absolutePath, path.join(stats.compilation.options.output.path.split('/server/')[0], 'static/ssr', asset), {mkdirp: true}, (err) => {
          if (err) {
            throw err
          }
        })
      }
    })
  } else {
    // would be better to add assets to complation via process assets stage api instead of manually writing to disk
    if (fs.existsSync(path.join(stats.compilation.options.output.path, 'ssr'))) {
      mv(path.join(stats.compilation.options.output.path, 'ssr'), path.join(stats.compilation.options.output.path, 'static/ssr'), {mkdirp: true}, function (err) {
        if (err) {
          throw err;
        }
      });
    }
  }
}
const computeRemoteFilename = (isServer, filename) => {
  if (isServer && filename) {
    return path.basename(filename);
  }
  return filename
}

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
    const isServer = compiler.options.name === 'server'
    compiler.hooks.thisCompilation.tap(CHILD_PLUGIN_NAME, (compilation) => {
      const buildName = this._options.name;
      const childOutput = {
        ...compiler.options.output,
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
        filename: compiler.options.output.filename.replace(
          '.js',
          '-fed.js'
        ),
      };

      const externalizedShares = Object.entries(DEFAULT_SHARE_SCOPE).reduce(
        (acc, item) => {
          const [key, value] = item;
          acc[key] = {...value, import: `data:text/javascript,module.exports = require("${key}");`};
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
          ...externalizedShares,
          ...this._options.shared,
        },
      }

      let plugins;
      if (compiler.options.name === 'client') {
        plugins = [
          new FederationPlugin(federationPluginOptions),
          new webpack.web.JsonpTemplatePlugin(childOutput),
          new LoaderTargetPlugin('web'),
          new LibraryPlugin('var'),
          new webpack.DefinePlugin({
            'process.env.REMOTES': JSON.stringify(this._options.remotes),
            'process.env.CURRENT_HOST': JSON.stringify(this._options.name),
          }),
          new AddRuntimeRequirementToPromiseExternal(),
        ]
      } else if (compiler.options.name === 'server') {
        plugins = [
          new FederationPlugin(federationPluginOptions),
          new webpack.node.NodeTemplatePlugin(childOutput),
          // new LoaderTargetPlugin('async-node'),
          new StreamingTargetPlugin(federationPluginOptions, webpack),
          new LibraryPlugin(federationPluginOptions.library.type),
          // new webpack.DefinePlugin({
          //   'process.env.REMOTES': JSON.stringify(this._options.remotes),
          //   'process.env.CURRENT_HOST': JSON.stringify(this._options.name),
          // }),
          // new AddRuntimeRequirementToPromiseExternal()
        ]
      }
      const childCompiler = compilation.createChildCompiler(
        CHILD_PLUGIN_NAME,
        childOutput,
        plugins
      );


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

      // SERVER STUFF FOR CHILD COMPILER
      if (isServer) {
        childCompiler.options.externals = [
          "next",
          { react: "react" },
          "react/jsx-runtime",
          "react/jsx-dev-runtime",
          "styled-jsx",
        ]
      }

      if (MiniCss) {
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
      delete childCompiler.options.optimization.splitChunks;
      childCompiler.outputFileSystem = compiler.outputFileSystem;
      if (compiler.options.mode === 'development') {
        childCompiler.run((err, stats) => {
          moveFilesToClientDirectory(isServer, stats)
          if (err) {
            console.error(err);
            throw new Error(err);
          }
        });
      } else {
        childCompiler.run((err, stats) => {
          moveFilesToClientDirectory(isServer, stats)

          if (err) {
            console.error(err);
            throw new Error(err);
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


function generateRemoteTemplate(url, global) {
  return `external new Promise(function (resolve, reject) {
  console.log('using browser template');
    var __webpack_error__ = new Error();
    if (typeof ${global} !== 'undefined') return resolve();
    __webpack_require__.l(
      ${JSON.stringify(url)},
      function (event) {
        if (typeof ${global} !== 'undefined') return resolve();
        var errorType = event && (event.type === 'load' ? 'missing' : event.type);
        var realSrc = event && event.target && event.target.src;
        __webpack_error__.message =
          'Loading script failed.\\n(' + errorType + ': ' + realSrc + ')';
        __webpack_error__.name = 'ScriptExternalLoadError';
        __webpack_error__.type = errorType;
        __webpack_error__.request = realSrc;
        reject(__webpack_error__);
      },
      ${JSON.stringify(global)},
    );
  }).then(function () {
    const proxy = {
      get: ${global}.get,
      init: (args) => {
        const handler = {
          get(target, prop) {
            if (target[prop]) {
              Object.values(target[prop]).forEach(function(o) {
                if(o.from === '_N_E') {
                  o.loaded = true
                }
              })
            }
            return target[prop]
          },
          set(target, property, value, receiver) {
            if (target[property]) {
              return target[property]
            }
            target[property] = value
            return true
          }
        }
        try {
          ${global}.init(new Proxy(__webpack_require__.S.default, handler))
        } catch (e) {

        }
        ${global}.__initialized = true
      }
    }
    if (!${global}.__initialized) {
      proxy.init()
    }
    return proxy
  })`;
}

function createRuntimeVariables(remotes) {
  return Object.entries(remotes).reduce((acc, remote) => {
    // handle promise new promise and external new promise
    acc[remote[0]] = remote[1].replace('promise ', '').replace('external ','')
    return acc;
  }, {});
}


class NextFederationPlugin {
  constructor(options) {
    const {extraOptions, ...mainOpts} = options;
    this._options = mainOpts;
    this._extraOptions = extraOptions;
  }

  apply(compiler) {
    compiler.options.devtool = false;
    const webpack = compiler.webpack;
    if (compiler.options.name === 'server') {
      compiler.options.target = false;
      new StreamingTargetPlugin(this._options, webpack).apply(compiler)
      this._options.library = {};
      this._options.library.type = 'commonjs-module';
      this._options.library.name = this._options.name
      // output remote to ssr if server
      this._options.filename = this._options.filename.replace('/chunks', '/ssr')
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
      server: NodeFederationPlugin
    }[compiler.options.name]
    // ignore edge runtime and middleware builds
    if (ModuleFederationPlugin) {
      const hostFederationPluginOptions = {
        ...this._options,
        exposes: {},
        shared: {
          noop: {
            import: 'data:text/javascript,module.exports = {};',
            requiredVersion: false,
            version: '0',
          },
          ...reKeyHostShared(this._options.shared),
        },
      }

      compiler.options.output.chunkFilename = compiler.options.output.chunkFilename.replace(
        '.js',
        '-[chunkhash].js'
      ),
        //   compiler.options.output.filename = compiler.options.output.filename.replace(
        //   '.js',
        //   '-[contenthash].js'
        // ),
        compiler.options.optimization.chunkIds = 'named'

      new ModuleFederationPlugin(hostFederationPluginOptions, {ModuleFederationPlugin}).apply(compiler);
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
