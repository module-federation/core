export = DateObjectSerializer;
/** @typedef {import("./ObjectMiddleware").ObjectDeserializerContext<[number]>} ObjectDeserializerContext */
/** @typedef {import("./ObjectMiddleware").ObjectSerializerContext<[number]>} ObjectSerializerContext */
declare class DateObjectSerializer {
    /**
     * Serializes this instance into the provided serializer context.
     * @param {Date} obj date
     * @param {ObjectSerializerContext} context context
     */
    serialize(obj: Date, context: ObjectSerializerContext): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     * @returns {Date} date
     */
    deserialize(context: ObjectDeserializerContext): Date;
}
declare namespace DateObjectSerializer {
    export { ObjectDeserializerContext, ObjectSerializerContext };
}
type ObjectDeserializerContext = import("./ObjectMiddleware").ObjectDeserializerContext<[number]>;
type ObjectSerializerContext = import("./ObjectMiddleware").ObjectSerializerContext<[number]>;
