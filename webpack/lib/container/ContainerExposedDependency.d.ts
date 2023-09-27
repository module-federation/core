export = ContainerExposedDependency;
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class ContainerExposedDependency extends ModuleDependency {
  /**
   * @param {string} exposedName public name
   * @param {string} request request to module
   */
  constructor(exposedName: string, request: string);
  exposedName: string;
}
declare namespace ContainerExposedDependency {
  export { ObjectDeserializerContext, ObjectSerializerContext };
}
import ModuleDependency = require('../dependencies/ModuleDependency');
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
