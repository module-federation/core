export = CommonJsFullRequireDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../Dependency").ReferencedExport} ReferencedExport */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
declare class CommonJsFullRequireDependency extends ModuleDependency {
  /**
   * @param {string} request the request string
   * @param {Range} range location in source code
   * @param {string[]} names accessed properties on module
   */
  constructor(
    request: string,
    range: import('../javascript/JavascriptParser').Range,
    names: string[],
  );
  range: import('../javascript/JavascriptParser').Range;
  names: string[];
  call: boolean;
  asiSafe: any;
}
declare namespace CommonJsFullRequireDependency {
  export {
    CommonJsFullRequireDependencyTemplate as Template,
    ReplaceSource,
    Dependency,
    ReferencedExport,
    DependencyTemplateContext,
    ModuleGraph,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    RuntimeSpec,
  };
}
import ModuleDependency = require('./ModuleDependency');
declare const CommonJsFullRequireDependencyTemplate_base: typeof import('../DependencyTemplate');
declare class CommonJsFullRequireDependencyTemplate extends CommonJsFullRequireDependencyTemplate_base {}
type ReplaceSource = any;
type Dependency = import('../Dependency');
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
