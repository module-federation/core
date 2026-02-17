export = ImportMetaHotAcceptDependency;
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
declare class ImportMetaHotAcceptDependency extends ModuleDependency {
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
declare namespace ImportMetaHotAcceptDependency {
  export { ModuleDependencyTemplateAsId as Template, Range };
}
import ModuleDependency = require('./ModuleDependency');
import ModuleDependencyTemplateAsId = require('./ModuleDependencyTemplateAsId');
type Range = import('../javascript/JavascriptParser').Range;
