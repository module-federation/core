export = CommonJsExportsDependency;
declare class CommonJsExportsDependency extends NullDependency {
  /**
   * @param {Range} range range
   * @param {Range} valueRange value range
   * @param {CommonJSDependencyBaseKeywords} base base
   * @param {string[]} names names
   */
  constructor(
    range: import('../javascript/JavascriptParser').Range,
    valueRange: import('../javascript/JavascriptParser').Range,
    base: CommonJSDependencyBaseKeywords,
    names: string[],
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
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    CommonJSDependencyBaseKeywords,
  };
}
import NullDependency = require('./NullDependency');
type CommonJSDependencyBaseKeywords =
  import('./CommonJsDependencyHelpers').CommonJSDependencyBaseKeywords;
declare const CommonJsExportsDependencyTemplate_base: {
  new (): {
    apply(
      dependency: import('../Dependency'),
      source: any,
      templateContext: import('../DependencyTemplate').DependencyTemplateContext,
    ): void;
  };
};
declare class CommonJsExportsDependencyTemplate extends CommonJsExportsDependencyTemplate_base {}
type ReplaceSource = any;
type Dependency = import('../Dependency');
type ExportsSpec = import('../Dependency').ExportsSpec;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type ModuleGraph = import('../ModuleGraph');
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
