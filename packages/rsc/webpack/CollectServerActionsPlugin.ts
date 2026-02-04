import type { Compilation, Compiler } from 'webpack';
import {
  getRegistryKey,
  setServerActionModules,
} from './serverActionsRegistry';
import {
  collectServerActionModules,
  getServerReferencesMap,
} from './serverActionUtils';

export default class CollectServerActionsPlugin {
  constructor(_options = {}) {}

  apply(compiler: Compiler) {
    compiler.hooks.beforeCompile.tap('CollectServerActionsPlugin', () => {
      const serverReferencesMap = getServerReferencesMap(compiler);
      if (
        serverReferencesMap &&
        typeof serverReferencesMap.clear === 'function'
      ) {
        serverReferencesMap.clear();
      }
    });

    compiler.hooks.thisCompilation.tap(
      'CollectServerActionsPlugin',
      (compilation: Compilation) => {
        compilation.hooks.finishModules.tap(
          'CollectServerActionsPlugin',
          () => {
            const serverReferencesMap = getServerReferencesMap(compiler);
            const modules = collectServerActionModules(serverReferencesMap);

            setServerActionModules(getRegistryKey(compiler), modules);
          },
        );
      },
    );
  }
}
