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
import type Compiler from 'webpack/lib/Compiler';
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
import InvertedContainerPlugin from '../container/InvertedContainerPlugin';
import ModuleFederationNextFork from '../container/ModuleFederationPlugin';
import { parseRemotes } from '@module-federation/node';
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
    const isServer = this.isServerCompiler(compiler);
    new CopyFederationPlugin(isServer).apply(compiler);
    this.applyConditionalPlugins(compiler, isServer);
    const normalFederationPluginOptions = this.getNormalFederationPluginOptions(
      compiler,
      isServer,
    );
    this.applyModuleFederationPlugins(
      compiler,
      normalFederationPluginOptions,
      isServer,
    );
  }

  private validateOptions(compiler: Compiler): boolean {
    const compilerValid = validateCompilerOptions(compiler);
    const pluginValid = validatePluginOptions(this._options);
    if (compilerValid === undefined)
      console.error('Compiler validation failed');
    if (pluginValid === undefined) console.error('Plugin validation failed');
    const validCompilerTarget =
      compiler.options.name === 'server' || compiler.options.name === 'client';
    return (
      compilerValid !== undefined &&
      pluginValid !== undefined &&
      validCompilerTarget
    );
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
      //@ts-ignore
      applyClientPlugins(compiler, this._options, this._extraOptions);
    }
  }

  private getNormalFederationPluginOptions(
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

  private createEmbeddedOptions(
    normalFederationPluginOptions: ModuleFederationPluginOptions,
    isServer?: boolean,
  ) {
    return {
      ...normalFederationPluginOptions,
      name: 'host_inner_ctn',
      runtime: isServer ? 'webpack-runtime' : 'webpack',
      filename: `host_inner_ctn.js`,
      remoteType: 'script',
      library: {
        ...normalFederationPluginOptions.library,
        name: 'host_inner_ctn',
      },
    };
  }

  private createSharedOptions() {
    return {
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
    };
  }

  private applyClientFederationPlugins(
    compiler: Compiler,
    normalFederationPluginOptions: ModuleFederationPluginOptions,
    sharedOptions: any,
    ModuleFederationPlugin: any,
  ) {
    const embeddedOptions = this.createEmbeddedOptions(
      normalFederationPluginOptions,
    );
    new ModuleFederationPlugin({
      ...normalFederationPluginOptions,
      shared: sharedOptions,
    }).apply(compiler);
    new ModuleFederationPlugin({
      ...embeddedOptions,
      shared: sharedOptions,
    }).apply(compiler);
  }

  private applyServerFederationPlugins(
    compiler: Compiler,
    normalFederationPluginOptions: ModuleFederationPluginOptions,
    ModuleFederationPluginConstructor: any,
    ModuleFederationPlugin: any,
  ) {
    console.log('apply server federation');
    const embeddedOptions = this.createEmbeddedOptions(
      normalFederationPluginOptions,
      true,
    );

    //@ts-ignore
    const serverSharedOptions = Object.keys(
      //@ts-ignore
      normalFederationPluginOptions.shared,
    ).reduce(
      (acc, key) => ({
        ...acc,
        //@ts-ignore
        [key]: { ...normalFederationPluginOptions.shared[key], eager: false },
      }),
      {},
    );
    const mainOptions = {
      ...normalFederationPluginOptions,
      shared: serverSharedOptions,
    };
    //@ts-ignore

    const prepareRemote = (options) => {
      return {
        ...options,
        remotes: options.remotes
          ? parseRemotes(options.remotes as Record<string, any>)
          : {},
      };
    };
    //@ts-ignore
    new ModuleFederationNextFork(
      prepareRemote(mainOptions),
      prepareRemote(embeddedOptions),
    ).apply(compiler);
    // new ModuleFederationPlugin(
    //   embeddedOptions,
    //   ModuleFederationPluginConstructor,
    // ).apply(compiler);
    // new ModuleFederationPlugin(
    //   { ...normalFederationPluginOptions, shared: serverSharedOptions },
    //   ModuleFederationPluginConstructor,
    // ).apply(compiler);
  }

  private applyModuleFederationPlugins(
    compiler: Compiler,
    normalFederationPluginOptions: ModuleFederationPluginOptions,
    isServer: boolean,
  ) {
    const ModuleFederationPlugin = getModuleFederationPluginConstructor(
      isServer,
      compiler,
    );
    const sharedOptions = this.createSharedOptions();
    if (!isServer) {
      this.applyClientFederationPlugins(
        compiler,
        normalFederationPluginOptions,
        sharedOptions,
        ModuleFederationPlugin,
      );
    } else {
      this.applyServerFederationPlugins(
        compiler,
        normalFederationPluginOptions,
        ModuleFederationPlugin,
        ModuleFederationPlugin,
      );
    }
  }
}

export default NextFederationPlugin;
