export = NullPrototypeObjectSerializer;
/** @typedef {import("./ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {string[]} Keys */
declare class NullPrototypeObjectSerializer {
    /**
     * @template {object} T
     * @param {T} obj null object
     * @param {ObjectSerializerContext} context context
     */
    serialize<T extends unknown>(obj: T, context: ObjectSerializerContext): void;
    /**
     * @template {object} T
     * @param {ObjectDeserializerContext} context context
     * @returns {T} null object
     */
    deserialize<T extends unknown>(context: ObjectDeserializerContext): T;
}
declare namespace NullPrototypeObjectSerializer {
    export { ObjectDeserializerContext, ObjectSerializerContext, Keys };
}
type ObjectDeserializerContext = import("./ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("./ObjectMiddleware").ObjectSerializerContext;
type Keys = string[];
