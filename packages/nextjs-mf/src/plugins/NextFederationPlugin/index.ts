/**
 * MIT License http://www.opensource.org/licenses/mit-license.php
 * Author Zackary Jackson @ScriptedAlchemy
 * This module contains the NextFederationPlugin class which is a webpack plugin that handles Next.js application federation using Module Federation.
 */
'use strict';

import type {
  NextFederationPluginExtraOptions,
  NextFederationPluginOptions,
} from './next-fragments';
import type { Compiler, WebpackPluginInstance } from 'webpack';
import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import CopyFederationPlugin from '../CopyFederationPlugin';
import { exposeNextjsPages } from '../../loaders/nextPageMapLoader';
import { retrieveDefaultShared, applyPathFixes } from './next-fragments';
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
import { ModuleFederationPlugin } from '@module-federation/enhanced/webpack';
import type { moduleFederationPlugin } from '@module-federation/sdk';

import path from 'path';
/**
 * NextFederationPlugin is a webpack plugin that handles Next.js application federation using Module Federation.
 */
export class NextFederationPlugin {
  private _options: moduleFederationPlugin.ModuleFederationPluginOptions;
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
    const normalFederationPluginOptions = this.getNormalFederationPluginOptions(
      compiler,
      isServer,
    );
    this._options = normalFederationPluginOptions;
    this.applyConditionalPlugins(compiler, isServer);

    new ModuleFederationPlugin(normalFederationPluginOptions).apply(compiler);

    const noop = this.getNoopPath();

    if (!this._extraOptions.skipSharingNextInternals) {
      compiler.hooks.make.tapAsync(
        'NextFederationPlugin',
        (compilation, callback) => {
          const dep = compiler.webpack.EntryPlugin.createDependency(
            noop,
            'noop',
          );
          compilation.addEntry(
            compiler.context,
            dep,
            { name: 'noop' },
            (err, module) => {
              if (err) {
                return callback(err);
              }
              callback();
            },
          );
        },
      );
    }

    if (!compiler.options.ignoreWarnings) {
      compiler.options.ignoreWarnings = [
        //@ts-ignore
        (message) => /your target environment does not appear/.test(message),
      ];
    }
  }

  private validateOptions(compiler: Compiler): boolean {
    const manifestPlugin = compiler.options.plugins.find(
      (p): p is WebpackPluginInstance =>
        p?.constructor?.name === 'BuildManifestPlugin',
    );

    if (manifestPlugin) {
      //@ts-ignore
      if (manifestPlugin?.appDirEnabled) {
        throw new Error(
          'App Directory is not supported by nextjs-mf. Use only pages directory, do not open git issues about this',
        );
      }
    }

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
    compiler.options.output.environment = {
      ...compiler.options.output.environment,
      asyncFunction: true,
    };

    // Add layer rules for resource queries
    if (!compiler.options.module.rules) {
      compiler.options.module.rules = [];
    }

    // Add layer rules for RSC, client and SSR
    compiler.options.module.rules.push({
      resourceQuery: /\?rsc/,
      layer: 'rsc',
    });

    compiler.options.module.rules.push({
      resourceQuery: /\?client/,
      layer: 'client',
    });

    compiler.options.module.rules.push({
      resourceQuery: /\?ssr/,
      layer: 'ssr',
    });

    applyPathFixes(compiler, this._options, this._extraOptions);
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
  ): moduleFederationPlugin.ModuleFederationPluginOptions {
    const defaultShared = this._extraOptions.skipSharingNextInternals
      ? {}
      : retrieveDefaultShared(isServer);

    return {
      ...this._options,
      runtime: false,
      remoteType: 'script',
      runtimePlugins: [
        ...(isServer
          ? [require.resolve('@module-federation/node/runtimePlugin')]
          : []),
        require.resolve(path.join(__dirname, '../container/runtimePlugin.cjs')),
        ...(this._options.runtimePlugins || []),
      ].map((plugin) => plugin + '?runtimePlugin'),
      //@ts-ignore
      exposes: {
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
      ...(isServer
        ? { manifest: { filePath: '' } }
        : { manifest: { filePath: '/static/chunks' } }),
      // nextjs project needs to add config.watchOptions = ['**/node_modules/**', '**/@mf-types/**'] to prevent loop types update
      dts: this._options.dts ?? false,
      shareStrategy: this._options.shareStrategy ?? 'loaded-first',
      experiments: {
        asyncStartup: true,
      },
    };
  }

  private getNoopPath(): string {
    return require.resolve('../../federation-noop.cjs');
  }
}

export default NextFederationPlugin;
