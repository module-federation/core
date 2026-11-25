export = RegExpObjectSerializer;
/** @typedef {import("./ObjectMiddleware").ObjectDeserializerContext<[string, string]>} ObjectDeserializerContext */
/** @typedef {import("./ObjectMiddleware").ObjectSerializerContext<[string, string]>} ObjectSerializerContext */
declare class RegExpObjectSerializer {
    /**
     * Serializes this instance into the provided serializer context.
     * @param {RegExp} obj regexp
     * @param {ObjectSerializerContext} context context
     */
    serialize(obj: RegExp, context: ObjectSerializerContext): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     * @returns {RegExp} regexp
     */
    deserialize(context: ObjectDeserializerContext): RegExp;
}
declare namespace RegExpObjectSerializer {
    export { ObjectDeserializerContext, ObjectSerializerContext };
}
type ObjectDeserializerContext = import("./ObjectMiddleware").ObjectDeserializerContext<[string, string]>;
type ObjectSerializerContext = import("./ObjectMiddleware").ObjectSerializerContext<[string, string]>;
