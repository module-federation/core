export = ContainerExposedDependency;
/** @typedef {import("webpack/lib/serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("webpack/lib/serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
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
import ModuleDependency = require('webpack/lib/dependencies/ModuleDependency');
type ObjectDeserializerContext =
  import('webpack/lib/serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('webpack/lib/serialization/ObjectMiddleware').ObjectSerializerContext;
