const CHILD_PLUGIN_NAME = 'ChildFederationPlugin'
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra and Zackary Jackson @ScriptedAlchemy
*/

"use strict";


/** @typedef {import("../../declarations/plugins/container/ModuleFederationPlugin").ExternalsType} ExternalsType */
/** @typedef {import("../../declarations/plugins/container/ModuleFederationPlugin").ModuleFederationPluginOptions} ModuleFederationPluginOptions */

/** @typedef {import("../../declarations/plugins/container/ModuleFederationPlugin").Shared} Shared */
/** @typedef {import("../Compiler")} Compiler */

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
    const {_options: options} = this;
    const webpack = compiler.webpack;
    const {ContainerPlugin, ContainerReferencePlugin} = webpack.container
    const {SharePlugin} = webpack.sharing
    const library = options.library || {type: "var", name: options.name};
    const remoteType =
      options.remoteType ||
      (options.library && /** @type {ExternalsType} */ options.library.type || "script")
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
        exposes: options.exposes
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
        remotes: options.remotes
      }).apply(compiler);
    }
    if (options.shared) {
      new SharePlugin({
        shared: options.shared,
        shareScope: options.shareScope
      }).apply(compiler);
    }
  }
}

class RemoveRRRuntimePlugin {
  apply(compiler) {
    const webpack = compiler.webpack
    compiler.hooks.thisCompilation.tap('RemoveRRRuntimePlugin', (compilation) => {
      compilation.hooks.processAssets.tap({
        name: 'RemoveRRRuntimePlugin',
        state: compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE,
      }, (assets) => {
        Object.keys(assets).forEach((filename) => {
          const asset = compilation.getAsset(filename);
          const newSource = asset.source.source().replace(/RefreshHelpers/g, 'NoExist')
          const updatedAsset = new webpack.sources.RawSource(newSource)

          if (asset) {
            compilation.updateAsset(filename, updatedAsset);
          } else {
            compilation.emitAsset(filename, updatedAsset);
          }
        })
      })
    });
  }
}

const DEFAULT_SHARE_SCOPE = {
  'react': {
    singleton: true,
    requiredVersion: false,
  },
  'react/': {
    singleton: true,
    requiredVersion: false,
  },
  "react-dom": {
    singleton: true,
    requiredVersion: false,
  },
  "next/dynamic": {
    requiredVersion: false,
    singleton: true,
  },
  "styled-jsx": {
    requiredVersion: false,
    singleton: true,
  },
  "next/link": {
    requiredVersion: false,
    singleton: true,
  },
  "next/router": {
    requiredVersion: false,
    singleton: true,
  },
  "next/script": {
    requiredVersion: false,
    singleton: true,
  },
  "next/head": {
    requiredVersion: false,
    singleton: true,
  },
}

class ChildFederation {
  constructor(options) {
    this._options = options
  }

  apply(compiler) {
    const webpack = compiler.webpack;
    const EntryPlugin = webpack.EntryPlugin;
    const LibraryPlugin = webpack.library.EnableLibraryPlugin
    const MFP = webpack.container.ModuleFederationPlugin;
    const ContainerPlugin = webpack.container.ContainerPlugin;
    const LoaderTargetPlugin = webpack.LoaderTargetPlugin;
    const library = compiler.options.output.library;

    compiler.hooks.thisCompilation.tap(CHILD_PLUGIN_NAME, (compilation) => {
      const buildName = this._options.name
      const childOutput = {
        ...compiler.options.output,
        publicPath: 'auto',
        chunkLoadingGlobal: buildName + 'chunkLoader',
        uniqueName: buildName,
        library: {
          name: buildName, type: library.type
        },
        chunkFilename: compiler.options.output.chunkFilename.replace('.js', '-fed.js'),
        filename: compiler.options.output.chunkFilename.replace('.js', '-fed.js'),
      }
      const externalizedShares = Object.entries(DEFAULT_SHARE_SCOPE).reduce((acc, item) => {
        const [key, value] = item;
        acc[key] = {...item, import: false}
        return acc
      }, {})
      const childCompiler = compilation.createChildCompiler(CHILD_PLUGIN_NAME, childOutput, [
        new ModuleFederationPlugin({
          // library: {type: 'var', name: buildName},
          ...this._options,
          runtime: false,
          shared: {
            ...externalizedShares,
            ...this._options.shared
          }
        }),
        new webpack.web.JsonpTemplatePlugin(childOutput),
        new LoaderTargetPlugin('web'),
        new LibraryPlugin('var'),
        new webpack.DefinePlugin({'process.env.REMOTES': JSON.stringify(this._options.remotes)}),
        new AddRuntimeRequiremetToPromiseExternal()
      ]);
      new RemoveRRRuntimePlugin().apply(childCompiler)

      childCompiler.options.plugins.forEach((plugin, index) => {
        if (
          plugin.constructor.name === 'HotModuleReplacementPlugin' ||
          plugin.constructor.name === 'NextFederationPlugin' ||
          plugin.constructor.name === 'CopyFilePlugin' ||
          plugin.constructor.name === 'ProfilingPlugin' ||
          plugin.constructor.name === 'DropClientPage' ||
          plugin.constructor.name === 'ReactFreshWebpackPlugin') {
          childCompiler.options.plugins.splice(index, 1)
          return
        }
      })

      childCompiler.options.experiments.lazyCompilation = false
      childCompiler.options.optimization.runtimeChunk = false
      delete childCompiler.options.optimization.splitChunks
      childCompiler.outputFileSystem = compiler.outputFileSystem
      if (compiler.options.mode === 'development') {
        childCompiler.run((err, stats) => {
          if (err) {
            console.error(err);
            throw new Error(err);
          }
        })
      } else {
        childCompiler.runAsChild((err, stats) => {
          if (err) {
            console.error(err);
            throw new Error(err);
          }
        })
      }


    })
  }
}

class AddRuntimeRequiremetToPromiseExternal {
  apply(compiler) {
    compiler.hooks.compilation.tap(
      "AddRuntimeRequiremetToPromiseExternal",
      compilation => {
        const RuntimeGlobals = compiler.webpack.RuntimeGlobals
        if (compilation.outputOptions.trustedTypes) {
          compilation.hooks.additionalModuleRuntimeRequirements.tap(
            "AddRuntimeRequiremetToPromiseExternal",
            (module, set, context) => {
              if (module.externalType === 'promise') {
                set.add(RuntimeGlobals.loadScript)
              }
            }
          );
        }
      }
    );
  }
}

class NextFederationPlugin {
  constructor(options) {
    this._options = options
  }

  apply(compiler) {
    const webpack = compiler.webpack;
    const sharedForHost = Object.entries({...this._options.shared || {}, ...DEFAULT_SHARE_SCOPE}).reduce((acc, item) => {
      const [itemKey, shareOptions] = item

      const shareKey = 'host' + (item.shareKey || itemKey)
      acc[shareKey] = shareOptions
      if (!shareOptions.import) {
        acc[shareKey].import = itemKey
      }
      if (!shareOptions.shareKey) {
        acc[shareKey].shareKey = itemKey
      }

      if (DEFAULT_SHARE_SCOPE[itemKey]) {
        acc[shareKey].packageName = itemKey
      }
      return acc
    }, {})

    new webpack.container.ModuleFederationPlugin({
      ...this._options,
      exposes: {},
      shared: {
        noop: {
          import: 'data:text/javascript,module.exports = {};',
          requiredVersion: false,
          version: '0'
        },
        ...sharedForHost,
      }
    }).apply(compiler);
    new webpack.DefinePlugin({'process.env.REMOTES': JSON.stringify(this._options.remotes)}).apply(compiler)
    new ChildFederation(this._options).apply(compiler);
    new AddRuntimeRequiremetToPromiseExternal().apply(compiler)
  }
}

module.exports = NextFederationPlugin