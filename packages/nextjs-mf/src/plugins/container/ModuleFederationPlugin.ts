/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra and Zackary Jackson @ScriptedAlchemy
*/

'use strict';

import { Compiler } from 'webpack';
const isValidExternalsType = require('webpack/schemas/plugins/container/ExternalsType.check.js');
const SharePlugin =
  require('@module-federation/enhanced/src/lib/sharing/SharePlugin').default;
const createSchemaValidation = require('webpack/lib/util/create-schema-validation');
const ContainerPlugin =
  require('@module-federation/enhanced/src/lib/container/ContainerPlugin').default;
const ContainerReferencePlugin =
  require('@module-federation/enhanced/src/lib/container/ContainerReferencePlugin').default;

/** @typedef {import("./ModuleFederationPluginTypes").ExternalsType} ExternalsType */
/** @typedef {import("./ModuleFederationPluginTypes").any} any */
/** @typedef {import("./ModuleFederationPluginTypes").Shared} Shared */
/** @typedef {import("webpack/lib/Compiler")} Compiler */

const validate = createSchemaValidation(
  //eslint-disable-next-line
  require('webpack/schemas/plugins/container/ModuleFederationPlugin.check.js'),
  () =>
    require('webpack/schemas/plugins/container/ModuleFederationPlugin.json'),
  {
    name: 'Module Federation Plugin',
    baseDataPath: 'options',
  },
);

class ModuleFederationPlugin {
  private _mainOptions: any;
  private _embeddedOptions: any;
  /**
   * @param {any} mainOptions main options
   * @param {any} embeddedOptions embedded options
   */
  constructor(mainOptions: any, embeddedOptions: any) {
    validate(mainOptions);
    validate(embeddedOptions);

    this._mainOptions = mainOptions;
    this._embeddedOptions = embeddedOptions;
  }

  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void {
    const { _mainOptions: mainOptions, _embeddedOptions: embeddedOptions } =
      this;
    const library = mainOptions.library || {
      type: 'var',
      name: mainOptions.name,
    };
    const remoteType =
      mainOptions.remoteType ||
      (mainOptions.library && isValidExternalsType(mainOptions.library.type)
        ? mainOptions.library.type
        : 'script');
    if (
      library &&
      !compiler.options.output.enabledLibraryTypes?.includes(library.type)
    ) {
      compiler.options.output.enabledLibraryTypes?.push(library.type);
    }
    compiler.hooks.afterPlugins.tap('ModuleFederationPlugin', () => {
      if (
        mainOptions.exposes &&
        (Array.isArray(mainOptions.exposes)
          ? mainOptions.exposes.length > 0
          : Object.keys(mainOptions.exposes).length > 0)
      ) {
        new ContainerPlugin({
          //@ts-ignore
          name: mainOptions.name,
          library,
          filename: mainOptions.filename,
          runtime: mainOptions.runtime,
          shareScope: mainOptions.shareScope,
          exposes: mainOptions.exposes,
        }).apply(compiler);
        new ContainerPlugin({
          //@ts-ignore
          name: embeddedOptions.name,
          library,
          filename: embeddedOptions.filename,
          runtime: embeddedOptions.runtime,
          shareScope: embeddedOptions.shareScope,
          exposes: mainOptions.exposes,
        }).apply(compiler);
      }
      if (
        mainOptions.remotes &&
        (Array.isArray(mainOptions.remotes)
          ? mainOptions.remotes.length > 0
          : Object.keys(mainOptions.remotes).length > 0)
      ) {
        new ContainerReferencePlugin({
          //@ts-ignore
          remoteType,
          shareScope: mainOptions.shareScope,
          remotes: mainOptions.remotes,
        }).apply(compiler);
      }
      if (embeddedOptions.shared) {
        new SharePlugin({
          shared: embeddedOptions.shared,
          shareScope: embeddedOptions.shareScope,
        }).apply(compiler);
      }
    });
  }
}

export default ModuleFederationPlugin;
