export = AMDRequireArrayDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class AMDRequireArrayDependency extends NullDependency {
  /**
   * @param {TODO} depsArray deps array
   * @param {Range} range range
   */
  constructor(
    depsArray: TODO,
    range: import('../javascript/JavascriptParser').Range,
  );
  depsArray: TODO;
  range: import('../javascript/JavascriptParser').Range;
}
declare namespace AMDRequireArrayDependency {
  export {
    AMDRequireArrayDependencyTemplate as Template,
    ReplaceSource,
    Dependency,
    DependencyTemplateContext,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
  };
}
import NullDependency = require('./NullDependency');
declare class AMDRequireArrayDependencyTemplate extends DependencyTemplate {
  getContent(dep: any, templateContext: any): string;
  contentForDependency(
    dep: any,
    {
      runtimeTemplate,
      moduleGraph,
      chunkGraph,
      runtimeRequirements,
    }: {
      runtimeTemplate: any;
      moduleGraph: any;
      chunkGraph: any;
      runtimeRequirements: any;
    },
  ): any;
}
type ReplaceSource = any;
type Dependency = import('../Dependency');
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
import DependencyTemplate = require('../DependencyTemplate');
