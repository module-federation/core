export = HarmonyAcceptDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("./HarmonyAcceptImportDependency")} HarmonyAcceptImportDependency */
declare class HarmonyAcceptDependency extends NullDependency {
  /**
   * @param {Range} range expression range
   * @param {HarmonyAcceptImportDependency[]} dependencies import dependencies
   * @param {boolean} hasCallback true, if the range wraps an existing callback
   */
  constructor(
    range: import('../javascript/JavascriptParser').Range,
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
  };
}
import NullDependency = require('./NullDependency');
type HarmonyAcceptImportDependency = import('./HarmonyAcceptImportDependency');
declare const HarmonyAcceptDependencyTemplate_base: {
  new (): {
    apply(
      dependency: import('../Dependency'),
      source: any,
      templateContext: import('../DependencyTemplate').DependencyTemplateContext,
    ): void;
  };
};
declare class HarmonyAcceptDependencyTemplate extends HarmonyAcceptDependencyTemplate_base {}
type ReplaceSource = any;
type Dependency = import('../Dependency');
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
