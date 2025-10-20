import type { WebpackPluginInstance, Compiler } from 'webpack';
import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { IndependentSharePluginOptions } from '../lib/sharing/treeshake/IndependentSharePlugin';

const PLUGIN_NAME = 'IndependentSharePlugin';

export default class IndependentSharePlugin implements WebpackPluginInstance {
  private _options: IndependentSharePluginOptions;
  name: string;

  constructor(options: IndependentSharePluginOptions) {
    this._options = options;
    this.name = PLUGIN_NAME;
  }

  apply(compiler: Compiler) {
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] || getWebpackPath(compiler);
    const CoreIndependentSharePlugin =
      require('../lib/sharing/treeshake/IndependentSharePlugin')
        .default as typeof import('../lib/sharing/treeshake/IndependentSharePlugin').default;
    new CoreIndependentSharePlugin(this._options).apply(compiler);
  }
}
