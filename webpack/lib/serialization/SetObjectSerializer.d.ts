export = SetObjectSerializer;
/** @typedef {import("./ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class SetObjectSerializer {
  /**
   * @template T
   * @param {Set<T>} obj set
   * @param {ObjectSerializerContext} context context
   */
  serialize<T>(obj: Set<T>, context: ObjectSerializerContext): void;
  /**
   * @template T
   * @param {ObjectDeserializerContext} context context
   * @returns {Set<T>} date
   */
  deserialize<T_1>(context: ObjectDeserializerContext): Set<T_1>;
}
declare namespace SetObjectSerializer {
  export { ObjectDeserializerContext, ObjectSerializerContext };
}
type ObjectSerializerContext =
  import('./ObjectMiddleware').ObjectSerializerContext;
type ObjectDeserializerContext =
  import('./ObjectMiddleware').ObjectDeserializerContext;
