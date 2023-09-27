export = RequireResolveHeaderDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class RequireResolveHeaderDependency extends NullDependency {
  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {RequireResolveHeaderDependency} RequireResolveHeaderDependency
   */
  static deserialize(
    context: ObjectDeserializerContext,
  ): RequireResolveHeaderDependency;
  /**
   * @param {Range} range range
   */
  constructor(range: import('../javascript/JavascriptParser').Range);
  range: import('../javascript/JavascriptParser').Range;
}
declare namespace RequireResolveHeaderDependency {
  export {
    RequireResolveHeaderDependencyTemplate as Template,
    ReplaceSource,
    Dependency,
    DependencyTemplateContext,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
  };
}
import NullDependency = require('./NullDependency');
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
declare const RequireResolveHeaderDependencyTemplate_base: {
  new (): {
    apply(
      dependency: import('../Dependency'),
      source: any,
      templateContext: import('../DependencyTemplate').DependencyTemplateContext,
    ): void;
  };
};
declare class RequireResolveHeaderDependencyTemplate extends RequireResolveHeaderDependencyTemplate_base {
  /**
   * @param {string} name name
   * @param {RequireResolveHeaderDependency} dep dependency
   * @param {ReplaceSource} source source
   */
  applyAsTemplateArgument(
    name: string,
    dep: RequireResolveHeaderDependency,
    source: any,
  ): void;
}
type ReplaceSource = any;
type Dependency = import('../Dependency');
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type Range = import('../javascript/JavascriptParser').Range;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
