export = AMDRequireContextDependency;
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("./ContextDependency").ContextDependencyOptions} ContextDependencyOptions */
declare class AMDRequireContextDependency extends ContextDependency {
  /**
   * @param {ContextDependencyOptions} options options
   * @param {Range} range range
   * @param {Range} valueRange value range
   */
  constructor(
    options: ContextDependencyOptions,
    range: Range,
    valueRange: Range,
  );
}
declare namespace AMDRequireContextDependency {
  export {
    Template,
    Range,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    ContextDependencyOptions,
  };
}
import ContextDependency = require('./ContextDependency');
declare var Template: typeof import('./ContextDependencyTemplateAsRequireCall');
type Range = import('../javascript/JavascriptParser').Range;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type ContextDependencyOptions =
  import('./ContextDependency').ContextDependencyOptions;
