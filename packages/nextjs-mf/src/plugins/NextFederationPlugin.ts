/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Zackary Jackson @ScriptedAlchemy
*/
'use strict';

import type {
  ModuleFederationPluginOptions,
  NextFederationPluginExtraOptions,
  NextFederationPluginOptions,
} from '@module-federation/utilities';
import {createRuntimeVariables, createDelegatedModule} from '@module-federation/utilities';
import CopyFederationPlugin from './CopyFederationPlugin';
import AddModulesPlugin from './AddModulesToRuntime';
import type {Compiler} from 'webpack';
import path from 'path';

import {
  internalizeSharedPackages,
  parseRemotes,
  reKeyHostShared,
  getDelegates,
  DEFAULT_SHARE_SCOPE
} from '../internal';
import AddRuntimeRequirementToPromiseExternal from './AddRuntimeRequirementToPromiseExternalPlugin';
import ChildFederationPlugin from './ChildFederationPlugin';

import DevHmrFixInvalidPongPlugin from './DevHmrFixInvalidPongPlugin';
import {exposeNextjsPages} from "../loaders/nextPageMapLoader";

// @ts-ignore
const regexEqual = (x, y) => {
  return (
    x instanceof RegExp &&
    y instanceof RegExp &&
    x.source === y.source &&
    x.global === y.global &&
    x.ignoreCase === y.ignoreCase &&
    x.multiline === y.multiline
  );
};

export class NextFederationPlugin {
  private _options: ModuleFederationPluginOptions;
  private _extraOptions: NextFederationPluginExtraOptions;

  constructor(options: NextFederationPluginOptions) {
    const {extraOptions, ...mainOpts} = options;
    this._options = mainOpts;

    this._extraOptions = {
      automaticPageStitching: false,
      enableImageLoaderFix: false,
      enableUrlLoaderFix: false,
      skipSharingNextInternals: false,
      automaticAsyncBoundary: false,
      ...extraOptions,
    };
  }

  apply(compiler: Compiler) {
    //@ts-ignore
    if (!compiler.options.name) {
      throw new Error('name is not defined in Compiler options');
    }

    if (!this._options.filename) {
      throw new Error('filename is not defined in NextFederation options');
    }

    if (!['server', 'client'].includes(compiler.options.name)) {
      return;
    }

    const isServer = compiler.options.name === 'server';
    const {webpack} = compiler;

    new CopyFederationPlugin(isServer).apply(compiler);

    if (isServer) {
      // target false because we use our own target for node env
      compiler.options.target = false;
      const {StreamingTargetPlugin} = require('@module-federation/node');

      // add hoist to main entry for sync avaliability.
      compiler.options.optimization.chunkIds = 'named';
      new AddModulesPlugin({
        runtime: 'webpack-runtime',
        eager: true,
      }).apply(compiler);
      new StreamingTargetPlugin(this._options, {
        ModuleFederationPlugin: webpack.container.ModuleFederationPlugin,
      }).apply(compiler);

      this._options.library = {
        type: 'commonjs-module',
        name: this._options.name,
      };
      // output remote to ssr if server
      this._options.filename = path.basename(this._options.filename);

      // should this be a plugin that we apply to the compiler?
      // internalizeSharedPackages(this._options, compiler);

      // module-federation/utilities uses internal webpack methods and must be bundled into runtime code.
      if (Array.isArray(compiler.options.externals)) {
        const originalExternals = compiler.options.externals[0];
        compiler.options.externals[0] = function (ctx, callback) {
          if (
            ctx.request &&
            (ctx.request.includes('@module-federation/utilities') ||
              ctx.request.includes('@module-federation/dashboard-plugin'))
          ) {
            return callback();
          }
          // @ts-ignore
          return originalExternals(ctx, callback);
        };
      }
    } else {
      compiler.options.plugins = compiler.options.plugins.filter((p: any) => {
        return p.constructor.name === 'ReactFreshWebpackPlugin'
      })
      const ModuleFederationPlugin = isServer
        ? require('@module-federation/node').NodeFederationPlugin
        : webpack.container.ModuleFederationPlugin;

      // ignore edge runtime and middleware builds
      if (!ModuleFederationPlugin) {
        return;
      }

      // hoist modules into remote runtime
      new AddModulesPlugin({
        runtime: this._options.name,
        eager: false
      }).apply(compiler);


      if (this._extraOptions.automaticPageStitching) {
        compiler.options.module.rules.push({
          test: /next[\\/]dist[\\/]client[\\/]page-loader\.js$/,
          loader: path.resolve(
            __dirname,
            '../loaders/patchNextClientPageLoader'
          ),
        });
      }

      if (this._options.remotes) {
        this._options.remotes = parseRemotes(this._options.remotes);
      }


      if (this._options.library) {
        console.error('[mf] you cannot set custom library');
      }

      this._options.library = {
        // assign remote name to object to avoid SWC mangling top level variable
        type: 'window',
        name: this._options.name,
      };

      // add hoist to main entry for sync avaliability.
      new webpack.EntryPlugin(
        compiler.context,
        require.resolve('../internal-delegate-hoist'),
        'main').apply(compiler);
    }

    const hostFederationPluginOptions: ModuleFederationPluginOptions = {
      ...this._options,
      runtime: false,
      exposes: {
        "__hoist": require.resolve('../delegate-hoist-container'),
        ...(this._extraOptions.exposePages
          ? exposeNextjsPages(compiler.options.context as string, this._extraOptions.automaticAsyncBoundary as boolean)
          : {}),
        ...this._options.exposes,
      },
      remotes: {
        ...this._options.remotes,
      },
      shared: {
        ...DEFAULT_SHARE_SCOPE,
        // noop: {
        //   import: 'data:text/javascript,module.exports = {};',
        //   requiredVersion: false,
        //   eager: true,
        //   version: '0',
        // },
        // ...this._options.shared,
      },
    };

    const allowedPaths = ['pages/', 'app/', 'src/pages/', 'src/app/'];

    //patch next
    // compiler.options.module.rules.push({
    //   test(req: string) {
    //     if (
    //       allowedPaths.some((p) => req.includes(path.join(compiler.context, p)))
    //     ) {
    //       return /\.(js|jsx|ts|tsx|md|mdx|mjs)$/i.test(req);
    //     }
    //     return false;
    //   },
    //   include: compiler.context,
    //   exclude: [
    //     /node_modules/,
    //     /_middleware/,
    //     /pages[\\/]middleware/,
    //     /pages[\\/]api/,
    //   ],
    //   loader: path.resolve(__dirname, '../loaders/patchDefaultSharedLoader'),
    // });

    // inject module hoisting system
    compiler.options.module.rules.unshift(
      // inject hoist dependency into upper scope of application
      {
        enforce: 'pre',
        test: /_document/,
        include: [
          compiler.context,
          /next[\\/]dist/,
        ],
        loader: path.resolve(__dirname, '../loaders/inject-hoist'),
      },
      // populate hoist dependency with shared modules
      {
      test: /internal-delegate-hoist/,
      include: [
        /internal-delegate-hoist/,
        compiler.context,
        /next[\\/]dist/,
      ],
      loader: path.resolve(__dirname, '../loaders/share-scope-hoist'),
      options: {
        shared: hostFederationPluginOptions.shared,
      }
    });


    if (this._options.remotes) {
      const delegates = getDelegates(this._options.remotes);
      // only apply loader if delegates are present
      if (delegates && Object.keys(delegates).length > 0) {
        compiler.options.module.rules.push({
          enforce: 'pre',
          test: [/internal-delegate-hoist/, /delegate-hoist-container/],
          include: [
            compiler.context,
            /internal-delegate-hoist/,
            /delegate-hoist-container/,
            /next[\\/]dist/,
          ],
          loader: path.resolve(__dirname, '../loaders/delegateLoader'),
          options: {
            delegates,
          },
        });
      }
    }

    if (this._extraOptions.automaticAsyncBoundary) {
      const jsRules = compiler.options.module.rules.find((r) => {
        //@ts-ignore
        return r && r.oneOf;
      });

      //@ts-ignore
      if (jsRules && jsRules.oneOf) {
        //@ts-ignore
        const foundJsLayer = jsRules.oneOf.find((r) => {
          return (
            regexEqual(r.test, /\.(tsx|ts|js|cjs|mjs|jsx)$/) && !r.issuerLayer
          );
        });

        if (foundJsLayer) {
          let loaderChain = [];
          if (Array.isArray(foundJsLayer.use)) {
            loaderChain = [...foundJsLayer.use];
          } else {
            loaderChain = [foundJsLayer.use];
          }
          //@ts-ignore
          jsRules.oneOf.unshift({
            test: (request: string) => {
              if (
                allowedPaths.some((p) =>
                  request.includes(path.join(compiler.context, p))
                )
              ) {
                return /\.(js|jsx|ts|tsx|md|mdx|mjs)$/i.test(request);
              }
              return false;
            },
            exclude: [
              /node_modules/,
              /_document/,
              /_middleware/,
              /pages[\\/]middleware/,
              /pages[\\/]api/,
            ],
            resourceQuery: (query: string) => !query.includes('hasBoundary'),
            use: [
              ...loaderChain,
              {
                loader: path.resolve(
                  __dirname,
                  '../loaders/async-boundary-loader'
                ),
              },
            ],
          });
        }
      }
    }

    //todo runtime variable creation needs to be applied for server as well. this is just for client
    // TODO: this needs to be refactored into something more comprehensive. this is just a quick fix
    new webpack.DefinePlugin({
      'process.env.REMOTES': createRuntimeVariables(this._options.remotes),
      'process.env.CURRENT_HOST': JSON.stringify(this._options.name),
    }).apply(compiler);

    const ModuleFederationPlugin = isServer
      ? require('@module-federation/node').NodeFederationPlugin
      : webpack.container.ModuleFederationPlugin;

    // ignore edge runtime and middleware builds
    if (!ModuleFederationPlugin) {
      return;
    }
    //@ts-ignore
    if (false) {
      const existingGroups =
        //@ts-ignore
        compiler.options.optimization?.splitChunks?.cacheGroups || {};
      // @ts-ignore
      delete compiler.options.optimization?.splitChunks?.cacheGroups?.framework;
      console.log(existingGroups);
      // @ts-ignore
      compiler.options.optimization = {
        ...compiler.options.optimization,
        splitChunks: {
          ...compiler.options.optimization?.splitChunks,

          cacheGroups: {
            hoist: {
              name: 'webpack',
              enforce: true,
              priority: -1,
              test: function (module: any, chunks: any) {
                return (
                  /internal-delegate-hoist/.test(module.resource)
                );
              }
            }
          },
        },
      };

      compiler.options.output.publicPath = 'auto';
      compiler.options.output.uniqueName = this._options.name;
      const internalShare = reKeyHostShared(this._options.shared);
      //@ts-ignore
      delete internalShare.hostreact;

    }
    compiler.options.devtool = 'source-map';

    //@ts-ignore
    compiler.options.output.publicPath = 'auto';
    compiler.options.output.uniqueName = this._options.name;

    new ModuleFederationPlugin(hostFederationPluginOptions, {ModuleFederationPlugin}).apply(compiler);

    if (!isServer && this._options.remotes && Object.keys(this._options.remotes).length > 0) {
      // single runtime chunk if host or circular remote uses remote of current host.
      new ModuleFederationPlugin({
        ...hostFederationPluginOptions,
        filename: undefined,
        runtime: undefined,
        name: this._options.name + '_single',
        remotes: {},
      }, {ModuleFederationPlugin}).apply(compiler);
    }

    // new ChildFederationPlugin(this._options, this._extraOptions).apply(
    //   compiler
    // );
    new AddRuntimeRequirementToPromiseExternal().apply(compiler);

    if (compiler.options.mode === 'development') {
      new DevHmrFixInvalidPongPlugin().apply(compiler);
    }
  }
}

export default NextFederationPlugin;
