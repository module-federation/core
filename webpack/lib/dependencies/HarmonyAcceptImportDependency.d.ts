export = HarmonyAcceptImportDependency;
declare class HarmonyAcceptImportDependency extends HarmonyImportDependency {
  /**
   * @param {string} request the request string
   */
  constructor(request: string);
}
declare namespace HarmonyAcceptImportDependency {
  let Template: {
    new (): {
      apply(
        dependency: import('../Dependency'),
        source: ReplaceSource,
        templateContext: DependencyTemplateContext,
      ): void;
    };
    getImportEmittedRuntime(
      module: Module,
      referencedModule: Module,
    ): RuntimeSpec | boolean;
  };
}
import HarmonyImportDependency = require('./HarmonyImportDependency');
