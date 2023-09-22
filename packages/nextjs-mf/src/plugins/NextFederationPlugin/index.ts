/**
 * MIT License http://www.opensource.org/licenses/mit-license.php
 * Author Zackary Jackson @ScriptedAlchemy
 * This module contains the NextFederationPlugin class which is a webpack plugin that handles Next.js application federation using Module Federation.
 */
'use strict';


import type {
  ModuleFederationPluginOptions,
  NextFederationPluginExtraOptions,
  NextFederationPluginOptions,
  SharedObject,
} from '@module-federation/utilities';
import { createRuntimeVariables } from '@module-federation/utilities';
import type { Compiler, container } from 'webpack';
import CopyFederationPlugin from '../CopyFederationPlugin';
import {
  applyRemoteDelegates,
  getModuleFederationPluginConstructor,
  retrieveDefaultShared,
  applyPathFixes,
} from './next-fragments';
import { parseRemotes } from '../../internal';
import AddRuntimeRequirementToPromiseExternal from '../AddRuntimeRequirementToPromiseExternalPlugin';
import { exposeNextjsPages } from '../../loaders/nextPageMapLoader';
import { removeUnnecessarySharedKeys } from './remove-unnecessary-shared-keys';
import { setOptions } from './set-options';
import {
  validateCompilerOptions,
  validatePluginOptions,
} from './validate-options';
import {
  applyServerPlugins,
  configureServerCompilerOptions,
  configureServerLibraryAndFilename,
  handleServerExternals,
} from './apply-server-plugins';

import { applyClientPlugins } from './apply-client-plugins';

/**
 * NextFederationPlugin is a webpack plugin that handles Next.js application federation using Module Federation.
 */
export class NextFederationPlugin {
  _options: ModuleFederationPluginOptions;
  _extraOptions: NextFederationPluginExtraOptions;

  /**
   * Constructs the NextFederationPlugin with the provided options.
   *
   * @param options The options to configure the plugin.
   */
  constructor(options: NextFederationPluginOptions) {
    const { mainOptions, extraOptions } = setOptions(options);
    this._options = mainOptions;
    this._extraOptions = extraOptions;
  }

  /**
   * The apply method is called by the webpack compiler and allows the plugin to hook into the webpack process.
   * @param compiler The webpack compiler object.
   */
  apply(compiler: Compiler) {
    // Validate the compiler options
    const validCompile = validateCompilerOptions(compiler);
    if (!validCompile) {
      return;
    }
    // Validate the NextFederationPlugin options
    validatePluginOptions(this._options);

    // Check if the compiler is for the server or client
    const isServer = compiler.options.name === 'server';
    const { webpack } = compiler;

    // Apply the CopyFederationPlugin
    new CopyFederationPlugin(isServer).apply(compiler);

    // If shared modules are provided, remove unnecessary shared keys from the default share scope
    // @ts-ignore
    if (this._options.shared) {
     // removeUnnecessarySharedKeys(this._options.shared as SharedObject);
    }

    const ModuleFederationPlugin: container.ModuleFederationPlugin =
      getModuleFederationPluginConstructor(isServer, compiler);
    // const { SharePlugin } = webpack.sharing;
    //
    // new SharePlugin({
    //   shareScope: 'default',
    //   shared: {
    //     react: {
    //       eager: true
    //     }
    //   }
    // }).apply(compiler);

    const defaultShared = retrieveDefaultShared(isServer);
    if (isServer) {
      // Refactored server condition
      configureServerCompilerOptions(compiler);
      configureServerLibraryAndFilename(this._options);

      applyServerPlugins(compiler, this._options);
      handleServerExternals(compiler, {
        // @ts-ignore
        ...this._options,
        // @ts-ignore
        shared: { ...defaultShared, ...this._options.shared },
      });
    } else {
      applyClientPlugins(compiler, this._options, this._extraOptions);
    }
    // compiler.options.output.publicPath = 'auto';

    //@ts-ignore
    applyPathFixes(compiler, this._extraOptions);
let noop;
try {
  noop = require.resolve('../../federation-noop');
} catch (e) {
  noop = require.resolve('../../federation-noop.cjs');
}
    // @ts-ignore
    const hostFederationPluginOptions: ModuleFederationPluginOptions = {
      // @ts-ignore
      ...this._options,
      runtime: false,
      //@ts-ignore
      remoteType: 'script',
      exposes: {
        //something must be exposed in order to generate a remote entry, which is needed to kickstart runtime
        './noop': noop,
        ...(this._extraOptions.exposePages
          ? exposeNextjsPages(compiler.options.context as string)
          : {}),
        // @ts-ignore
        ...this._options.exposes,
      },
      remotes: {
        //@ts-ignore
        ...this._options.remotes,
      },
      // shared: {
      //   ...defaultShared,
      //   ...this._options.shared,
      // },
    };

    // if (this._extraOptions.debug) {
      compiler.options.devtool = false;
    // }
    // @ts-ignore
    compiler.options.output.uniqueName = this._options.name;

    // inject module hoisting system
    applyRemoteDelegates(this._options, compiler);
    //@ts-ignore
    if (this._extraOptions.automaticAsyncBoundary) {
      console.warn('[nextjs-mf]: automaticAsyncBoundary is deprecated');
    }

    //todo runtime variable creation needs to be applied for server as well. this is just for client
    // TODO: this needs to be refactored into something more comprehensive. this is just a quick fix
    new webpack.DefinePlugin({
      // @ts-ignore

      'process.env.REMOTES': createRuntimeVariables(this._options.remotes),
      // @ts-ignore

      'process.env.CURRENT_HOST': JSON.stringify(this._options.name),
    }).apply(compiler);

    // @ts-ignore
    new ModuleFederationPlugin({
      ...hostFederationPluginOptions,
      // @ts-ignore
      shared: Object.keys(hostFederationPluginOptions.shared).reduce((acc, key) => ({ ...acc, [key]: { ...hostFederationPluginOptions.shared[key], version: "0" } }), {}),
    }).apply(compiler);
    // @ts-ignore

    const hasRemotesOrExposes = Object.keys(this._options?.remotes || {}).length > 0 || Object.keys(this._options?.exposes || {}).length > 0;
    if (hasRemotesOrExposes) {
      const commonOptions = {
        // @ts-ignore
        ...hostFederationPluginOptions,
        name: 'host_inner_ctn',
        runtime: isServer ? 'webpack-runtime' : 'webpack',
        filename: `host_inner_ctn.js`,
        remoteType: 'script',
        // @ts-ignore
        library: { ...hostFederationPluginOptions.library, name: this._options.name },
        shared: { ...hostFederationPluginOptions.shared, ...defaultShared },
      };

     // @ts-ignore
      new ModuleFederationPlugin({
        ...commonOptions,
      }).apply(compiler);
    }

    new AddRuntimeRequirementToPromiseExternal().apply(compiler);
  }
}

/**
 * Exporting NextFederationPlugin as default
 */
export default NextFederationPlugin;

