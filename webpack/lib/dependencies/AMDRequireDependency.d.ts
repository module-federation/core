export = AMDRequireDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../AsyncDependenciesBlock")} AsyncDependenciesBlock */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class AMDRequireDependency extends NullDependency {
  /**
   * @param {Range} outerRange outer range
   * @param {Range} arrayRange array range
   * @param {Range | null} functionRange function range
   * @param {Range | null} errorCallbackRange error callback range
   */
  constructor(
    outerRange: Range,
    arrayRange: Range,
    functionRange: Range | null,
    errorCallbackRange: Range | null,
  );
  outerRange: import('../javascript/JavascriptParser').Range;
  arrayRange: import('../javascript/JavascriptParser').Range;
  functionRange: import('../javascript/JavascriptParser').Range;
  errorCallbackRange: import('../javascript/JavascriptParser').Range;
  functionBindThis: boolean;
  errorCallbackBindThis: boolean;
}
declare namespace AMDRequireDependency {
  export {
    AMDRequireDependencyTemplate as Template,
    ReplaceSource,
    AsyncDependenciesBlock,
    Dependency,
    DependencyTemplateContext,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
  };
}
import NullDependency = require('./NullDependency');
declare const AMDRequireDependencyTemplate_base: {
  new (): {
    apply(
      dependency: import('../Dependency'),
      source: NullDependency.ReplaceSource,
      templateContext: NullDependency.DependencyTemplateContext,
    ): void;
  };
};
declare class AMDRequireDependencyTemplate extends AMDRequireDependencyTemplate_base {}
type ReplaceSource = import('webpack-sources').ReplaceSource;
type AsyncDependenciesBlock = import('../AsyncDependenciesBlock');
type Dependency = import('../Dependency');
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
