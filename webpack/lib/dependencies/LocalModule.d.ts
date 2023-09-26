export = LocalModule;
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class LocalModule {
  /**
   * @param {string} name name
   * @param {number} idx index
   */
  constructor(name: string, idx: number);
  name: string;
  idx: number;
  used: boolean;
  flagUsed(): void;
  /**
   * @returns {string} variable name
   */
  variableName(): string;
  /**
   * @param {ObjectSerializerContext} context context
   */
  serialize(context: ObjectSerializerContext): void;
  /**
   * @param {ObjectDeserializerContext} context context
   */
  deserialize(context: ObjectDeserializerContext): void;
}
declare namespace LocalModule {
  export { ObjectDeserializerContext, ObjectSerializerContext };
}
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
