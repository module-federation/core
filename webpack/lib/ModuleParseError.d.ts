export = ModuleParseError;
declare class ModuleParseError extends WebpackError {
  /**
   * @param {string | Buffer} source source code
   * @param {Error & { loc?: SourcePosition }} err the parse error
   * @param {string[]} loaders the loaders used
   * @param {string} type module type
   */
  constructor(
    source: string | Buffer,
    err: Error & {
      loc?: SourcePosition;
    },
    loaders: string[],
    type: string,
  );
  loc: {
    start: import('./Dependency').SourcePosition;
  };
  error: Error & {
    loc?: SourcePosition;
  };
}
declare namespace ModuleParseError {
  export { SourcePosition, ObjectDeserializerContext, ObjectSerializerContext };
}
import WebpackError = require('./WebpackError');
type SourcePosition = import('./Dependency').SourcePosition;
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
