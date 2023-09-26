export = RequireResolveContextDependency;
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("./ContextDependency").ContextDependencyOptions} ContextDependencyOptions */
declare class RequireResolveContextDependency extends ContextDependency {
  /**
   * @param {ContextDependencyOptions} options options
   * @param {Range} range range
   * @param {Range} valueRange value range
   * @param {TODO} context context
   */
  constructor(
    options: ContextDependencyOptions,
    range: import('../javascript/JavascriptParser').Range,
    valueRange: import('../javascript/JavascriptParser').Range,
    context: TODO,
  );
  range: import('../javascript/JavascriptParser').Range;
  valueRange: import('../javascript/JavascriptParser').Range;
}
declare namespace RequireResolveContextDependency {
  export {
    ContextDependencyTemplateAsId as Template,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    ContextDependencyOptions,
  };
}
import ContextDependency = require('./ContextDependency');
type ContextDependencyOptions =
  import('./ContextDependency').ContextDependencyOptions;
import ContextDependencyTemplateAsId = require('./ContextDependencyTemplateAsId');
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
