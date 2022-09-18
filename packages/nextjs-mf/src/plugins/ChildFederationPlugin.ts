import type { Compiler, WebpackError, WebpackPluginInstance } from 'webpack';
import type {
  ModuleFederationPluginOptions,
  NextFederationPluginExtraOptions,
} from '../../types';

import path from 'path';
import fs from 'fs';

import { exposeNextjsPages } from '../loaders/nextPageMapLoader';
import { hasLoader, injectRuleLoader } from '../loaders/helpers';

import {
  DEFAULT_SHARE_SCOPE,
  getOutputPath,
  externalizedShares,
  removePlugins,
} from '../internal';
import {
  computeRemoteFilename,
  createRuntimeVariables,
  toDisplayErrors,
} from '../../utils';

// import StreamingTargetPlugin from '../node-plugin/streaming';
// import NodeFederationPlugin from '../node-plugin/streaming/NodeRuntime';

import {
  NodeFederationPlugin,
  StreamingFederationPlugin,
} from '@module-federation/node';

import ChildFriendlyModuleFederationPlugin from './ModuleFederationPlugin';
import RemoveRRRuntimePlugin from './RemoveRRRuntimePlugin';
import AddRuntimeRequirementToPromiseExternal from './AddRuntimeRequirementToPromiseExternalPlugin';

const CHILD_PLUGIN_NAME = 'ChildFederationPlugin';
const childCompilers = {} as Record<string, Compiler>;

export class ChildFederationPlugin {
  private _options: ModuleFederationPluginOptions;
  private _extraOptions: NextFederationPluginExtraOptions;

  constructor(
    options: ModuleFederationPluginOptions,
    extraOptions: NextFederationPluginExtraOptions
  ) {
    this._options = options;
    this._extraOptions = extraOptions;
  }

  apply(compiler: Compiler) {
    const webpack = compiler.webpack;
    const LibraryPlugin = webpack.library.EnableLibraryPlugin;
    const LoaderTargetPlugin = webpack.LoaderTargetPlugin;
    const library = compiler.options.output.library;
    const isServer = compiler.options.name === 'server';
    const isDev = compiler.options.mode === 'development';
    let outputPath: string;

    if (isDev && isServer) {
      outputPath = path.join(getOutputPath(compiler), 'static/ssr');
    } else {
      if (isServer) {
        outputPath = path.join(getOutputPath(compiler), 'static/ssr');
      } else {
        outputPath = compiler.options.output.path as string;
      }
    }

    compiler.hooks.thisCompilation.tap(CHILD_PLUGIN_NAME, (compilation) => {
      let plugins = [] as WebpackPluginInstance[];
      const buildName = this._options.name;
      // using ModuleFederationPlugin does not work, i had to fork because of afterPlugins hook on containerPlugin.
      const FederationPlugin = ChildFriendlyModuleFederationPlugin;

      const childOutput = {
        ...compiler.options.output,
        path: outputPath,
        // path: deriveOutputPath(isServer, compiler.options.output.path),
        publicPath: 'auto',
        chunkLoadingGlobal: buildName + 'chunkLoader',
        uniqueName: buildName,
        library: {
          name: buildName,
          type: library?.type as string,
        },
        chunkFilename: (
          compiler.options.output.chunkFilename as string
        )?.replace('.js', '-fed.js'),
        filename: (compiler.options.output.filename as string)?.replace(
          '.js',
          '-fed.js'
        ),
      };

      const federationPluginOptions: ModuleFederationPluginOptions = {
        // library: {type: 'var', name: buildName},
        ...this._options,
        filename: computeRemoteFilename(
          isServer,
          this._options.filename as string
        ),
        exposes: {
          ...this._options.exposes,
          ...(this._extraOptions.exposePages
            ? exposeNextjsPages(compiler.options.context as string)
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

      if (compiler.options.name === 'client') {
        plugins = [
          new FederationPlugin(federationPluginOptions),
          // FIXME: JsonpTemplate no more expects constructor arguments
          // https://github.com/webpack/webpack/blob/main/lib/web/JsonpTemplatePlugin.js
          // Removing 'childOutput' as TS is throwing an error
          new webpack.web.JsonpTemplatePlugin(), // new webpack.web.JsonpTemplatePlugin(childOutput),
          new LoaderTargetPlugin('web'),
          new LibraryPlugin(this._options.library?.type as string),
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
          new NodeFederationPlugin(federationPluginOptions, {
            ModuleFederationPlugin: FederationPlugin,
          }),
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
          new StreamingFederationPlugin(federationPluginOptions, {
            ModuleFederationPlugin: webpack.container.ModuleFederationPlugin,
          }),
          new LibraryPlugin(federationPluginOptions.library?.type as string),
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

      (childCompiler.options.experiments.lazyCompilation as any) = false;
      childCompiler.options.optimization.runtimeChunk = false;
      childCompiler.outputFileSystem = fs;

      // no custom chunk splitting should be derived from host (next)
      delete childCompiler.options.optimization.splitChunks;

      if (
        compiler.options.optimization.minimize &&
        compiler.options.optimization.minimizer
      ) {
        for (const minimizer of compiler.options.optimization.minimizer) {
          if (typeof minimizer === 'function') {
            (minimizer as any).call(childCompiler, childCompiler);
          } else if (minimizer !== '...') {
            minimizer.apply(childCompiler);
          }
        }
      }

      new RemoveRRRuntimePlugin().apply(childCompiler);

      // TODO: Provide better types for MiniCss Plugin for ChildCompiler in ChildFederationPlugin
      const MiniCss = childCompiler.options.plugins.find((p) => {
        return p.constructor.name === 'NextMiniCssExtractPlugin';
      }) as any;

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
      if (compiler.options.name) {
        childCompilers[compiler.options.name] = childCompiler;
      }

      if (isDev) {
        // in dev, run the compilers in the order they are created (client, server)
        childCompiler.run((err, stats) => {
          if (err) {
            compilation.errors.push(err as WebpackError);
          }
          if (stats && stats.hasErrors()) {
            compilation.errors.push(
              new Error(
                toDisplayErrors(stats.compilation.errors)
              ) as WebpackError
            );
          }
        });
        // in prod, if client
      } else if (!isServer) {
        // if ssr enabled and server in compiler cache
        if (childCompilers['server']) {
          //wrong hook for this
          // add hook for additional assets to prevent compile from sealing.
          compilation.hooks.additionalAssets.tapPromise(
            CHILD_PLUGIN_NAME,
            () => {
              return new Promise((res, rej) => {
                // run server child compilation during client main compilation
                childCompilers['server'].run((err, stats) => {
                  if (err) {
                    compilation.errors.push(err as WebpackError);
                    rej();
                  }
                  if (stats && stats.hasErrors()) {
                    compilation.errors.push(
                      new Error(
                        toDisplayErrors(stats.compilation.errors)
                      ) as WebpackError
                    );
                    rej();
                  }
                  res();
                });
              });
            }
          );
        }
        // run client child compiler like normal
        childCompiler.run((err, stats) => {
          if (err) {
            compilation.errors.push(err as WebpackError);
          }
          if (stats && stats.hasErrors()) {
            compilation.errors.push(
              new Error(
                toDisplayErrors(stats.compilation.errors)
              ) as WebpackError
            );
          }
        });
      }
    });
  }
}

export default ChildFederationPlugin;
