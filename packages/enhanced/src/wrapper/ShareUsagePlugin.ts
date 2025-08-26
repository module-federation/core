import type { WebpackPluginInstance, Compiler } from 'webpack';
import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const PLUGIN_NAME = 'ShareUsagePlugin';

export interface ShareUsagePluginOptions {
  filename?: string;
}

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
    // Core implementation is JS for ease of webpack internal interop
    const Core = require('../lib/sharing/ShareUsagePlugin').default;
    new Core(this._options).apply(compiler);
  }
}
