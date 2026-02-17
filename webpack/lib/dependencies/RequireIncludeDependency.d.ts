export = RequireIncludeDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency").ReferencedExports} ReferencedExports */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
declare class RequireIncludeDependency extends ModuleDependency {
  /**
   * @param {string} request the request string
   * @param {Range} range location in source code
   */
  constructor(request: string, range: Range);
}
declare namespace RequireIncludeDependency {
  export {
    RequireIncludeDependencyTemplate as Template,
    ReplaceSource,
    ReferencedExports,
    DependencyTemplateContext,
    ModuleGraph,
    Range,
    RuntimeSpec,
  };
}
import ModuleDependency = require('./ModuleDependency');
declare const RequireIncludeDependencyTemplate_base: typeof import('../DependencyTemplate');
declare class RequireIncludeDependencyTemplate extends RequireIncludeDependencyTemplate_base {}
type ReplaceSource = import('webpack-sources').ReplaceSource;
type ReferencedExports = import('../Dependency').ReferencedExports;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type ModuleGraph = import('../ModuleGraph');
type Range = import('../javascript/JavascriptParser').Range;
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
