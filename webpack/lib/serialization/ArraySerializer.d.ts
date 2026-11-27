export = ArraySerializer;
declare class ArraySerializer {
    /**
     * Serializes this instance into the provided serializer context.
     * @template T
     * @param {T[]} array array
     * @param {import("./ObjectMiddleware").ObjectSerializerContext<(number | T)[]>} context context
     */
    serialize<T>(array: T[], context: import("./ObjectMiddleware").ObjectSerializerContext<(number | T)[]>): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @template T
     * @param {import("./ObjectMiddleware").ObjectDeserializerContext<(number | T)[]>} context context
     * @returns {T[]} array
     */
    deserialize<T>(context: import("./ObjectMiddleware").ObjectDeserializerContext<(number | T)[]>): T[];
}
