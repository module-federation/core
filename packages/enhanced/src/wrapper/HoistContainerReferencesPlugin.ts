import type { WebpackPluginInstance, Compiler } from 'webpack';
import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { moduleFederationPlugin } from '@module-federation/sdk';

const PLUGIN_NAME = 'HoistContainerReferencesPlugin';

export default class HoistContainerReferencesPlugin
  implements WebpackPluginInstance
{
  name: string;
  private readonly experiments: moduleFederationPlugin.ModuleFederationPluginOptions['experiments'];

  constructor(
    experiments?: moduleFederationPlugin.ModuleFederationPluginOptions['experiments'],
  ) {
    this.experiments = experiments;
    this.name = PLUGIN_NAME;
  }

  apply(compiler: Compiler) {
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] || getWebpackPath(compiler);
    const CoreHoistContainerReferencesPlugin =
      require('../lib/container/HoistContainerReferencesPlugin')
        .default as typeof import('../lib/container/HoistContainerReferencesPlugin').default;
    new CoreHoistContainerReferencesPlugin(this.experiments).apply(compiler);
  }
}
