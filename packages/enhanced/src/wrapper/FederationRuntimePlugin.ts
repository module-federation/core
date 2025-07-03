import type { WebpackPluginInstance, Compiler } from 'webpack';
import type { moduleFederationPlugin } from '@module-federation/sdk';

import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const PLUGIN_NAME = 'FederationRuntimePlugin';

export default class FederationRuntimePlugin implements WebpackPluginInstance {
  private _options?: moduleFederationPlugin.ModuleFederationPluginOptions;
  name: string;
  entryFilePath: string;

  constructor(options?: moduleFederationPlugin.ModuleFederationPluginOptions) {
    this._options = options;
    this.name = PLUGIN_NAME;
    this.entryFilePath = '';
  }

  apply(compiler: Compiler) {
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] || getWebpackPath(compiler);
    const CoreFederationRuntimePlugin =
      require('../lib/container/runtime/FederationRuntimePlugin')
        .default as typeof import('../lib/container/runtime/FederationRuntimePlugin').default;
    const pluginInstance = new CoreFederationRuntimePlugin(this._options);
    pluginInstance.apply(compiler);

    this.entryFilePath = pluginInstance.entryFilePath;
  }
}
