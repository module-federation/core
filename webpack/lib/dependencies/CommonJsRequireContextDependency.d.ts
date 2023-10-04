export = CommonJsRequireContextDependency;
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class CommonJsRequireContextDependency extends ContextDependency {
  /**
   * @param {TODO} options options for the context module
   * @param {Range} range location in source code
   * @param {Range | undefined} valueRange location of the require call
   * @param {boolean | string } inShorthand true or name
   * @param {string} context context
   */
  constructor(
    options: TODO,
    range: import('../javascript/JavascriptParser').Range,
    valueRange: import('../javascript/JavascriptParser').Range | undefined,
    inShorthand: boolean | string,
    context: string,
  );
  range: import('../javascript/JavascriptParser').Range;
  valueRange: import('../javascript/JavascriptParser').Range;
}
declare namespace CommonJsRequireContextDependency {
  export {
    ContextDependencyTemplateAsRequireCall as Template,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
  };
}
import ContextDependency = require('./ContextDependency');
import ContextDependencyTemplateAsRequireCall = require('./ContextDependencyTemplateAsRequireCall');
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
