import type { WebpackPluginInstance, Compiler } from 'webpack';
import type { Options } from '../lib/container/AsyncBoundaryPlugin';
import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const PLUGIN_NAME = 'AsyncBoundaryPlugin';

export default class AsyncBoundaryPlugin implements WebpackPluginInstance {
  private _options: Options;
  name: string;

  constructor(options: Options) {
    this._options = options;
    this.name = PLUGIN_NAME;
  }

  apply(compiler: Compiler) {
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] || getWebpackPath(compiler);
    const CoreAsyncBoundaryPlugin =
      require('../lib/container/AsyncBoundaryPlugin')
        .default as typeof import('../lib/container/AsyncBoundaryPlugin').default;
    new CoreAsyncBoundaryPlugin(this._options).apply(compiler);
  }
}
