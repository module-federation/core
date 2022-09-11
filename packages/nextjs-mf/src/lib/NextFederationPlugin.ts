/*
MIT License http://www.opensource.org/licenses/mit-license.php
Author Tobias Koppers @sokra and Zackary Jackson @ScriptedAlchemy
*/

'use strict';

import path from 'path';
import { Compilation, Compiler } from 'webpack';

import { injectRuleLoader, hasLoader } from '../loaders/helpers';
import { exposeNextjsPages } from '../loaders/nextPageMapLoader';

import ModuleFederationPlugin, {
  ModuleFederationPluginOptions,
  SharedConfig,
  SharedObject,
} from './ModuleFederationPlugin';

const CHILD_PLUGIN_NAME = 'ChildFederationPlugin';

class RemoveRRRuntimePlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler) {
    const webpack = compiler.webpack;

    compiler.hooks.thisCompilation.tap(
      'RemoveRRRuntimePlugin',
      (compilation) => {
        compilation.hooks.processAssets.tap(
          {
            name: 'RemoveRRRuntimePlugin',
            stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE,
          },
          (assets) => {
            Object.keys(assets).forEach((filename) => {
              if (filename.endsWith('.js') || filename.endsWith('.mjs')) {
                const asset = compilation.getAsset(filename);
                const newSource = (asset?.source?.source() as string).replace(
                  /RefreshHelpers/g,
                  'NoExist'
                );
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
} as SharedObject;

type ExtraOptions = {
  enableImageLoaderFix: boolean;
  enableUrlLoaderFix: boolean;
  exposePages: Record<string, unknown>;
};

class ChildFederation {
  _options: Record<string, any>;
  _extraOptions: ExtraOptions;

  constructor(options: Record<string, any>, extraOptions = {} as ExtraOptions) {
    this._options = options;
    this._extraOptions = extraOptions;
  }

  apply(compiler: Compiler) {
    const webpack = compiler.webpack;
    const EntryPlugin = webpack.EntryPlugin;
    const LibraryPlugin = webpack.library.EnableLibraryPlugin;
    const MFP = webpack.container.ModuleFederationPlugin;
    const ContainerPlugin = webpack.container.ContainerPlugin;
    const LoaderTargetPlugin = webpack.LoaderTargetPlugin;
    const library = compiler.options.output.library;

    compiler.hooks.thisCompilation.tap(CHILD_PLUGIN_NAME, (compilation) => {
      const buildName = this._options['name'] as string;
      const childOutput = {
        ...compiler.options.output,
        publicPath: 'auto',
        chunkLoadingGlobal: buildName + 'chunkLoader',
        uniqueName: buildName,
        library: {
          name: buildName,
          type: library?.type as string,
        },
        chunkFilename: (
          compiler.options.output.chunkFilename as string
        ).replace('.js', '-fed.js'),
        filename: (compiler.options.output.chunkFilename as string).replace(
          '.js',
          '-fed.js'
        ),
      };
      const externalizedShares = Object.entries(DEFAULT_SHARE_SCOPE).reduce(
        (acc, item) => {
          const [key, value] = item as [string, SharedConfig];

          acc[key] = { ...value, import: false };

          if (key === 'react/jsx-runtime') {
            delete acc[key].import;
          }

          return acc;
        },
        {} as Record<string, SharedConfig>
      );
      const childCompiler = compilation.createChildCompiler(
        CHILD_PLUGIN_NAME,
        childOutput,
        [
          new ModuleFederationPlugin({
            // library: {type: 'var', name: buildName},
            ...this._options,
            exposes: {
              ...this._options['exposes'],
              ...(this._extraOptions.exposePages
                ? exposeNextjsPages(compiler.options.context as string)
                : {}),
            },
            runtime: false,
            shared: {
              ...externalizedShares,
              ...this._options['shared'],
            },
          }),
          // new webpack.web.JsonpTemplatePlugin(childOutput),
          new webpack.web.JsonpTemplatePlugin(),
          new LoaderTargetPlugin('web'),
          new LibraryPlugin('var'),
          new webpack.DefinePlugin({
            'process.env.REMOTES': JSON.stringify(this._options['remotes']),
            'process.env.CURRENT_HOST': JSON.stringify(this._options['name']),
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
      }) as any;

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

      (childCompiler.options.experiments.lazyCompilation as any) = false;
      childCompiler.options.optimization.runtimeChunk = false;
      delete childCompiler.options.optimization.splitChunks;
      childCompiler.outputFileSystem = compiler.outputFileSystem;

      if (compiler.options.mode === 'development') {
        childCompiler.run((err, stats) => {
          if (err) {
            console.error(err);
            throw new Error(err as unknown as string);
          }
        });
      } else {
        childCompiler.runAsChild((err, stats) => {
          if (err) {
            console.error(err);
            throw new Error(err as unknown as string);
          }
        });
      }
    });
  }
}

class AddRuntimeRequirementToPromiseExternal {
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(
      'AddRuntimeRequirementToPromiseExternal',
      (compilation) => {
        const RuntimeGlobals = compiler.webpack.RuntimeGlobals;
        // if (compilation.outputOptions.trustedTypes) {
        compilation.hooks.additionalModuleRuntimeRequirements.tap(
          'AddRuntimeRequirementToPromiseExternal',
          (module, set, _) => {
            if ((module as any).externalType === 'promise') {
              set.add(RuntimeGlobals.loadScript);
              set.add(RuntimeGlobals.require);
            }
          }
        );
      }
    );
  }
}

function extractUrlAndGlobal(urlAndGlobal: string) {
  const index = urlAndGlobal.indexOf('@');
  if (index <= 0 || index === urlAndGlobal.length - 1) {
    throw new Error(`Invalid request "${urlAndGlobal}"`);
  }
  return [urlAndGlobal.substring(index + 1), urlAndGlobal.substring(0, index)];
}

function generateRemoteTemplate(url: string, global: any) {
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

function createRuntimeVariables(remotes: string[]) {
  return Object.entries(remotes).reduce((acc, remote) => {
    acc[remote[0]] = remote[1].replace('promise ', '');
    return acc;
  }, {} as Record<string, any>);
}

interface NextFederationPluginOptions extends ModuleFederationPluginOptions {
  extraOptions: ExtraOptions;
}

class NextFederationPlugin {
  _options: ModuleFederationPluginOptions;
  _extraOptions: ExtraOptions;

  constructor(options: NextFederationPluginOptions) {
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
        {} as Record<string, string>
      );
      this._options.remotes = parsedRemotes;
    }
  }

  apply(compiler: Compiler) {
    const webpack = compiler.webpack;
    const shared = {
      ...(this._options.shared || {}),
      ...DEFAULT_SHARE_SCOPE,
    } as Record<string, SharedConfig>;

    const sharedForHost = Object.entries(shared).reduce((acc, item) => {
      const [itemKey, shareOptions] = item;

      const shareKey = 'host' + ((item as any).shareKey || itemKey);
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
    }, {} as Record<string, SharedConfig>);

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
      'process.env.REMOTES': createRuntimeVariables(
        this._options.remotes as string[]
      ),
      'process.env.CURRENT_HOST': JSON.stringify(this._options.name),
    }).apply(compiler);
    new ChildFederation(this._options, this._extraOptions).apply(compiler);
    new AddRuntimeRequirementToPromiseExternal().apply(compiler);
  }
}

module.exports = NextFederationPlugin;
