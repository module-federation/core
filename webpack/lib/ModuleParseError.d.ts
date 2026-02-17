export = ModuleParseError;
declare class ModuleParseError extends WebpackError {
  /**
   * @param {string | Buffer} source source code
   * @param {Error&any} err the parse error
   * @param {string[]} loaders the loaders used
   * @param {string} type module type
   */
  constructor(
    source: string | Buffer,
    err: Error & any,
    loaders: string[],
    type: string,
  );
  loc: {
    start: any;
  };
  error: any;
}
declare namespace ModuleParseError {
  export { ObjectDeserializerContext, ObjectSerializerContext };
}
import WebpackError = require('./WebpackError');
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
