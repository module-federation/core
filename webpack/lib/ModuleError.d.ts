export = ModuleError;
/** @typedef {import("./serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class ModuleError extends WebpackError {
  /**
   * @param {Error} err error thrown
   * @param {{from?: string|null}} info additional info
   */
  constructor(
    err: Error,
    {
      from,
    }?: {
      from?: string | null;
    },
  );
  error: Error;
}
declare namespace ModuleError {
  export { ObjectDeserializerContext, ObjectSerializerContext };
}
import WebpackError = require('./WebpackError');
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
