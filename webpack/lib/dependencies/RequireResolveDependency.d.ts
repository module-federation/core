export = RequireResolveDependency;
/** @typedef {import("../Dependency").ReferencedExport} ReferencedExport */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
declare class RequireResolveDependency extends ModuleDependency {
  /**
   * @param {string} request the request string
   * @param {Range} range location in source code
   * @param {string} [context] context
   */
  constructor(
    request: string,
    range: import('../javascript/JavascriptParser').Range,
    context?: string,
  );
  range: import('../javascript/JavascriptParser').Range;
  _context: string;
}
declare namespace RequireResolveDependency {
  export {
    ModuleDependencyAsId as Template,
    ReferencedExport,
    ModuleGraph,
    Range,
    RuntimeSpec,
  };
}
import ModuleDependency = require('./ModuleDependency');
import ModuleDependencyAsId = require('./ModuleDependencyTemplateAsId');
type ReferencedExport = import('../Dependency').ReferencedExport;
type ModuleGraph = import('../ModuleGraph');
type Range = import('../javascript/JavascriptParser').Range;
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
