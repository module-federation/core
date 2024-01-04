import type { WebpackPluginInstance, Compiler } from 'webpack';
import type { ContainerReferencePluginOptions } from '../declarations/plugins/container/ContainerReferencePlugin';
import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const PLUGIN_NAME = 'ContainerReferencePlugin';

export default class ContainerReferencePlugin implements WebpackPluginInstance {
  private _options: ContainerReferencePluginOptions;
  name: string;

  constructor(options: ContainerReferencePluginOptions) {
    this._options = options;
    this.name = PLUGIN_NAME;
  }

  apply(compiler: Compiler) {
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] || getWebpackPath(compiler);
    const CoreContainerReferencePlugin =
      require('../lib/container/ContainerReferencePlugin')
        .default as typeof import('../lib/container/ContainerReferencePlugin').default;
    new CoreContainerReferencePlugin(this._options).apply(compiler);
  }
}
