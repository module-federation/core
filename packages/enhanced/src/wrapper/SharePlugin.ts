import type { WebpackPluginInstance, Compiler } from 'webpack';
import type { SharePluginOptions } from '../declarations/plugins/sharing/SharePlugin';
import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const PLUGIN_NAME = 'SharePlugin';

export default class SharePlugin implements WebpackPluginInstance {
  private _options: SharePluginOptions;
  name: string;

  constructor(options: SharePluginOptions) {
    this._options = options;
    this.name = PLUGIN_NAME;
  }

  apply(compiler: Compiler) {
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] || getWebpackPath(compiler);
    const CoreSharePlugin = require('../lib/sharing/SharePlugin')
      .default as typeof import('../lib/sharing/SharePlugin').default;
    new CoreSharePlugin(this._options).apply(compiler);
  }
}
