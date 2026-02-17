export = ArraySerializer;
/** @typedef {import("./ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class ArraySerializer {
  /**
   * @template T
   * @param {T[]} array array
   * @param {ObjectSerializerContext} context context
   */
  serialize<T>(array: T[], context: ObjectSerializerContext): void;
  /**
   * @template T
   * @param {ObjectDeserializerContext} context context
   * @returns {T[]} array
   */
  deserialize<T_1>(context: ObjectDeserializerContext): T_1[];
}
declare namespace ArraySerializer {
  export { ObjectDeserializerContext, ObjectSerializerContext };
}
type ObjectSerializerContext =
  import('./ObjectMiddleware').ObjectSerializerContext;
type ObjectDeserializerContext =
  import('./ObjectMiddleware').ObjectDeserializerContext;
