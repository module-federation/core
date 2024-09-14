import type { WebpackPluginInstance, Compiler } from 'webpack';
import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const PLUGIN_NAME = 'HoistContainerReferencesPlugin';

export default class HoistContainerReferencesPlugin
  implements WebpackPluginInstance
{
  name: string;
  private containerName: string;
  private entryFilePath?: string;
  private bundlerRuntimeDep?: string;
  private explanation: string;

  constructor(
    name?: string,
    entryFilePath?: string,
    bundlerRuntimeDep?: string,
  ) {
    this.containerName = name || 'no known chunk name';
    this.entryFilePath = entryFilePath;
    this.bundlerRuntimeDep = bundlerRuntimeDep;
    this.explanation =
      'Bundler runtime path module is required for proper functioning';
    this.name = PLUGIN_NAME;
  }

  apply(compiler: Compiler) {
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] || getWebpackPath(compiler);
    const CoreHoistContainerReferencesPlugin =
      require('../lib/container/HoistContainerReferencesPlugin')
        .default as typeof import('../lib/container/HoistContainerReferencesPlugin').default;
    new CoreHoistContainerReferencesPlugin(
      this.containerName,
      this.entryFilePath,
      this.bundlerRuntimeDep,
    ).apply(compiler);
  }
}
