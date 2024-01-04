import type { WebpackPluginInstance, Compiler } from 'webpack';
import type { ConsumeSharedPluginOptions } from '../declarations/plugins/sharing/ConsumeSharedPlugin';
import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const PLUGIN_NAME = 'ConsumeSharedPlugin';

export default class ConsumeSharedPlugin implements WebpackPluginInstance {
  private _options: ConsumeSharedPluginOptions;
  name: string;

  constructor(options: ConsumeSharedPluginOptions) {
    this._options = options;
    this.name = PLUGIN_NAME;
  }

  apply(compiler: Compiler) {
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] || getWebpackPath(compiler);
    const CoreConsumeSharedPlugin =
      require('../lib/sharing/ConsumeSharedPlugin')
        .default as typeof import('../lib/sharing/ConsumeSharedPlugin').default;
    new CoreConsumeSharedPlugin(this._options).apply(compiler);
  }
}
