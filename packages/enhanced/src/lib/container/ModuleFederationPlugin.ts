/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra and Zackary Jackson @ScriptedAlchemy
*/

'use strict';

import type { Compiler, WebpackPluginInstance } from 'webpack';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import isValidExternalsType from 'webpack/schemas/plugins/container/ExternalsType.check.js';
import type { ModuleFederationPluginOptions } from './ModuleFederationPluginTypes';
import SharePlugin from '../sharing/SharePlugin';
import ContainerPlugin from './ContainerPlugin';
import ContainerReferencePlugin from './ContainerReferencePlugin';
import checkOptions from '../../schemas/container/ModuleFederationPlugin.check';
import schema from '../../schemas/container/ModuleFederationPlugin';
import FederationRuntimePlugin from './runtime/FederationRuntimePlugin';

const createSchemaValidation = require(
  normalizeWebpackPath('webpack/lib/util/create-schema-validation'),
) as typeof import('webpack/lib/util/create-schema-validation');
const validate = createSchemaValidation(
  //eslint-disable-next-line
  checkOptions,
  () => schema,
  {
    name: 'Module Federation Plugin',
    baseDataPath: 'options',
  },
);

class ModuleFederationPlugin implements WebpackPluginInstance {
  private _options: ModuleFederationPluginOptions;
  /**
   * @param {ModuleFederationPluginOptions} options options
   */
  constructor(options: ModuleFederationPluginOptions) {
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
    if (useContainerPlugin) {
      // @ts-ignore
      ContainerPlugin.patchChunkSplit(compiler, this._options.name);
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
  }
}

export default ModuleFederationPlugin;
