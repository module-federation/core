export = PlainObjectSerializer;
declare class PlainObjectSerializer {
  /**
   * @param {Object} obj plain object
   * @param {ObjectSerializerContext} context context
   */
  serialize(obj: any, context: ObjectSerializerContext): void;
  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {Object} plain object
   */
  deserialize(context: ObjectDeserializerContext): any;
}
declare namespace PlainObjectSerializer {
  export { ObjectDeserializerContext, ObjectSerializerContext };
}
type ObjectSerializerContext =
  import('./ObjectMiddleware').ObjectSerializerContext;
type ObjectDeserializerContext =
  import('./ObjectMiddleware').ObjectDeserializerContext;
