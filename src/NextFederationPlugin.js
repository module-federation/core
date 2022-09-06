/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra and Zackary Jackson @ScriptedAlchemy
*/

('use strict');
import fs from 'fs';
import mv from 'mv';
import path from 'path';
import { injectRuleLoader, hasLoader } from './loaders/helpers';
import { exposeNextjsPages } from './loaders/nextPageMapLoader';
import {
  reKeyHostShared,
  DEFAULT_SHARE_SCOPE,
  extractUrlAndGlobal,
  generateRemoteTemplate,
  internalizeSharedPackages,
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
}

//TODO: this should use webpack asset stage hooks instead to read & add additional assets to a compilation
const moveFilesToClientDirectory = (isServer, compilation, callback) => {
  let outputPath = compilation.options.output.path.split(path.sep);
  const foundIndex = outputPath.findIndex((i) => {
    return i === (isServer ? 'server' : 'static');
  })
  outputPath = outputPath
    .slice(
      0,
      foundIndex > 0 ? foundIndex : outputPath.length
    )
    .join(path.sep);
  const staticDirExists = fs.existsSync(path.join(outputPath, 'static'));
  const ssrPathTemp = path.join(outputPath, 'ssr');
  const ssrOutputPath = path.join(outputPath, 'static/ssr');

  if (isServer) {
    Object.keys(compilation.assets).forEach((asset) => {
      // older versions of next.js have a different output order
      const absolutePath = path.join(compilation.options.output.path, asset);

      if (!staticDirExists) {
        mv(
          absolutePath,
          path.join(ssrPathTemp, asset),
          { mkdirp: true },
          (err) => {
            if (err) {
              throw err;
            }
            if (callback) {
              callback();
            }
          }
        );
      } else {
        mv(
          absolutePath,
          path.join(ssrOutputPath, asset),
          { mkdirp: true },
          (err) => {
            if (err) {
              throw err;
            }
            if (callback) {
              callback();
            }
          }
        );
      }
    });
  } else {
    // would be better to add assets to complation via process assets stage api instead of manually writing to disk
    if (fs.existsSync(ssrPathTemp)) {
      mv(
        path.join(ssrPathTemp),
        path.join(ssrOutputPath),
        { mkdirp: true },
        function (err) {
          if (err) {
            throw err;
          }
          console.log('moved files to client')
          if (callback) {
            callback();
          }
        }
      );
    }
  }
};
const computeRemoteFilename = (isServer, filename) => {
  if (isServer && filename) {
    return path.basename(filename);
  }
  return filename;
};

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
          ...externalizedShares,
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
            'process.env.REMOTES': JSON.stringify(this._options.remotes),
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
        // console.log(
        //   childCompiler.options.name,
        //   childCompiler.options.externals
        // );
        // childCompiler.options.externals.push('react')
        //   = [
        //   "next",
        //   { react: "react" },
        //   "react/jsx-runtime",
        //   "react/jsx-dev-runtime",
        //   "styled-jsx",
        // ]
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
      childCompiler.outputFileSystem = fs;
      let childAssets;
      if (isServer) {
        childAssets = new Promise((resolve) => {
          childCompiler.hooks.afterEmit.tap(
            CHILD_PLUGIN_NAME,
            (childCompilation) => {
              console.log('after emit assets');
              const { outputPath } = childCompiler;
              const webpackContext = childCompiler.context;
              const outputDirWithCwd = path.relative(
                webpackContext,
                outputPath
              );
              moveFilesToClientDirectory(isServer, childCompilation, resolve);
            }
          );
        });
      } else {
        childAssets = new Promise(resolve =>{
          moveFilesToClientDirectory(isServer, compilation, resolve);
        })
        // this is better, but leaving off for now as it runs code through terser optimization
        // childAssets = new Promise((resolve, reject) => {
        //   fs.readdir(
        //     path.join(childCompiler.context, '.next/ssr'),
        //     function (err, files) {
        //       //handling error
        //       if (err) {
        //         reject('Unable to scan directory: ' + err);
        //         return;
        //       }
        //
        //       const allFiles = files.map(function (file) {
        //         // Do whatever you want to do with the file
        //         return new Promise((res, rej) => {
        //           fs.readFile(
        //             path.join(childCompiler.context, '.next/ssr', file),
        //             (err, data) => {
        //               if (err) rej(err);
        //               compilation.assets[path.join('static/ssr', file)] = new compiler.webpack.sources.RawSource(data)
        //               res();
        //             }
        //           );
        //         });
        //       });
        //       Promise.all(allFiles).then(resolve).catch(reject)
        //     }
        //   );
        // });
      }
      // on main compiler add extra assets from server output to browser build
      compilation.hooks.additionalAssets.tapPromise(CHILD_PLUGIN_NAME, () => {
        console.log(compiler.options.name);
        console.log('in additional assets hook for main build', childAssets);

        return childAssets;
      });

      if (compiler.options.mode === 'development') {
        childCompiler.run((err, stats) => {
          // moveFilesToClientDirectory(isServer, stats);
          if (err) {
            console.error(err);
            throw err
          }
        });
      } else {
        childCompiler.run((err, stats) => {
          // moveFilesToClientDirectory(isServer, stats);

          if (err) {
            console.error(err);
            throw err
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
  return JSON.stringify(Object.entries(remotes).reduce((acc, remote) => {
    // handle promise new promise and external new promise
    acc[remote[0]] = remote[1].replace('promise ', '').replace('external ', '');
    return acc;
  }, {}))
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
