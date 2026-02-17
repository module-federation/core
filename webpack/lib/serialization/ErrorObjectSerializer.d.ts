export = ErrorObjectSerializer;
/** @typedef {import("./ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class ErrorObjectSerializer {
  /**
   * @param {ErrorConstructor | EvalErrorConstructor | RangeErrorConstructor | ReferenceErrorConstructor | SyntaxErrorConstructor | TypeErrorConstructor} Type error type
   */
  constructor(
    Type:
      | ErrorConstructor
      | EvalErrorConstructor
      | RangeErrorConstructor
      | ReferenceErrorConstructor
      | SyntaxErrorConstructor
      | TypeErrorConstructor,
  );
  Type:
    | ErrorConstructor
    | EvalErrorConstructor
    | RangeErrorConstructor
    | ReferenceErrorConstructor
    | SyntaxErrorConstructor
    | TypeErrorConstructor;
  /**
   * @param {Error | EvalError | RangeError | ReferenceError | SyntaxError | TypeError} obj error
   * @param {ObjectSerializerContext} context context
   */
  serialize(
    obj:
      | Error
      | EvalError
      | RangeError
      | ReferenceError
      | SyntaxError
      | TypeError,
    context: ObjectSerializerContext,
  ): void;
  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {Error | EvalError | RangeError | ReferenceError | SyntaxError | TypeError} error
   */
  deserialize(
    context: ObjectDeserializerContext,
  ): Error | EvalError | RangeError | ReferenceError | SyntaxError | TypeError;
}
declare namespace ErrorObjectSerializer {
  export { ObjectDeserializerContext, ObjectSerializerContext };
}
type ObjectSerializerContext =
  import('./ObjectMiddleware').ObjectSerializerContext;
type ObjectDeserializerContext =
  import('./ObjectMiddleware').ObjectDeserializerContext;
