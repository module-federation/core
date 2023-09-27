export = HarmonyExportHeaderDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class HarmonyExportHeaderDependency extends NullDependency {
  /**
   * @param {Range} range range
   * @param {Range} rangeStatement range statement
   */
  constructor(
    range: import('../javascript/JavascriptParser').Range,
    rangeStatement: import('../javascript/JavascriptParser').Range,
  );
  range: import('../javascript/JavascriptParser').Range;
  rangeStatement: import('../javascript/JavascriptParser').Range;
}
declare namespace HarmonyExportHeaderDependency {
  export {
    HarmonyExportDependencyTemplate as Template,
    ReplaceSource,
    Dependency,
    DependencyTemplateContext,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
  };
}
import NullDependency = require('./NullDependency');
declare const HarmonyExportDependencyTemplate_base: {
  new (): {
    apply(
      dependency: import('../Dependency'),
      source: any,
      templateContext: import('../DependencyTemplate').DependencyTemplateContext,
    ): void;
  };
};
declare class HarmonyExportDependencyTemplate extends HarmonyExportDependencyTemplate_base {}
type ReplaceSource = any;
type Dependency = import('../Dependency');
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
