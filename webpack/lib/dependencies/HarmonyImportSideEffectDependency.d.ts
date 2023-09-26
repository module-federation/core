export = HarmonyImportSideEffectDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../ModuleGraphConnection")} ModuleGraphConnection */
/** @typedef {import("../ModuleGraphConnection").ConnectionState} ConnectionState */
/** @typedef {import("../javascript/JavascriptParser").Assertions} Assertions */
/** @typedef {import("../util/Hash")} Hash */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
declare class HarmonyImportSideEffectDependency extends HarmonyImportDependency {
  /**
   * @param {TODO} request the request string
   * @param {number} sourceOrder source order
   * @param {Assertions=} assertions assertions
   */
  constructor(
    request: TODO,
    sourceOrder: number,
    assertions?: Assertions | undefined,
  );
}
declare namespace HarmonyImportSideEffectDependency {
  export {
    HarmonyImportSideEffectDependencyTemplate as Template,
    ReplaceSource,
    Dependency,
    DependencyTemplateContext,
    Module,
    ModuleGraph,
    ModuleGraphConnection,
    ConnectionState,
    Assertions,
    Hash,
    RuntimeSpec,
  };
}
import HarmonyImportDependency = require('./HarmonyImportDependency');
type Assertions = import('../javascript/JavascriptParser').Assertions;
declare const HarmonyImportSideEffectDependencyTemplate_base: {
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
declare class HarmonyImportSideEffectDependencyTemplate extends HarmonyImportSideEffectDependencyTemplate_base {}
type ReplaceSource = any;
type Dependency = import('../Dependency');
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type Module = import('../Module');
type ModuleGraph = import('../ModuleGraph');
type ModuleGraphConnection = import('../ModuleGraphConnection');
type ConnectionState = import('../ModuleGraphConnection').ConnectionState;
type Hash = import('../util/Hash');
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
