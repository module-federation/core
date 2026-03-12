export = MapObjectSerializer;
/** @typedef {import("./ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class MapObjectSerializer {
  /**
   * @template K, V
   * @param {Map<K, V>} obj map
   * @param {ObjectSerializerContext} context context
   */
  serialize<K, V>(obj: Map<K, V>, context: ObjectSerializerContext): void;
  /**
   * @template K, V
   * @param {ObjectDeserializerContext} context context
   * @returns {Map<K, V>} map
   */
  deserialize<K, V>(context: ObjectDeserializerContext): Map<K, V>;
}
declare namespace MapObjectSerializer {
  export { ObjectDeserializerContext, ObjectSerializerContext };
}
type ObjectDeserializerContext =
  import('./ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('./ObjectMiddleware').ObjectSerializerContext;
