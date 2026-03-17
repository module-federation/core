import type { Compilation } from 'webpack';
import BaseWrapperPlugin from './BaseWrapperPlugin';

// Use module.require instead of require to prevent bundlers (rolldown/tsdown) from
// hoisting the call to the top of the file. This ensures the require only executes
// at call time, preserving strict initialization ordering. CJS-only.
const lazyRequire = (id: string): any => module.require(id);

const PLUGIN_NAME = 'FederationModulesPlugin';

export default class FederationModulesPlugin extends BaseWrapperPlugin {
  constructor() {
    super({}, PLUGIN_NAME, '../lib/container/runtime/FederationModulesPlugin');
  }

  static getCompilationHooks(compilation: Compilation) {
    const CoreFederationModulesPlugin = lazyRequire(
      '../lib/container/runtime/FederationModulesPlugin',
    )
      .default as typeof import('../lib/container/runtime/FederationModulesPlugin').default;
    return CoreFederationModulesPlugin.getCompilationHooks(compilation);
  }

  protected override createCorePluginInstance(
    CorePlugin: any,
    compiler: any,
  ): void {
    new CorePlugin().apply(compiler);
  }
}
