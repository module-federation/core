export = ModuleHotDeclineDependency;
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
declare class ModuleHotDeclineDependency extends ModuleDependency {
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
declare namespace ModuleHotDeclineDependency {
  export { ModuleDependencyTemplateAsId as Template, Range };
}
import ModuleDependency = require('./ModuleDependency');
import ModuleDependencyTemplateAsId = require('./ModuleDependencyTemplateAsId');
type Range = import('../javascript/JavascriptParser').Range;
