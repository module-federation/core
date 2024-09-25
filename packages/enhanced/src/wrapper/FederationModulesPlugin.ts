import type { WebpackPluginInstance, Compiler, Compilation } from 'webpack';
import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const PLUGIN_NAME = 'FederationModulesPlugin';

export default class FederationModulesPlugin implements WebpackPluginInstance {
  name: string;

  constructor() {
    this.name = PLUGIN_NAME;
  }

  static getCompilationHooks(compilation: Compilation) {
    const CoreFederationModulesPlugin =
      require('../lib/container/runtime/FederationModulesPlugin')
        .default as typeof import('../lib/container/runtime/FederationModulesPlugin').default;
    return CoreFederationModulesPlugin.getCompilationHooks(compilation);
  }

  apply(compiler: Compiler) {
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] || getWebpackPath(compiler);
    const CoreFederationModulesPlugin =
      require('../lib/container/runtime/FederationModulesPlugin')
        .default as typeof import('../lib/container/runtime/FederationModulesPlugin').default;
    new CoreFederationModulesPlugin().apply(compiler);
  }
}
