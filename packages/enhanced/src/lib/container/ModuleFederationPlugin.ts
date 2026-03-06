/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra and Zackary Jackson @ScriptedAlchemy
*/

'use strict';
import { DtsPlugin } from '@module-federation/dts-plugin';
import { ContainerManager, utils } from '@module-federation/managers';
import { StatsPlugin } from '@module-federation/manifest';
import {
  bindLoggerToCompiler,
  composeKeyWithSeparator,
  type moduleFederationPlugin,
  infrastructureLogger,
} from '@module-federation/sdk';
import { PrefetchPlugin } from '@module-federation/data-prefetch/cli';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { Compiler, WebpackPluginInstance } from 'webpack';
import SharePlugin from '../sharing/SharePlugin';
import ContainerPlugin from './ContainerPlugin';
import ContainerReferencePlugin from './ContainerReferencePlugin';
import FederationRuntimePlugin from './runtime/FederationRuntimePlugin';
import StartupChunkDependenciesPlugin from '../startup/MfStartupChunkDependenciesPlugin';
import FederationModulesPlugin from './runtime/FederationModulesPlugin';
import { createSchemaValidation } from '../../utils';
import TreeShakingSharedPlugin from '../sharing/tree-shaking/TreeShakingSharedPlugin';

const isValidExternalsType = require(
  normalizeWebpackPath(
    'webpack/schemas/plugins/container/ExternalsType.check.js',
  ),
) as typeof import('webpack/schemas/plugins/container/ExternalsType.check.js');

const { ExternalsPlugin } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

const validate = createSchemaValidation(
  //eslint-disable-next-line
  require('../../schemas/container/ModuleFederationPlugin.check.js').validate,
  () => require('../../schemas/container/ModuleFederationPlugin').default,
  {
    name: 'Module Federation Plugin',
    baseDataPath: 'options',
  },
);

class ModuleFederationPlugin implements WebpackPluginInstance {
  private _options: moduleFederationPlugin.ModuleFederationPluginOptions;
  private _statsPlugin?: StatsPlugin;
  /**
   * @param {moduleFederationPlugin.ModuleFederationPluginOptions} options options
   */
  constructor(options: moduleFederationPlugin.ModuleFederationPluginOptions) {
    validate(options);
    this._options = options;
  }

  private _patchBundlerConfig(compiler: Compiler): void {
    const { name, experiments } = this._options;
    const definePluginOptions: Record<string, string | boolean> = {};

    const MFPluginNum = compiler.options.plugins.filter(
      (p): p is WebpackPluginInstance =>
        !!p && (p as any).name === 'ModuleFederationPlugin',
    ).length;

    if (name && MFPluginNum < 2) {
      definePluginOptions['FEDERATION_BUILD_IDENTIFIER'] = JSON.stringify(
        composeKeyWithSeparator(name, utils.getBuildVersion()),
      );
    }

    const disableSnapshot = experiments?.optimization?.disableSnapshot ?? false;
    definePluginOptions['FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN'] =
      disableSnapshot;

    // Determine ENV_TARGET: only if manually specified in experiments.optimization.target
    if (
      experiments?.optimization &&
      typeof experiments.optimization === 'object' &&
      experiments.optimization !== null &&
      'target' in experiments.optimization
    ) {
      const manualTarget = experiments.optimization.target as
        | 'web'
        | 'node'
        | undefined;
      // Ensure the target is one of the expected values before setting
      if (manualTarget === 'web' || manualTarget === 'node') {
        definePluginOptions['ENV_TARGET'] = JSON.stringify(manualTarget);
      }
    }
    // No inference for ENV_TARGET. If not manually set and valid, it's not defined.

    new compiler.webpack.DefinePlugin(definePluginOptions).apply(compiler);
  }

  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void {
    bindLoggerToCompiler(
      infrastructureLogger,
      compiler,
      'EnhancedModuleFederationPlugin',
    );
    const { _options: options } = this;
    const { name, experiments, dts, remotes, shared, shareScope } = options;
    if (!name) {
      // TODO: remove the comment
      throw new Error('ModuleFederationPlugin name is required');
    }
    // must before ModuleFederationPlugin
    // Use runtime require here to avoid import cycles (and to play nicely with test-time mocking).
    const { RemoteEntryPlugin } =
      require('@module-federation/rspack/remote-entry-plugin') as typeof import('@module-federation/rspack/remote-entry-plugin');
    (new RemoteEntryPlugin(options) as unknown as WebpackPluginInstance).apply(
      compiler,
    );
    const useContainerPlugin =
      options.exposes &&
      (Array.isArray(options.exposes)
        ? options.exposes.length > 0
        : Object.keys(options.exposes).length > 0);

    if (experiments?.provideExternalRuntime) {
      if (useContainerPlugin) {
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

    if (experiments?.externalRuntime === true) {
      const Externals = compiler.webpack.ExternalsPlugin || ExternalsPlugin;
      new Externals(compiler.options.externalsType || 'global', {
        '@module-federation/runtime-core': '_FEDERATION_RUNTIME_CORE',
      }).apply(compiler);
    }

    // federation hooks
    new FederationModulesPlugin().apply(compiler);

    if (experiments?.asyncStartup) {
      new StartupChunkDependenciesPlugin({
        asyncChunkLoading: true,
      }).apply(compiler);
    }

    if (dts !== false) {
      const dtsPlugin = new DtsPlugin(options);
      dtsPlugin.apply(compiler);
      dtsPlugin.addRuntimePlugins();
    }
    // TODO: REMOVE in next major version
    if (options.dataPrefetch) {
      new PrefetchPlugin(options).apply(compiler);
    }

    new FederationRuntimePlugin(options).apply(compiler);

    const library = options.library || { type: 'var', name: name };
    // Default remoteType to 'script' unless the library type itself is a
    // well-known externals type that works as a remoteType (e.g. 'var',
    // 'module'). Notably, 'umd' is excluded because it isn't a valid
    // remoteType for ContainerReferencePlugin.
    const validRemoteTypes = new Set([
      'var',
      'module',
      'assign',
      'this',
      'window',
      'self',
      'global',
      'commonjs',
      'commonjs2',
      'commonjs-module',
      'commonjs-static',
      'amd',
      'amd-require',
      'system',
      'jsonp',
      'import',
      'script',
      'node-commonjs',
      'promise',
    ]);

    const isManifestRemote = (value: unknown): boolean => {
      // Manifest remote syntax is typically: "name@http(s)://.../mf-manifest.json"
      if (typeof value !== 'string') return false;
      return /mf-manifest\.json(\?|#|$)/.test(value);
    };

    const remotesContainManifest = (() => {
      if (!remotes) return false;
      if (Array.isArray(remotes)) return remotes.some(isManifestRemote);
      // Object form: { [key]: string | ... }. Only handle string values here.
      return Object.values(remotes as Record<string, unknown>).some(
        isManifestRemote,
      );
    })();

    const remoteType = (options.remoteType ??
      (remotesContainManifest
        ? 'script'
        : options.library && validRemoteTypes.has(options.library.type)
          ? options.library.type
          : 'script')) as NonNullable<
      moduleFederationPlugin.ModuleFederationPluginOptions['remoteType']
    >;

    let disableManifest = options.manifest === false;
    if (useContainerPlugin) {
      ContainerPlugin.patchChunkSplit(compiler, name);
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
        infrastructureLogger.warn(err);
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
          name,
          library,
          filename: options.filename,
          runtime: options.runtime,
          shareScope: options.shareScope,
          exposes: options.exposes!,
          runtimePlugins: options.runtimePlugins,
        }).apply(compiler);
      }
      if (
        remotes &&
        (Array.isArray(remotes)
          ? remotes.length > 0
          : Object.keys(remotes).length > 0)
      ) {
        new ContainerReferencePlugin({
          remoteType,
          shareScope,
          remotes,
        }).apply(compiler);
      }
      if (shared) {
        new TreeShakingSharedPlugin({
          mfConfig: options,
        }).apply(compiler);
        new SharePlugin({
          shared,
          shareScope,
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
}

export default ModuleFederationPlugin;
