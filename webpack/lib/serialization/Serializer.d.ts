export = Serializer;
/**
 * @template T, K, C
 * @typedef {import("./SerializerMiddleware")<T, K, C>} SerializerMiddleware
 */
/**
 * @template DeserializedValue
 * @template SerializedValue
 * @template Context
 */
declare class Serializer<DeserializedValue, SerializedValue, Context> {
    /**
     * @param {SerializerMiddleware<EXPECTED_ANY, EXPECTED_ANY, EXPECTED_ANY>[]} middlewares serializer middlewares
     * @param {Context=} context context
     */
    constructor(middlewares: SerializerMiddleware<EXPECTED_ANY, EXPECTED_ANY, EXPECTED_ANY>[], context?: Context | undefined);
    serializeMiddlewares: import("./SerializerMiddleware")<EXPECTED_ANY, EXPECTED_ANY, EXPECTED_ANY>[];
    deserializeMiddlewares: import("./SerializerMiddleware")<EXPECTED_ANY, EXPECTED_ANY, EXPECTED_ANY>[];
    context: Context;
    /**
     * @template ExtendedContext
     * @param {DeserializedValue | Promise<DeserializedValue>} obj object
     * @param {Context & ExtendedContext} context context object
     * @returns {Promise<SerializedValue>} result
     */
    serialize<ExtendedContext>(obj: DeserializedValue | Promise<DeserializedValue>, context: Context & ExtendedContext): Promise<SerializedValue>;
    /**
     * @template ExtendedContext
     * @param {SerializedValue | Promise<SerializedValue>} value value
     * @param {Context & ExtendedContext} context object
     * @returns {Promise<DeserializedValue>} result
     */
    deserialize<ExtendedContext>(value: SerializedValue | Promise<SerializedValue>, context: Context & ExtendedContext): Promise<DeserializedValue>;
}
declare namespace Serializer {
    export { SerializerMiddleware };
}
type SerializerMiddleware<T, K, C> = import("./SerializerMiddleware")<T, K, C>;
