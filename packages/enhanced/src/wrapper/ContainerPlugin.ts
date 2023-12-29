import type { WebpackPluginInstance, Compiler } from 'webpack';
import type { ContainerPluginOptions } from '../declarations/plugins/container/ContainerPlugin';
import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const PLUGIN_NAME = 'ContainerPlugin';

export default class ContainerPlugin implements WebpackPluginInstance {
  private _options: ContainerPluginOptions;
  name: string;

  constructor(options: ContainerPluginOptions) {
    this._options = options;
    this.name = PLUGIN_NAME;
  }

  apply(compiler: Compiler) {
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] || getWebpackPath(compiler);
    const CoreContainerPlugin = require('../lib/container/ContainerPlugin')
      .default as typeof import('../lib/container/ContainerPlugin').default;
    new CoreContainerPlugin(this._options).apply(compiler);
  }
}
