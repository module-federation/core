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
  retrieveDefaultShared,
  applyPathFixes,
  hasAppDir,
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
import { ModuleFederationPlugin } from '@module-federation/enhanced';
import path from 'path';
/**
 * NextFederationPlugin is a webpack plugin that handles Next.js application federation using Module Federation.
 */
export class NextFederationPlugin {
  private _options: ModuleFederationPluginOptions;
  private _extraOptions: NextFederationPluginExtraOptions;
  public name: string;
  /**
   * Constructs the NextFederationPlugin with the provided options.
   *
   * @param options The options to configure the plugin.
   */
  constructor(options: NextFederationPluginOptions) {
    const { mainOptions, extraOptions } = setOptions(options);
    this._options = mainOptions;
    this._extraOptions = extraOptions;
    this.name = 'ModuleFederationPlugin';
  }

  /**
   * The apply method is called by the webpack compiler and allows the plugin to hook into the webpack process.
   * @param compiler The webpack compiler object.
   */
  apply(compiler: Compiler) {
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] ||
      getWebpackPath(compiler, { framework: 'nextjs' });
    if (!this.validateOptions(compiler)) return;
    const isServer = this.isServerCompiler(compiler);
    new CopyFederationPlugin(isServer).apply(compiler);
    this.applyConditionalPlugins(compiler, isServer);
    const normalFederationPluginOptions = this.getNormalFederationPluginOptions(
      compiler,
      isServer,
    );
    // ContainerPlugin will get NextFederationPlugin._options, so NextFederationPlugin._options should be the same as normalFederationPluginOptions
    this._options = normalFederationPluginOptions;
    new ModuleFederationPlugin(normalFederationPluginOptions).apply(compiler);

    const runtimeESMPath = require.resolve(
      '@module-federation/runtime/dist/index.esm.js',
    );
    compiler.hooks.afterPlugins.tap('PatchAliasWebpackPlugin', () => {
      compiler.options.resolve.alias = {
        ...compiler.options.resolve.alias,
        '@module-federation/runtime$': runtimeESMPath,
      };
    });
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

  private getNormalFederationPluginOptions(
    compiler: Compiler,
    isServer: boolean,
  ): ModuleFederationPluginOptions {
    const defaultShared = retrieveDefaultShared(isServer);

    if (hasAppDir(compiler)) {
      // These shared deps cause issues with the appDir. Any ideas around this?
      delete defaultShared['react'];
      delete defaultShared['react/'];
      delete defaultShared['react-dom'];
      delete defaultShared['react-dom/'];
    }

    const noop = this.getNoopPath();
    return {
      ...this._options,
      runtime: false,
      remoteType: 'script',
      // @ts-ignore
      runtimePlugins: [
        require.resolve(path.join(__dirname, '../container/runtimePlugin')),
        //@ts-ignore
        ...(this._options.runtimePlugins || []),
      ],
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
}

export default NextFederationPlugin;
