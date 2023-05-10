/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Zackary Jackson @ScriptedAlchemy
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
  injectModuleHoistingSystem,
  retrieveDefaultShared,
} from './next-fragments';

import { DEFAULT_SHARE_SCOPE_BROWSER_LAZY, parseRemotes } from '../../internal';
import AddRuntimeRequirementToPromiseExternal from '../AddRuntimeRequirementToPromiseExternalPlugin';
import { exposeNextjsPages } from '../../loaders/nextPageMapLoader';
import { removeUnnecessarySharedKeys } from './remove-unnecessary-shared-keys';
import { setOptions } from './set-options';
import {
  validateCompilerOptions,
  validatePluginOptions,
} from './validate-options';
import { applyAutomaticAsyncBoundary } from './apply-automatic-async-boundary';
import {
  applyServerPlugins,
  configureServerCompilerOptions,
  configureServerLibraryAndFilename,
  handleServerExternals,
} from './apply-server-plugins';
import { applyClientPlugins } from './apply-client-plugins';

/**
 * NextFederationPlugin is a webpack plugin that handles Next.js application
 * federation using Module Federation.
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

  apply(compiler: Compiler) {
    // Validate the compiler options
    const validCompile = validateCompilerOptions(compiler);
    if (!validCompile) return;
    // Validate the NextFederationPlugin options
    validatePluginOptions(this._options);

    // Check if the compiler is for the server or client
    const isServer = compiler.options.name === 'server';
    const { webpack } = compiler;

    // Apply the CopyFederationPlugin
    new CopyFederationPlugin(isServer).apply(compiler);

    // If remotes are provided, parse them
    if (this._options.remotes) {
      this._options.remotes = parseRemotes(this._options.remotes);
    }

    // If shared modules are provided, remove unnecessary shared keys from the default share scope
    if (this._options.shared) {
      removeUnnecessarySharedKeys(this._options.shared as SharedObject);
    }

    const ModuleFederationPlugin: container.ModuleFederationPlugin =
      getModuleFederationPluginConstructor(isServer, compiler);

    const defaultShared = retrieveDefaultShared(isServer);

    if (isServer) {
      // Refactored server condition
      configureServerCompilerOptions(compiler);
      configureServerLibraryAndFilename(this._options);

      applyServerPlugins(compiler, this._options);
      handleServerExternals(compiler, {
        ...this._options,
        shared: { ...defaultShared, ...this._options.shared },
      });
    } else {
      applyClientPlugins(compiler, this._options, this._extraOptions);
    }

    // @ts-ignore
    const hostFederationPluginOptions: ModuleFederationPluginOptions = {
      ...this._options,
      runtime: false,
      exposes: {
        // __hoist: require.resolve('../../delegate-hoist-container'),
        ...(this._extraOptions.exposePages
          ? exposeNextjsPages(compiler.options.context as string)
          : {}),
        ...this._options.exposes,
      },
      remotes: {
        //@ts-ignore
        ...this._options.remotes,
      },
      shared: {
        ...DEFAULT_SHARE_SCOPE_BROWSER_LAZY,
        ...this._options.shared,
      },
    };

    compiler.options.devtool = 'source-map';

    compiler.options.output.uniqueName = this._options.name;

    // inject module hoisting system
    applyRemoteDelegates(this._options, compiler);
    //@ts-ignore
    if (this._extraOptions.automaticAsyncBoundary) {
      console.warn('[nextjs-mf]: automaticAsyncBoundary is deprecated');
      // applyAutomaticAsyncBoundary(this._options, this._extraOptions, compiler);
    }

    injectModuleHoistingSystem(isServer, this._options, compiler);

    //todo runtime variable creation needs to be applied for server as well. this is just for client
    // TODO: this needs to be refactored into something more comprehensive. this is just a quick fix
    new webpack.DefinePlugin({
      'process.env.REMOTES': createRuntimeVariables(this._options.remotes),
      'process.env.CURRENT_HOST': JSON.stringify(this._options.name),
    }).apply(compiler);

    // @ts-ignore
    new ModuleFederationPlugin(hostFederationPluginOptions).apply(compiler);
    // if (isServer && Object.keys(this._options?.remotes || {}).length > 0) {
    //   const commonOptions = {
    //     ...hostFederationPluginOptions,
    //     name: 'host_inner_ctn',
    //     library: {
    //       ...hostFederationPluginOptions.library,
    //       name: this._options.name,
    //     },
    //     shared: {
    //       ...hostFederationPluginOptions.shared,
    //       ...defaultShared,
    //     },
    //   };
    //
    //   const serverOptions = isServer
    //     ? {
    //         runtime: 'webpack-runtime',
    //         filename: `host_inner_ctn${this._options.name}.js`,
    //       }
    //     : {};
    //
    //   // @ts-ignore
    //   new ModuleFederationPlugin({
    //     ...commonOptions,
    //     ...serverOptions,
    //   }).apply(compiler);
    // }

    new AddRuntimeRequirementToPromiseExternal().apply(compiler);
  }
}

export default NextFederationPlugin;
