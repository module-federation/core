export = CommonJsSelfReferenceDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../Dependency").ExportsSpec} ExportsSpec */
/** @typedef {import("../Dependency").ReferencedExport} ReferencedExport */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
/** @typedef {import("./CommonJsDependencyHelpers").CommonJSDependencyBaseKeywords} CommonJSDependencyBaseKeywords */
declare class CommonJsSelfReferenceDependency extends NullDependency {
  /**
   * @param {Range} range range
   * @param {CommonJSDependencyBaseKeywords} base base
   * @param {string[]} names names
   * @param {boolean} call is a call
   */
  constructor(
    range: import('../javascript/JavascriptParser').Range,
    base: CommonJSDependencyBaseKeywords,
    names: string[],
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
    ExportsSpec,
    ReferencedExport,
    DependencyTemplateContext,
    ModuleGraph,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    RuntimeSpec,
    CommonJSDependencyBaseKeywords,
  };
}
import NullDependency = require('./NullDependency');
type CommonJSDependencyBaseKeywords =
  import('./CommonJsDependencyHelpers').CommonJSDependencyBaseKeywords;
declare const CommonJsSelfReferenceDependencyTemplate_base: {
  new (): {
    apply(
      dependency: import('../Dependency'),
      source: any,
      templateContext: import('../DependencyTemplate').DependencyTemplateContext,
    ): void;
  };
};
declare class CommonJsSelfReferenceDependencyTemplate extends CommonJsSelfReferenceDependencyTemplate_base {}
type ReplaceSource = any;
type Dependency = import('../Dependency');
type ExportsSpec = import('../Dependency').ExportsSpec;
type ReferencedExport = import('../Dependency').ReferencedExport;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type ModuleGraph = import('../ModuleGraph');
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
