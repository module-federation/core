export = ModuleBuildError;
/** @typedef {import("./serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class ModuleBuildError extends WebpackError {
  /**
   * @param {string | Error&any} err error thrown
   * @param {{from?: string|null}} info additional info
   */
  constructor(
    err: string | (Error & any),
    {
      from,
    }?: {
      from?: string | null;
    },
  );
  error: any;
}
declare namespace ModuleBuildError {
  export { ObjectDeserializerContext, ObjectSerializerContext };
}
import WebpackError = require('./WebpackError');
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
