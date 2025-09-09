import type { WebpackPluginInstance, Compiler } from 'webpack';
import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { IndependentCompilerPluginOptions } from '../lib/sharing/treeshake/IndependentCompilerPlugin';

const PLUGIN_NAME = 'IndependentCompilerPlugin';

export default class IndependentCompilerPlugin
  implements WebpackPluginInstance
{
  private _options: IndependentCompilerPluginOptions;
  name: string;

  constructor(options: IndependentCompilerPluginOptions) {
    this._options = options;
    this.name = PLUGIN_NAME;
  }

  apply(compiler: Compiler) {
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] || getWebpackPath(compiler);
    const CoreIndependentCompilerPlugin =
      require('../lib/sharing/treeshake/IndependentCompilerPlugin')
        .default as typeof import('../lib/sharing/treeshake/IndependentCompilerPlugin').default;
    new CoreIndependentCompilerPlugin(this._options).apply(compiler);
  }
}
