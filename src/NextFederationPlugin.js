('use strict');

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Zackary Jackson @ScriptedAlchemy
*/

import path from 'path';
import { injectRuleLoader, hasLoader } from './loaders/helpers';
import { exposeNextjsPages } from './loaders/nextPageMapLoader';
const CHILD_PLUGIN_NAME = 'ChildFederationPlugin';

/** @typedef {import("../../declarations/plugins/container/ModuleFederationPlugin").ExternalsType} ExternalsType */
/** @typedef {import("../../declarations/plugins/container/ModuleFederationPlugin").ModuleFederationPluginOptions} ModuleFederationPluginOptions */

/** @typedef {import("webpack").Shared} Shared */
/** @typedef {import("webpack").Compiler} Compiler */

class ModuleFederationPlugin {
  /**
   * @param {ModuleFederationPluginOptions} options options
   */
  constructor(options) {
    this._options = options;
  }

  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler) {
    const { _options: options } = this;
    const webpack = compiler.webpack;
    const { ContainerPlugin, ContainerReferencePlugin } = webpack.container;
    const { SharePlugin } = webpack.sharing;
    const library = options.library || { type: 'var', name: options.name };
    const remoteType =
      options.remoteType ||
      (options.library && /** @type {ExternalsType} */ options.library.type) ||
      'script';
    if (
      library &&
      !compiler.options.output.enabledLibraryTypes.includes(library.type)
    ) {
      compiler.options.output.enabledLibraryTypes.push(library.type);
    }

    if (
      options.exposes &&
      (Array.isArray(options.exposes)
        ? options.exposes.length > 0
        : Object.keys(options.exposes).length > 0)
    ) {
      new ContainerPlugin({
        name: options.name,
        library,
        filename: options.filename,
        runtime: options.runtime,
        exposes: options.exposes,
      }).apply(compiler);
    }
    if (
      options.remotes &&
      (Array.isArray(options.remotes)
        ? options.remotes.length > 0
        : Object.keys(options.remotes).length > 0)
    ) {
      new ContainerReferencePlugin({
        remoteType,
        remotes: options.remotes,
      }).apply(compiler);
    }
    if (options.shared) {
      new SharePlugin({
        shared: options.shared,
        shareScope: options.shareScope,
      }).apply(compiler);
    }
  }
}

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

const DEFAULT_SHARE_SCOPE = {
  react: {
    singleton: true,
    requiredVersion: false,
  },
  'react/jsx-runtime': {
    singleton: true,
    requiredVersion: false,
  },
  'react-dom': {
    singleton: true,
    requiredVersion: false,
  },
  'next/dynamic': {
    requiredVersion: false,
    singleton: true,
  },
  'styled-jsx': {
    requiredVersion: false,
    singleton: true,
  },
  'next/link': {
    requiredVersion: false,
    singleton: true,
  },
  'next/router': {
    requiredVersion: false,
    singleton: true,
  },
  'next/script': {
    requiredVersion: false,
    singleton: true,
  },
  'next/head': {
    requiredVersion: false,
    singleton: true,
  },
};

class ChildFederation {
  constructor(options, extraOptions = {}) {
    this._options = options;
    this._extraOptions = extraOptions;
  }

  apply(compiler) {
    const webpack = compiler.webpack;
    const EntryPlugin = webpack.EntryPlugin;
    const LibraryPlugin = webpack.library.EnableLibraryPlugin;
    const MFP = webpack.container.ModuleFederationPlugin;
    const ContainerPlugin = webpack.container.ContainerPlugin;
    const LoaderTargetPlugin = webpack.LoaderTargetPlugin;
    const library = compiler.options.output.library;

    compiler.hooks.thisCompilation.tap(CHILD_PLUGIN_NAME, (compilation) => {
      const buildName = this._options.name;
      const childOutput = {
        ...compiler.options.output,
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
        filename: compiler.options.output.chunkFilename.replace(
          '.js',
          '-fed.js'
        ),
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
      const childCompiler = compilation.createChildCompiler(
        CHILD_PLUGIN_NAME,
        childOutput,
        [
          new ModuleFederationPlugin({
            // library: {type: 'var', name: buildName},
            ...this._options,
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
          }),
          new webpack.web.JsonpTemplatePlugin(childOutput),
          new LoaderTargetPlugin('web'),
          new LibraryPlugin(this._options.library.type),
          new webpack.DefinePlugin({
            'process.env.REMOTES': JSON.stringify(this._options.remotes),
            'process.env.CURRENT_HOST': JSON.stringify(this._options.name),
          }),
          new AddRuntimeRequirementToPromiseExternal(),
        ]
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
          if (err) {
            console.error(err);
            throw new Error(err);
          }
        });
      } else {
        childCompiler.runAsChild((err, stats) => {
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

function extractUrlAndGlobal(urlAndGlobal) {
  const index = urlAndGlobal.indexOf('@');
  if (index <= 0 || index === urlAndGlobal.length - 1) {
    throw new Error(`Invalid request "${urlAndGlobal}"`);
  }
  return [urlAndGlobal.substring(index + 1), urlAndGlobal.substring(0, index)];
}

function generateRemoteTemplate(url, global) {
  return `promise new Promise(function (resolve, reject) {
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
    acc[remote[0]] = remote[1].replace('promise ', '');
    return acc;
  }, {});
}

class NextFederationPlugin {
  constructor(options) {
    const { extraOptions, ...mainOpts } = options;
    this._options = mainOpts;
    this._extraOptions = extraOptions;
    if (options.remotes) {
      const parsedRemotes = Object.entries(options.remotes).reduce(
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
    if(this._options.library) {
      console.error('[mf] you cannot set custom library')
    }
    this._options.library = {
      // assign remote name to object to avoid SWC mangling top level variable
      type: 'window',
      name: this._options.name,
    };
  }

  apply(compiler) {
    const webpack = compiler.webpack;
    const sharedForHost = Object.entries({
      ...(this._options.shared || {}),
      ...DEFAULT_SHARE_SCOPE,
    }).reduce((acc, item) => {
      const [itemKey, shareOptions] = item;

      const shareKey = 'host' + (item.shareKey || itemKey);
      acc[shareKey] = shareOptions;
      if (!shareOptions.import) {
        acc[shareKey].import = itemKey;
      }
      if (!shareOptions.shareKey) {
        acc[shareKey].shareKey = itemKey;
      }

      if (DEFAULT_SHARE_SCOPE[itemKey]) {
        acc[shareKey].packageName = itemKey;
      }
      return acc;
    }, {});

    new webpack.container.ModuleFederationPlugin({
      ...this._options,
      exposes: {},
      shared: {
        noop: {
          import: 'data:text/javascript,module.exports = {};',
          requiredVersion: false,
          version: '0',
        },
        ...sharedForHost,
      },
    }).apply(compiler);
    new webpack.DefinePlugin({
      'process.env.REMOTES': createRuntimeVariables(this._options.remotes),
      'process.env.CURRENT_HOST': JSON.stringify(this._options.name),
    }).apply(compiler);
    new ChildFederation(this._options, this._extraOptions).apply(compiler);
    new AddRuntimeRequirementToPromiseExternal().apply(compiler);
  }
}

module.exports = NextFederationPlugin;
