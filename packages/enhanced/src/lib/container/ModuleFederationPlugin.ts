/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra and Zackary Jackson @ScriptedAlchemy
*/

'use strict';
import { DtsPlugin } from '@module-federation/dts-plugin';
import { ContainerManager, utils } from '@module-federation/managers';
import { StatsPlugin } from '@module-federation/manifest';
import {
  composeKeyWithSeparator,
  type moduleFederationPlugin,
  logger,
} from '@module-federation/sdk';
import { PrefetchPlugin } from '@module-federation/data-prefetch/cli';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { Compiler, WebpackPluginInstance } from 'webpack';
import SharePlugin from '../sharing/SharePlugin';
import ContainerPlugin from './ContainerPlugin';
import ContainerReferencePlugin from './ContainerReferencePlugin';
import FederationRuntimePlugin from './runtime/FederationRuntimePlugin';
import { RemoteEntryPlugin } from './runtime/RemoteEntryPlugin';
import { ExternalsType } from 'webpack/declarations/WebpackOptions';
import StartupChunkDependenciesPlugin from '../startup/MfStartupChunkDependenciesPlugin';
import FederationModulesPlugin from './runtime/FederationModulesPlugin';

const isValidExternalsType = require(
  normalizeWebpackPath(
    'webpack/schemas/plugins/container/ExternalsType.check.js',
  ),
) as typeof import('webpack/schemas/plugins/container/ExternalsType.check.js');

const { ExternalsPlugin } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

class ModuleFederationPlugin implements WebpackPluginInstance {
  private _options: moduleFederationPlugin.ModuleFederationPluginOptions;
  private _statsPlugin?: StatsPlugin;
  /**
   * @param {moduleFederationPlugin.ModuleFederationPluginOptions} options options
   */
  constructor(options: moduleFederationPlugin.ModuleFederationPluginOptions) {
    this._options = options;
  }

  private _patchBundlerConfig(compiler: Compiler): void {
    const { name } = this._options;
    const MFPluginNum = compiler.options.plugins.filter(
      (p): p is WebpackPluginInstance =>
        !!p && (p as any).name === 'ModuleFederationPlugin',
    ).length;
    if (name && MFPluginNum < 2) {
      new compiler.webpack.DefinePlugin({
        FEDERATION_BUILD_IDENTIFIER: JSON.stringify(
          composeKeyWithSeparator(name, utils.getBuildVersion()),
        ),
      }).apply(compiler);
    }
  }

  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void {
    const { _options: options } = this;
    // must before ModuleFederationPlugin
    if (options.getPublicPath && options.name) {
      new RemoteEntryPlugin(options.name, options.getPublicPath).apply(
        compiler,
      );
    }
    if (options.experiments?.provideExternalRuntime) {
      if (options.exposes) {
        throw new Error(
          'You can only set provideExternalRuntime: true in pure consumer which not expose modules.',
        );
      }
      const runtimePlugins = options.runtimePlugins || [];
      options.runtimePlugins = runtimePlugins.concat(
        require.resolve(
          '@module-federation/inject-external-runtime-core-plugin',
        ),
      );
    }

    if (options.experiments?.externalRuntime === true) {
      const Externals = compiler.webpack.ExternalsPlugin || ExternalsPlugin;
      new Externals(compiler.options.externalsType || 'global', {
        '@module-federation/runtime-core': '_FEDERATION_RUNTIME_CORE',
      }).apply(compiler);
    }

    if (options.experiments?.federationRuntime) {
      new FederationModulesPlugin().apply(compiler);
      new StartupChunkDependenciesPlugin({
        asyncChunkLoading: true,
      }).apply(compiler);
    }

    if (options.dts !== false) {
      new DtsPlugin(options).apply(compiler);
    }
    if (options.dataPrefetch) {
      new PrefetchPlugin(options).apply(compiler);
    }

    new FederationRuntimePlugin(options).apply(compiler);

    const library = options.library || { type: 'var', name: options.name };
    const remoteType =
      options.remoteType ||
      (options.library && isValidExternalsType(options.library.type)
        ? (options.library.type as ExternalsType)
        : ('script' as ExternalsType));

    const useContainerPlugin =
      options.exposes &&
      (Array.isArray(options.exposes)
        ? options.exposes.length > 0
        : Object.keys(options.exposes).length > 0);

    let disableManifest = options.manifest === false;
    if (useContainerPlugin) {
      ContainerPlugin.patchChunkSplit(compiler, this._options.name!);
    }
    this._patchBundlerConfig(compiler);
    if (!disableManifest && useContainerPlugin) {
      try {
        const containerManager = new ContainerManager();
        containerManager.init(options);
        options.exposes = containerManager.containerPluginExposesOptions;
      } catch (err) {
        if (err instanceof Error) {
          err.message = `[ ModuleFederationPlugin ]: Manifest will not generate, because: ${err.message}`;
        }
        logger.warn(err);
        disableManifest = true;
      }
    }

    if (
      library &&
      !compiler.options.output.enabledLibraryTypes?.includes(library.type)
    ) {
      compiler.options.output.enabledLibraryTypes?.push(library.type);
    }

    compiler.hooks.afterPlugins.tap('ModuleFederationPlugin', () => {
      if (useContainerPlugin) {
        new ContainerPlugin({
          name: options.name!,
          library,
          filename: options.filename,
          runtime: options.runtime,
          shareScope: options.shareScope,
          exposes: options.exposes!,
          runtimePlugins: options.runtimePlugins,
          experiments: options.experiments,
        }).apply(compiler);
      }
      if (
        options.remotes &&
        (Array.isArray(options.remotes)
          ? options.remotes.length > 0
          : Object.keys(options.remotes).length > 0)
      ) {
        new ContainerReferencePlugin({
          remoteType,
          shareScope: options.shareScope,
          remotes: options.remotes,
        }).apply(compiler);
      }
      if (options.shared) {
        new SharePlugin({
          shared: options.shared,
          shareScope: options.shareScope,
        }).apply(compiler);
      }
    });

    if (!disableManifest) {
      const pkg = require('../../../../package.json');
      this._statsPlugin = new StatsPlugin(options, {
        pluginVersion: pkg.version,
        bundler: 'webpack',
      });
      this._statsPlugin.apply(compiler);
    }
  }

  get statsResourceInfo() {
    return this._statsPlugin?.resourceInfo;
  }
}

export default ModuleFederationPlugin;
