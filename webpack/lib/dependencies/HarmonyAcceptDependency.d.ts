export = HarmonyAcceptDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("./HarmonyAcceptImportDependency")} HarmonyAcceptImportDependency */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../Module").ModuleId} ModuleId */
declare class HarmonyAcceptDependency extends NullDependency {
  /**
   * @param {Range} range expression range
   * @param {HarmonyAcceptImportDependency[]} dependencies import dependencies
   * @param {boolean} hasCallback true, if the range wraps an existing callback
   */
  constructor(
    range: Range,
    dependencies: HarmonyAcceptImportDependency[],
    hasCallback: boolean,
  );
  range: import('../javascript/JavascriptParser').Range;
  dependencies: import('./HarmonyAcceptImportDependency')[];
  hasCallback: boolean;
}
declare namespace HarmonyAcceptDependency {
  export {
    HarmonyAcceptDependencyTemplate as Template,
    ReplaceSource,
    Dependency,
    DependencyTemplateContext,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    HarmonyAcceptImportDependency,
    Module,
    ModuleId,
  };
}
import NullDependency = require('./NullDependency');
declare const HarmonyAcceptDependencyTemplate_base: {
  new (): {
    apply(
      dependency: import('../Dependency'),
      source: NullDependency.ReplaceSource,
      templateContext: NullDependency.DependencyTemplateContext,
    ): void;
  };
};
declare class HarmonyAcceptDependencyTemplate extends HarmonyAcceptDependencyTemplate_base {}
type ReplaceSource = import('webpack-sources').ReplaceSource;
type Dependency = import('../Dependency');
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type HarmonyAcceptImportDependency = import('./HarmonyAcceptImportDependency');
type Module = import('../Module');
type ModuleId = import('../Module').ModuleId;
