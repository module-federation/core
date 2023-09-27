export = NullPrototypeObjectSerializer;
/** @typedef {import("./ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class NullPrototypeObjectSerializer {
  /**
   * @template {Object} T
   * @param {T} obj null object
   * @param {ObjectSerializerContext} context context
   */
  serialize<T extends unknown>(obj: T, context: ObjectSerializerContext): void;
  /**
   * @template {Object} T
   * @param {ObjectDeserializerContext} context context
   * @returns {T} null object
   */
  deserialize<T_1 extends unknown>(context: ObjectDeserializerContext): T_1;
}
declare namespace NullPrototypeObjectSerializer {
  export { ObjectDeserializerContext, ObjectSerializerContext };
}
type ObjectSerializerContext =
  import('./ObjectMiddleware').ObjectSerializerContext;
type ObjectDeserializerContext =
  import('./ObjectMiddleware').ObjectDeserializerContext;
