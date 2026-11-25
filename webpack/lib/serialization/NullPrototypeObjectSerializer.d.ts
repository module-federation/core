export = NullPrototypeObjectSerializer;
/** @typedef {string[]} Keys */
declare class NullPrototypeObjectSerializer {
    /**
     * Serializes this instance into the provided serializer context.
     * @template {object} T
     * @param {T} obj null object
     * @param {import("./ObjectMiddleware").ObjectSerializerContext<(string | null | T[keyof T])[]>} context context
     */
    serialize<T extends unknown>(obj: T, context: import("./ObjectMiddleware").ObjectSerializerContext<(string | null | T[keyof T])[]>): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @template {object} T
     * @param {import("./ObjectMiddleware").ObjectDeserializerContext<(string | null | T[keyof T])[]>} context context
     * @returns {T} null object
     */
    deserialize<T extends unknown>(context: import("./ObjectMiddleware").ObjectDeserializerContext<(string | null | T[keyof T])[]>): T;
}
declare namespace NullPrototypeObjectSerializer {
    export { Keys };
}
type Keys = string[];
