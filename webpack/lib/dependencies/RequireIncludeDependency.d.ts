export = RequireIncludeDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency").ReferencedExport} ReferencedExport */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
declare class RequireIncludeDependency extends ModuleDependency {
  /**
   * @param {string} request the request string
   * @param {Range} range location in source code
   */
  constructor(
    request: string,
    range: import('../javascript/JavascriptParser').Range,
  );
  range: import('../javascript/JavascriptParser').Range;
}
declare namespace RequireIncludeDependency {
  export {
    RequireIncludeDependencyTemplate as Template,
    ReplaceSource,
    ReferencedExport,
    DependencyTemplateContext,
    ModuleGraph,
    Range,
    RuntimeSpec,
  };
}
import ModuleDependency = require('./ModuleDependency');
declare const RequireIncludeDependencyTemplate_base: typeof import('../DependencyTemplate');
declare class RequireIncludeDependencyTemplate extends RequireIncludeDependencyTemplate_base {}
type ReplaceSource = any;
type ReferencedExport = import('../Dependency').ReferencedExport;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type ModuleGraph = import('../ModuleGraph');
type Range = import('../javascript/JavascriptParser').Range;
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
