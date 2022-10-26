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
import { createRuntimeVariables } from '@module-federation/utilities';

import path from 'path';
import type { Compiler } from 'webpack';

import { internalizeSharedPackages, parseRemotes, reKeyHostShared, } from '../internal';
import AddRuntimeRequirementToPromiseExternal from './AddRuntimeRequirementToPromiseExternalPlugin';
import ChildFederationPlugin from './ChildFederationPlugin';

import DevHmrFixInvalidPongPlugin from './DevHmrFixInvalidPongPlugin';

export class NextFederationPlugin {
  private _options: ModuleFederationPluginOptions;
  private _extraOptions: NextFederationPluginExtraOptions;

  constructor(options: NextFederationPluginOptions) {
    const { extraOptions, ...mainOpts } = options;
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
    if (!compiler.options.name) {
      throw new Error('name is not defined in Compiler options');
    }

    if (!this._options.filename) {
      throw new Error('filename is not defined in NextFederation options');
    }

    if(!['server','client'].includes(compiler.options.name)) {
      return
    }

    const isServer = compiler.options.name === 'server';
    const webpack = compiler.webpack;

    if (isServer) {
      console.error(
        '[nextjs-mf] WARNING: SSR IS NOT FULLY SUPPORTED YET, Only use pluign on client builds'
      );
      // target false because we use our own target for node env
      compiler.options.target = false;
compiler.options.devtool = 'source-map';
      const StreamingTargetPlugin =
        require('@module-federation/node').StreamingTargetPlugin;

      new StreamingTargetPlugin(this._options, {
        ModuleFederationPlugin: webpack.container.ModuleFederationPlugin,
      }).apply(compiler);

      this._options.library = {
        type: 'commonjs-module',
        name: this._options.name,
      };
      // output remote to ssr if server
      this._options.filename = this._options.filename.replace(
        '/chunks',
        '/ssr'
      );

      // should this be a plugin that we apply to the compiler?
      internalizeSharedPackages(this._options, compiler);
    } else {
      if(this._extraOptions.automaticPageStitching) {
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
    }

    //patch next
    compiler.options.module.rules.push({
      test(req) {
        return (req.includes('/pages/') || req.includes('/app/') && (req.endsWith('.js') || req.endsWith('.jsx') || req.endsWith('.ts') || req.endsWith('.tsx') || req.endsWith('.mjs')));
      },
      include: compiler.context,
      exclude: /node_modules/,
      loader: path.resolve(
        __dirname,
        '../loaders/patchDefaultSharedLoader'
      ),
    });
    if(this._extraOptions.automaticAsyncBoundary) {
      compiler.options.module.rules.push({
        test: [/pages/],
        exclude: [/node_modules/, /_document/, /_middleware/],
        resourceQuery: (query) => {
          return !query.includes('hasBoundary')
        },
        loader: path.resolve(
          __dirname,
          '../loaders/async-boundary-loader'
        )
      });
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
    if (ModuleFederationPlugin) {
      const internalShare = reKeyHostShared(this._options.shared);
      const hostFederationPluginOptions: ModuleFederationPluginOptions = {
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

      new ModuleFederationPlugin(hostFederationPluginOptions, {
        ModuleFederationPlugin,
      }).apply(compiler);

      new ChildFederationPlugin(this._options, this._extraOptions).apply(
        compiler
      );
      new AddRuntimeRequirementToPromiseExternal().apply(compiler);

      if (compiler.options.mode === 'development') {
        new DevHmrFixInvalidPongPlugin().apply(compiler);
      }
    }
  }
}

export default NextFederationPlugin;
