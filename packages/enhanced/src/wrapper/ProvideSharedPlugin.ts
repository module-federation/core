import type { WebpackPluginInstance, Compiler } from 'webpack';
import type { ProvideSharedPluginOptions } from '../declarations/plugins/sharing/ProvideSharedPlugin';
import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const PLUGIN_NAME = 'ProvideSharedPlugin';

export default class ProvideSharedPlugin implements WebpackPluginInstance {
  private _options: ProvideSharedPluginOptions;
  name: string;

  constructor(options: ProvideSharedPluginOptions) {
    this._options = options;
    this.name = PLUGIN_NAME;
  }

  apply(compiler: Compiler) {
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] || getWebpackPath(compiler);
    const CoreProvideSharedPlugin =
      require('../lib/sharing/ProvideSharedPlugin')
        .default as typeof import('../lib/sharing/ProvideSharedPlugin').default;
    new CoreProvideSharedPlugin(this._options).apply(compiler);
  }
}
