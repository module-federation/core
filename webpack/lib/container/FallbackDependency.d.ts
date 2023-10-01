export = FallbackDependency;
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class FallbackDependency extends Dependency {
  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {FallbackDependency} deserialize fallback dependency
   */
  static deserialize(context: ObjectDeserializerContext): FallbackDependency;
  /**
   * @param {string[]} requests requests
   */
  constructor(requests: string[]);
  requests: string[];
}
declare namespace FallbackDependency {
  export { ObjectDeserializerContext, ObjectSerializerContext };
}
import Dependency = require('../Dependency');
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
