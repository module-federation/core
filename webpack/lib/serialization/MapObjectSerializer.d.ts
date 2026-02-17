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
  deserialize<K_1, V_1>(context: ObjectDeserializerContext): Map<K_1, V_1>;
}
declare namespace MapObjectSerializer {
  export { ObjectDeserializerContext, ObjectSerializerContext };
}
type ObjectSerializerContext =
  import('./ObjectMiddleware').ObjectSerializerContext;
type ObjectDeserializerContext =
  import('./ObjectMiddleware').ObjectDeserializerContext;
