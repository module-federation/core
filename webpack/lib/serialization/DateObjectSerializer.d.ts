export = DateObjectSerializer;
/** @typedef {import("./ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class DateObjectSerializer {
  /**
   * @param {Date} obj date
   * @param {ObjectSerializerContext} context context
   */
  serialize(obj: Date, context: ObjectSerializerContext): void;
  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {Date} date
   */
  deserialize(context: ObjectDeserializerContext): Date;
}
declare namespace DateObjectSerializer {
  export { ObjectDeserializerContext, ObjectSerializerContext };
}
type ObjectSerializerContext =
  import('./ObjectMiddleware').ObjectSerializerContext;
type ObjectDeserializerContext =
  import('./ObjectMiddleware').ObjectDeserializerContext;
