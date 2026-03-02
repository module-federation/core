import type { Compilation } from 'webpack';
import CoreFederationModulesPlugin from '../lib/container/runtime/FederationModulesPlugin';
import BaseWrapperPlugin from './BaseWrapperPlugin';

const PLUGIN_NAME = 'FederationModulesPlugin';

export default class FederationModulesPlugin extends BaseWrapperPlugin {
  constructor() {
    super({}, PLUGIN_NAME, CoreFederationModulesPlugin);
  }

  static getCompilationHooks(compilation: Compilation) {
    return CoreFederationModulesPlugin.getCompilationHooks(compilation);
  }

  protected override createCorePluginInstance(
    CorePlugin: any,
    compiler: any,
  ): void {
    new CorePlugin().apply(compiler);
  }
}
