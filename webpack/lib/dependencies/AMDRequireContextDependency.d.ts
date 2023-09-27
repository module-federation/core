export = AMDRequireContextDependency;
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class AMDRequireContextDependency extends ContextDependency {
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
declare namespace AMDRequireContextDependency {
  export {
    Template,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
  };
}
import ContextDependency = require('./ContextDependency');
declare var Template: typeof import('./ContextDependencyTemplateAsRequireCall');
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
