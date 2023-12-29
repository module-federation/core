import type { WebpackPluginInstance, Compiler } from 'webpack';
import type { ModuleFederationPluginOptions } from '../lib/container/ModuleFederationPluginTypes';
import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const PLUGIN_NAME = 'FederationRuntimePlugin';

export default class FederationRuntimePlugin implements WebpackPluginInstance {
  private _options: ModuleFederationPluginOptions;
  name: string;

  constructor(options: ModuleFederationPluginOptions) {
    this._options = options;
    this.name = PLUGIN_NAME;
  }

  apply(compiler: Compiler) {
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] || getWebpackPath(compiler);
    const CoreFederationRuntimePlugin =
      require('../lib/container/runtime/FederationRuntimePlugin')
        .default as typeof import('../lib/container/runtime/FederationRuntimePlugin').default;
    new CoreFederationRuntimePlugin(this._options).apply(compiler);
  }
}
