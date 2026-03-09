export = ExportsInfoDependency;
declare class ExportsInfoDependency extends NullDependency {
  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {ExportsInfoDependency} ExportsInfoDependency
   */
  static deserialize(context: ObjectDeserializerContext): ExportsInfoDependency;
  /**
   * @param {Range} range range
   * @param {ExportInfoName[] | null} exportName export name
   * @param {string | null} property property
   */
  constructor(
    range: Range,
    exportName: ExportInfoName[] | null,
    property: string | null,
  );
  range: import('../javascript/JavascriptParser').Range;
  exportName: string[];
  property: string;
}
declare namespace ExportsInfoDependency {
  export {
    ExportsInfoDependencyTemplate as Template,
    ReplaceSource,
    Dependency,
    DependencyTemplateContext,
    Module,
    ModuleGraph,
    ExportInfoName,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    RuntimeSpec,
    SortableSet,
  };
}
import NullDependency = require('./NullDependency');
declare const ExportsInfoDependencyTemplate_base: {
  new (): {
    apply(
      dependency: import('../Dependency'),
      source: NullDependency.ReplaceSource,
      templateContext: NullDependency.DependencyTemplateContext,
    ): void;
  };
};
declare class ExportsInfoDependencyTemplate extends ExportsInfoDependencyTemplate_base {}
type ReplaceSource = import('webpack-sources').ReplaceSource;
type Dependency = import('../Dependency');
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type Module = import('../Module');
type ModuleGraph = import('../ModuleGraph');
type ExportInfoName = import('../ExportsInfo').ExportInfoName;
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
type SortableSet<T> = import('../util/SortableSet')<T>;
