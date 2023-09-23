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
import type { Compiler, container } from 'webpack';
import { createRuntimeVariables } from '@module-federation/utilities';
import CopyFederationPlugin from '../CopyFederationPlugin';
import AddRuntimeRequirementToPromiseExternal from '../AddRuntimeRequirementToPromiseExternalPlugin';
import { exposeNextjsPages } from '../../loaders/nextPageMapLoader';
import {
  applyRemoteDelegates,
  getModuleFederationPluginConstructor,
  retrieveDefaultShared,
  applyPathFixes,
} from './next-fragments';
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
  private _options: ModuleFederationPluginOptions;
  private _extraOptions: NextFederationPluginExtraOptions;

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
    if (!this.validateOptions(compiler)) return;
    console.log('applying');
    const isServer = this.isServerCompiler(compiler);
    new CopyFederationPlugin(isServer).apply(compiler);

    this.applyConditionalPlugins(compiler, isServer);

    const hostFederationPluginOptions = this.getHostFederationPluginOptions(
      compiler,
      isServer,
    );
    this.applyModuleFederationPlugins(
      compiler,
      hostFederationPluginOptions,
      isServer,
    );
  }
  private validateOptions(compiler: Compiler): boolean {
    const compilerValid = validateCompilerOptions(compiler);
    const pluginValid = validatePluginOptions(this._options);

    if (compilerValid === undefined) {
      console.error('Compiler validation failed');
    }

    if (pluginValid === undefined) {
      console.error('Plugin validation failed');
    }

    return compilerValid !== undefined && pluginValid !== undefined;
  }

  private isServerCompiler(compiler: Compiler): boolean {
    return compiler.options.name === 'server';
  }

  private applyConditionalPlugins(compiler: Compiler, isServer: boolean) {
    compiler.options.output.uniqueName = this._options.name;
    if (isServer) {
      configureServerCompilerOptions(compiler);
      configureServerLibraryAndFilename(this._options);
      applyServerPlugins(compiler, this._options);
      handleServerExternals(compiler, {
        ...this._options,
        shared: { ...retrieveDefaultShared(isServer), ...this._options.shared },
      });
    } else {
      applyClientPlugins(compiler, this._options, this._extraOptions);
    }
  }

  private getHostFederationPluginOptions(
    compiler: Compiler,
    isServer: boolean,
  ): ModuleFederationPluginOptions {
    const defaultShared = retrieveDefaultShared(isServer);
    const noop = this.getNoopPath();
    return {
      ...this._options,
      runtime: false,
      remoteType: 'script',
      exposes: {
        './noop': noop,
        ...this._options.exposes,
      },
      remotes: {
        ...this._options.remotes,
      },
      shared: {
        ...defaultShared,
        ...this._options.shared,
      },
    };
  }

  private getNoopPath(): string {
    let noop;
    try {
      noop = require.resolve('../../federation-noop');
    } catch (e) {
      noop = require.resolve('../../federation-noop.cjs');
    }
    return noop;
  }

  private applyModuleFederationPlugins(
    compiler: Compiler,
    hostFederationPluginOptions: ModuleFederationPluginOptions,
    isServer: boolean,
  ) {
    const ModuleFederationPlugin = getModuleFederationPluginConstructor(
      isServer,
      compiler,
    );
    const commonOptions = {
      ...hostFederationPluginOptions,
      name: 'host_inner_ctn',
      runtime: isServer ? 'webpack-runtime' : 'webpack',
      filename: `host_inner_ctn.js`,
      remoteType: 'script',
      library: {
        ...hostFederationPluginOptions.library,
        name: this._options.name,
      },
    };

    if (!isServer) {
      new ModuleFederationPlugin({
        ...hostFederationPluginOptions,
        shared: {
          // "next/":{
          //   singleton: true,
          // },
          'react/': {
            singleton: true,
            requiredVersion: false,
          },
          react: {
            singleton: true,
            requiredVersion: false,
          },
          'react-dom': {
            singleton: true,
            requiredVersion: false,
          },
          'react-dom/': {
            eager: false,
            singleton: true,
            requiredVersion: false,
          },
        },
      }).apply(compiler);
      //@ts-ignore
      new ModuleFederationPlugin({
        ...commonOptions,
        shared: {
          // "next/":{
          //   singleton: true,
          // },
          'react/': {
            singleton: true,
            requiredVersion: false,
          },
          react: {
            singleton: true,
            requiredVersion: false,
          },
          'react-dom': {
            singleton: true,
            requiredVersion: false,
          },
          'react-dom/': {
            eager: false,
            singleton: true,
            requiredVersion: false,
          },
        },
      }).apply(compiler);
      return;
    }
    new ModuleFederationPlugin(
      commonOptions,
      //@ts-ignore
      isServer
        ? {ModuleFederationPlugin: require('@module-federation/enhanced/src/lib/container/ModuleFederationPlugin').default}
        : undefined,
    ).apply(compiler);

    if (!isServer) {
      // console.log(hostFederationPluginOptions.shared);
    }

    new ModuleFederationPlugin(
      {
        ...hostFederationPluginOptions,
        //@ts-ignore
        shared: Object.keys(hostFederationPluginOptions.shared).reduce(
          (acc, key) => ({
            ...acc,
            //@ts-ignore
            [key]: { ...hostFederationPluginOptions.shared[key], eager: false },
          }),
          {},
        ),
      },
      //@ts-ignore
      isServer
      ? {ModuleFederationPlugin: require('@module-federation/enhanced/src/lib/container/ModuleFederationPlugin').default}
      : undefined,
    ).apply(compiler);
  }
}

/**
 * Exporting NextFederationPlugin as default
 */
export default NextFederationPlugin;
