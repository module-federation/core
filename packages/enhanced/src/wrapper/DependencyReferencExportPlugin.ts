import type { WebpackPluginInstance, Compiler } from 'webpack';
import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { moduleFederationPlugin } from '@module-federation/sdk';
import type { CustomReferencedExports } from '../lib/sharing/treeshake/DependencyReferencExportPlugin';

const PLUGIN_NAME = 'DependencyReferencExportPlugin';

export default class DependencyReferencExportPlugin
  implements WebpackPluginInstance
{
  private _options: moduleFederationPlugin.ModuleFederationPluginOptions;
  name: string;
  customReferencedExports?: CustomReferencedExports;
  ignoredRuntime?: string[];

  constructor(
    mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
    ignoredRuntime?: string[],
    customReferencedExports?: CustomReferencedExports,
  ) {
    this._options = mfConfig;
    this.customReferencedExports = customReferencedExports;
    this.name = PLUGIN_NAME;
    this.ignoredRuntime = ignoredRuntime || [];
  }

  apply(compiler: Compiler) {
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] || getWebpackPath(compiler);
    const CoreDependencyReferencExportPlugin =
      require('../lib/sharing/treeshake/DependencyReferencExportPlugin')
        .default as typeof import('../lib/sharing/treeshake/DependencyReferencExportPlugin').default;
    new CoreDependencyReferencExportPlugin(
      this._options,
      this.ignoredRuntime,
      this.customReferencedExports,
    ).apply(compiler);
  }
}
