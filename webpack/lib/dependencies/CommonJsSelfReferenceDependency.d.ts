export = CommonJsSelfReferenceDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../Dependency").ReferencedExports} ReferencedExports */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../ExportsInfo").ExportInfoName} ExportInfoName */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
/** @typedef {import("./CommonJsDependencyHelpers").CommonJSDependencyBaseKeywords} CommonJSDependencyBaseKeywords */
declare class CommonJsSelfReferenceDependency extends NullDependency {
  /**
   * @param {Range} range range
   * @param {CommonJSDependencyBaseKeywords} base base
   * @param {ExportInfoName[]} names names
   * @param {boolean} call is a call
   */
  constructor(
    range: Range,
    base: CommonJSDependencyBaseKeywords,
    names: ExportInfoName[],
    call: boolean,
  );
  range: import('../javascript/JavascriptParser').Range;
  base: import('./CommonJsDependencyHelpers').CommonJSDependencyBaseKeywords;
  names: string[];
  call: boolean;
}
declare namespace CommonJsSelfReferenceDependency {
  export {
    CommonJsSelfReferenceDependencyTemplate as Template,
    ReplaceSource,
    Dependency,
    ReferencedExports,
    DependencyTemplateContext,
    ModuleGraph,
    ExportInfoName,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    RuntimeSpec,
    CommonJSDependencyBaseKeywords,
  };
}
import NullDependency = require('./NullDependency');
declare const CommonJsSelfReferenceDependencyTemplate_base: {
  new (): {
    apply(
      dependency: import('../Dependency'),
      source: NullDependency.ReplaceSource,
      templateContext: NullDependency.DependencyTemplateContext,
    ): void;
  };
};
declare class CommonJsSelfReferenceDependencyTemplate extends CommonJsSelfReferenceDependencyTemplate_base {}
type ReplaceSource = import('webpack-sources').ReplaceSource;
type Dependency = import('../Dependency');
type ReferencedExports = import('../Dependency').ReferencedExports;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type ModuleGraph = import('../ModuleGraph');
type ExportInfoName = import('../ExportsInfo').ExportInfoName;
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
type CommonJSDependencyBaseKeywords =
  import('./CommonJsDependencyHelpers').CommonJSDependencyBaseKeywords;
