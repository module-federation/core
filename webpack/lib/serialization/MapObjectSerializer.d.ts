export = MapObjectSerializer;
declare class MapObjectSerializer {
    /**
     * Serializes this instance into the provided serializer context.
     * @template K, V
     * @param {Map<K, V>} obj map
     * @param {import("./ObjectMiddleware").ObjectSerializerContext<(number | K | V)[]>} context context
     */
    serialize<K, V>(obj: Map<K, V>, context: import("./ObjectMiddleware").ObjectSerializerContext<(number | K | V)[]>): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @template K, V
     * @param {import("./ObjectMiddleware").ObjectDeserializerContext<(number | K | V)[]>} context context
     * @returns {Map<K, V>} map
     */
    deserialize<K, V>(context: import("./ObjectMiddleware").ObjectDeserializerContext<(number | K | V)[]>): Map<K, V>;
}
