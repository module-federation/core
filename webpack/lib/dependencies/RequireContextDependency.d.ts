export = RequireContextDependency;
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
declare class RequireContextDependency extends ContextDependency {
  /**
   * @param {TODO} options options
   * @param {Range} range range
   */
  constructor(
    options: TODO,
    range: import('../javascript/JavascriptParser').Range,
  );
  range: import('../javascript/JavascriptParser').Range;
}
declare namespace RequireContextDependency {
  export { ModuleDependencyTemplateAsRequireId as Template, Range };
}
import ContextDependency = require('./ContextDependency');
import ModuleDependencyTemplateAsRequireId = require('./ModuleDependencyTemplateAsRequireId');
type Range = import('../javascript/JavascriptParser').Range;
