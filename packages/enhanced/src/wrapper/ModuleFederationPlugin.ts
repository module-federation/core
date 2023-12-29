import type { WebpackPluginInstance, Compiler } from 'webpack';
import type { ModuleFederationPluginOptions } from '../lib/container/ModuleFederationPluginTypes';
import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const PLUGIN_NAME = 'ModuleFederationPlugin';

export default class ModuleFederationPlugin implements WebpackPluginInstance {
  private _options: ModuleFederationPluginOptions;
  name: string;

  constructor(options: ModuleFederationPluginOptions) {
    this._options = options;
    this.name = PLUGIN_NAME;
  }

  apply(compiler: Compiler) {
    if (!compiler.options.plugins.find((p) => p && p.name === PLUGIN_NAME)) {
      compiler.options.plugins.push(this);
    }
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] || getWebpackPath(compiler);
    const CoreModuleFederationPlugin =
      require('../lib/container/ModuleFederationPlugin')
        .default as typeof import('../lib/container/ModuleFederationPlugin').default;
    new CoreModuleFederationPlugin(this._options).apply(compiler);

    // compiler.hooks.afterPlugins.tap('WrapperModuleFederationPlugin', () => {
    // })
  }
}
