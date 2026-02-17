export = CommonJsRequireDependency;
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
declare class CommonJsRequireDependency extends ModuleDependency {
  /**
   * @param {string} request request
   * @param {Range=} range location in source code
   * @param {string=} context request context
   */
  constructor(
    request: string,
    range?: Range | undefined,
    context?: string | undefined,
  );
  _context: string;
}
declare namespace CommonJsRequireDependency {
  export { ModuleDependencyTemplateAsId as Template, Range };
}
import ModuleDependency = require('./ModuleDependency');
import ModuleDependencyTemplateAsId = require('./ModuleDependencyTemplateAsId');
type Range = import('../javascript/JavascriptParser').Range;
