export = PlainObjectSerializer;
declare class PlainObjectSerializer {
  /**
   * @template {object} T
   * @param {T} obj plain object
   * @param {ObjectSerializerContext} context context
   */
  serialize<T extends unknown>(obj: T, context: ObjectSerializerContext): void;
  /**
   * @template {object} T
   * @param {ObjectDeserializerContext} context context
   * @returns {T} plain object
   */
  deserialize<T extends unknown>(context: ObjectDeserializerContext): T;
}
declare namespace PlainObjectSerializer {
  export { ObjectDeserializerContext, ObjectSerializerContext, CacheAssoc };
}
type ObjectDeserializerContext =
  import('./ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('./ObjectMiddleware').ObjectSerializerContext;
type CacheAssoc = EXPECTED_FUNCTION;
