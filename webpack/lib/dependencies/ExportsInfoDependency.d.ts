export = ExportsInfoDependency;
declare class ExportsInfoDependency extends NullDependency {
  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {ExportsInfoDependency} ExportsInfoDependency
   */
  static deserialize(context: ObjectDeserializerContext): ExportsInfoDependency;
  /**
   * @param {Range} range range
   * @param {TODO} exportName export name
   * @param {string | null} property property
   */
  constructor(
    range: import('../javascript/JavascriptParser').Range,
    exportName: TODO,
    property: string | null,
  );
  range: import('../javascript/JavascriptParser').Range;
  exportName: TODO;
  property: string;
}
declare namespace ExportsInfoDependency {
  export {
    ExportsInfoDependencyTemplate as Template,
    ReplaceSource,
    ChunkGraph,
    Dependency,
    UpdateHashContext,
    DependencyTemplateContext,
    Module,
    ModuleGraph,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    RuntimeSpec,
  };
}
import NullDependency = require('./NullDependency');
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
declare const ExportsInfoDependencyTemplate_base: {
  new (): {
    apply(
      dependency: import('../Dependency'),
      source: any,
      templateContext: import('../DependencyTemplate').DependencyTemplateContext,
    ): void;
  };
};
declare class ExportsInfoDependencyTemplate extends ExportsInfoDependencyTemplate_base {}
type ReplaceSource = any;
type ChunkGraph = import('../ChunkGraph');
type Dependency = import('../Dependency');
type UpdateHashContext = import('../Dependency').UpdateHashContext;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type Module = import('../Module');
type ModuleGraph = import('../ModuleGraph');
type Range = import('../javascript/JavascriptParser').Range;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('../util/Hash');
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
