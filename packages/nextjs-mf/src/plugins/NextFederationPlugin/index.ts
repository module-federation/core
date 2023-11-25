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
} from '@module-federation/utilities';
import type { Compiler } from 'webpack';
import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import CopyFederationPlugin from '../CopyFederationPlugin';
import { exposeNextjsPages } from '../../loaders/nextPageMapLoader';
import {
  getModuleFederationPluginConstructor,
  retrieveDefaultShared,
  applyPathFixes,
} from './next-fragments';
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
    process.env['FEDERATION_WEBPACK_PATH'] = getWebpackPath(compiler);
    if (!this.validateOptions(compiler)) return;
    const isServer = this.isServerCompiler(compiler);
    //@ts-ignore
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
    const envValid = process.env['NEXT_PRIVATE_LOCAL_WEBPACK'];
    if (compilerValid === undefined)
      console.error('Compiler validation failed');
    if (pluginValid === undefined) console.error('Plugin validation failed');
    const validCompilerTarget =
      compiler.options.name === 'server' || compiler.options.name === 'client';
    if (!envValid)
      throw new Error(
        'process.env.NEXT_PRIVATE_LOCAL_WEBPACK is not set to true, please set it to true, and "npm install webpack"',
      );
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
    applyPathFixes(compiler, this._extraOptions);
    if (this._extraOptions.debug) {
      compiler.options.devtool = false;
    }
    if (isServer) {
      //@ts-ignore
      configureServerCompilerOptions(compiler);
      configureServerLibraryAndFilename(this._options);
      //@ts-ignore
      applyServerPlugins(compiler, this._options);
      //@ts-ignore
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
        './react': require.resolve('react'),
        './react-dom': require.resolve('react-dom'),
        './next/router': require.resolve('next/router'),
        ...this._options.exposes,
        ...(this._extraOptions.exposePages
          ? exposeNextjsPages(compiler.options.context as string)
          : {}),
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

  private applyClientFederationPlugins(
    compiler: Compiler,
    normalFederationPluginOptions: ModuleFederationPluginOptions,
  ) {
    const embeddedOptions = this.createEmbeddedOptions(
      normalFederationPluginOptions,
    );
    new ModuleFederationNextFork(
      normalFederationPluginOptions,
      //@ts-ignore
      embeddedOptions,
    ).apply(compiler);
  }

  private applyServerFederationPlugins(
    compiler: Compiler,
    normalFederationPluginOptions: ModuleFederationPluginOptions,
  ) {
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
    if (!isServer) {
      this.applyClientFederationPlugins(
        compiler,
        normalFederationPluginOptions,
      );
    } else {
      this.applyServerFederationPlugins(
        compiler,
        normalFederationPluginOptions,
      );
    }
  }
}

export default NextFederationPlugin;
