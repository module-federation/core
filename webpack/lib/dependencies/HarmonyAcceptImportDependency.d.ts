export = HarmonyAcceptImportDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
declare class HarmonyAcceptImportDependency extends HarmonyImportDependency {
  /**
   * @param {string} request the request string
   */
  constructor(request: string);
}
declare namespace HarmonyAcceptImportDependency {
  export { Template, ReplaceSource, Dependency, DependencyTemplateContext };
}
import HarmonyImportDependency = require('./HarmonyImportDependency');
declare var Template: {
  new (): {
    apply(
      dependency: import('../Dependency'),
      source: any,
      templateContext: import('../DependencyTemplate').DependencyTemplateContext,
    ): void;
  };
  getImportEmittedRuntime(
    module: import('../Module'),
    referencedModule: import('../Module'),
  ): boolean | import('../util/runtime').RuntimeSpec;
};
type ReplaceSource = any;
type Dependency = import('../Dependency');
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
