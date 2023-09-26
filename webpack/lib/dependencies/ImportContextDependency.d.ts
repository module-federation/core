export = ImportContextDependency;
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class ImportContextDependency extends ContextDependency {
  /**
   * @param {TODO} options options
   * @param {Range} range range
   * @param {Range} valueRange value range
   */
  constructor(
    options: TODO,
    range: import('../javascript/JavascriptParser').Range,
    valueRange: import('../javascript/JavascriptParser').Range,
  );
  range: import('../javascript/JavascriptParser').Range;
  valueRange: import('../javascript/JavascriptParser').Range;
}
declare namespace ImportContextDependency {
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
