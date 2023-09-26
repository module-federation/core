export = ModuleWarning;
/** @typedef {import("./serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class ModuleWarning extends WebpackError {
  /**
   * @param {Error} warning error thrown
   * @param {{from?: string|null}} info additional info
   */
  constructor(
    warning: Error,
    {
      from,
    }?: {
      from?: string | null;
    },
  );
  warning: Error;
}
declare namespace ModuleWarning {
  export { ObjectDeserializerContext, ObjectSerializerContext };
}
import WebpackError = require('./WebpackError');
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
