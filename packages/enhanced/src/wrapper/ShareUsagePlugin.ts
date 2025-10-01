import type { WebpackPluginInstance, Compiler } from 'webpack';
import type { ShareUsagePluginOptions } from '../declarations/plugins/sharing/ShareUsagePlugin';
import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const PLUGIN_NAME = 'ShareUsagePlugin';

export default class ShareUsagePlugin implements WebpackPluginInstance {
  private _options: ShareUsagePluginOptions;
  name: string;

  constructor(options: ShareUsagePluginOptions = {}) {
    this._options = options;
    this.name = PLUGIN_NAME;
  }

  apply(compiler: Compiler) {
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] || getWebpackPath(compiler);

    const CoreShareUsagePlugin = require('../lib/sharing/ShareUsagePlugin')
      .default as typeof import('../lib/sharing/ShareUsagePlugin').default;

    // Important: Note that after build, we may need to fix the .default issue if it occurs
    new CoreShareUsagePlugin(this._options).apply(compiler);
  }
}
