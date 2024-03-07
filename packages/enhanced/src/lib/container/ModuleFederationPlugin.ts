/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra and Zackary Jackson @ScriptedAlchemy
*/

'use strict';

import type { Compiler, WebpackPluginInstance } from 'webpack';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { moduleFederationPlugin } from '@module-federation/sdk';
import SharePlugin from '../sharing/SharePlugin';
import ContainerPlugin from './ContainerPlugin';
import ContainerReferencePlugin from './ContainerReferencePlugin';
import schema from '../../schemas/container/ModuleFederationPlugin';
import FederationRuntimePlugin from './runtime/FederationRuntimePlugin';
import { StatsPlugin } from '@module-federation/manifest';
import { ContainerManager } from '@module-federation/managers';

const isValidExternalsType = require(
  normalizeWebpackPath(
    'webpack/schemas/plugins/container/ExternalsType.check.js',
  ),
) as typeof import('webpack/schemas/plugins/container/ExternalsType.check.js');

const createSchemaValidation = require(
  normalizeWebpackPath('webpack/lib/util/create-schema-validation'),
) as typeof import('webpack/lib/util/create-schema-validation');
const validate = createSchemaValidation(
  // just use schema to validate
  () => false,
  () => schema,
  {
    name: 'Module Federation Plugin',
    baseDataPath: 'options',
  },
);

class ModuleFederationPlugin implements WebpackPluginInstance {
  private _options: moduleFederationPlugin.ModuleFederationPluginOptions;
  /**
   * @param {moduleFederationPlugin.ModuleFederationPluginOptions} options options
   */
  constructor(options: moduleFederationPlugin.ModuleFederationPluginOptions) {
    validate(options);
    this._options = options;
  }

  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void {
    const { _options: options } = this;
    // @ts-ignore
    new FederationRuntimePlugin(options).apply(compiler);
    const library = options.library || { type: 'var', name: options.name };
    const remoteType =
      options.remoteType ||
      (options.library && isValidExternalsType(options.library.type)
        ? options.library.type
        : 'script');

    const useContainerPlugin =
      options.exposes &&
      (Array.isArray(options.exposes)
        ? options.exposes.length > 0
        : Object.keys(options.exposes).length > 0);

    const disableManifest = options.manifest === false;
    if (useContainerPlugin) {
      // @ts-ignore
      ContainerPlugin.patchChunkSplit(compiler, this._options.name);
    }

    if (!disableManifest && useContainerPlugin) {
      const containerManager = new ContainerManager();
      containerManager.init(options);
      options.exposes = containerManager.containerPluginExposesOptions;
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
          //@ts-ignore
          name: options.name,
          library,
          filename: options.filename,
          runtime: options.runtime,
          shareScope: options.shareScope,
          //@ts-ignore
          exposes: options.exposes,
          runtimePlugins: options.runtimePlugins,
          //@ts-ignore
        }).apply(compiler);
      }
      if (
        options.remotes &&
        (Array.isArray(options.remotes)
          ? options.remotes.length > 0
          : Object.keys(options.remotes).length > 0)
      ) {
        new ContainerReferencePlugin({
          //@ts-ignore
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
      new StatsPlugin(options, {
        pluginVersion: pkg.version,
        bundler: 'webpack',
      }).apply(compiler);
    }
  }
}

export default ModuleFederationPlugin;
