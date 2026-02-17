export = CommonJsExportsDependency;
declare class CommonJsExportsDependency extends NullDependency {
  /**
   * @param {Range} range range
   * @param {Range | null} valueRange value range
   * @param {CommonJSDependencyBaseKeywords} base base
   * @param {ExportInfoName[]} names names
   */
  constructor(
    range: Range,
    valueRange: Range | null,
    base: CommonJSDependencyBaseKeywords,
    names: ExportInfoName[],
  );
  range: import('../javascript/JavascriptParser').Range;
  valueRange: import('../javascript/JavascriptParser').Range;
  base: import('./CommonJsDependencyHelpers').CommonJSDependencyBaseKeywords;
  names: string[];
}
declare namespace CommonJsExportsDependency {
  export {
    CommonJsExportsDependencyTemplate as Template,
    ReplaceSource,
    Dependency,
    ExportsSpec,
    DependencyTemplateContext,
    ModuleGraph,
    ExportInfoName,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    CommonJSDependencyBaseKeywords,
  };
}
import NullDependency = require('./NullDependency');
declare const CommonJsExportsDependencyTemplate_base: {
  new (): {
    apply(
      dependency: import('../Dependency'),
      source: NullDependency.ReplaceSource,
      templateContext: NullDependency.DependencyTemplateContext,
    ): void;
  };
};
declare class CommonJsExportsDependencyTemplate extends CommonJsExportsDependencyTemplate_base {}
type ReplaceSource = import('webpack-sources').ReplaceSource;
type Dependency = import('../Dependency');
type ExportsSpec = import('../Dependency').ExportsSpec;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type ModuleGraph = import('../ModuleGraph');
type ExportInfoName = import('../ExportsInfo').ExportInfoName;
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type CommonJSDependencyBaseKeywords =
  import('./CommonJsDependencyHelpers').CommonJSDependencyBaseKeywords;
