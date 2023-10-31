export = RegExpObjectSerializer;
/** @typedef {import("./ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class RegExpObjectSerializer {
  /**
   * @param {RegExp} obj regexp
   * @param {ObjectSerializerContext} context context
   */
  serialize(obj: RegExp, context: ObjectSerializerContext): void;
  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {RegExp} regexp
   */
  deserialize(context: ObjectDeserializerContext): RegExp;
}
declare namespace RegExpObjectSerializer {
  export { ObjectDeserializerContext, ObjectSerializerContext };
}
type ObjectSerializerContext =
  import('./ObjectMiddleware').ObjectSerializerContext;
type ObjectDeserializerContext =
  import('./ObjectMiddleware').ObjectDeserializerContext;
