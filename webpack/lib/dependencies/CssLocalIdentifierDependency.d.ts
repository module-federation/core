export = CssLocalIdentifierDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../Dependency").ExportsSpec} ExportsSpec */
/** @typedef {import("../DependencyTemplate").CssDependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../css/CssParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class CssLocalIdentifierDependency extends NullDependency {
  /**
   * @param {string} name name
   * @param {Range} range range
   * @param {string=} prefix prefix
   */
  constructor(
    name: string,
    range: import('../css/CssParser').Range,
    prefix?: string | undefined,
  );
  name: string;
  range: import('../css/CssParser').Range;
  prefix: string;
}
declare namespace CssLocalIdentifierDependency {
  export {
    CssLocalIdentifierDependencyTemplate as Template,
    ReplaceSource,
    Dependency,
    ExportsSpec,
    DependencyTemplateContext,
    ModuleGraph,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
  };
}
import NullDependency = require('./NullDependency');
declare const CssLocalIdentifierDependencyTemplate_base: {
  new (): {
    apply(
      dependency: import('../Dependency'),
      source: any,
      templateContext: import('../DependencyTemplate').DependencyTemplateContext,
    ): void;
  };
};
declare class CssLocalIdentifierDependencyTemplate extends CssLocalIdentifierDependencyTemplate_base {
  /**
   * @param {Dependency} dependency the dependency for which the template should be applied
   * @param {ReplaceSource} source the current replace source which can be modified
   * @param {DependencyTemplateContext} templateContext the context object
   * @returns {void}
   */
  apply(
    dependency: Dependency,
    source: any,
    {
      module,
      moduleGraph,
      chunkGraph,
      runtime,
      runtimeTemplate,
      cssExports,
    }: DependencyTemplateContext,
  ): void;
}
type ReplaceSource = any;
type Dependency = import('../Dependency');
type ExportsSpec = import('../Dependency').ExportsSpec;
type DependencyTemplateContext =
  import('../DependencyTemplate').CssDependencyTemplateContext;
type ModuleGraph = import('../ModuleGraph');
type Range = import('../css/CssParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
