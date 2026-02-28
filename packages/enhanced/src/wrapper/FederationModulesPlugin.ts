import type { Compilation } from 'webpack';
import BaseWrapperPlugin from './BaseWrapperPlugin';

const PLUGIN_NAME = 'FederationModulesPlugin';

export default class FederationModulesPlugin extends BaseWrapperPlugin {
  constructor() {
    super({}, PLUGIN_NAME, '../lib/container/runtime/FederationModulesPlugin');
  }

  static getCompilationHooks(compilation: Compilation) {
    const coreModule =
      require('../lib/container/runtime/FederationModulesPlugin') as {
        default?: typeof import('../lib/container/runtime/FederationModulesPlugin').default;
        getCompilationHooks?: typeof import('../lib/container/runtime/FederationModulesPlugin').default.getCompilationHooks;
      };
    const CoreFederationModulesPlugin = (coreModule.default ??
      coreModule) as typeof import('../lib/container/runtime/FederationModulesPlugin').default;
    return CoreFederationModulesPlugin.getCompilationHooks(compilation);
  }

  protected override createCorePluginInstance(
    CorePlugin: any,
    compiler: any,
  ): void {
    new CorePlugin().apply(compiler);
  }
}
