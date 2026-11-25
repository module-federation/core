export = SetObjectSerializer;
declare class SetObjectSerializer {
    /**
     * Serializes this instance into the provided serializer context.
     * @template T
     * @param {Set<T>} obj set
     * @param {import("./ObjectMiddleware").ObjectSerializerContext<(number | T)[]>} context context
     */
    serialize<T>(obj: Set<T>, context: import("./ObjectMiddleware").ObjectSerializerContext<(number | T)[]>): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @template T
     * @param {import("./ObjectMiddleware").ObjectDeserializerContext<(number | T)[]>} context context
     * @returns {Set<T>} date
     */
    deserialize<T>(context: import("./ObjectMiddleware").ObjectDeserializerContext<(number | T)[]>): Set<T>;
}
