export = Serializer;
/**
 * Defines the serializer middleware type used by this module.
 * @template [T=ComplexSerializableType]
 * @template [K=ComplexSerializableType]
 * @template [C=EXPECTED_OBJECT]
 * @typedef {import("./SerializerMiddleware")<T, K, C>} SerializerMiddleware
 */
/** @import { ComplexSerializableType } from "./types" */
/**
 * Represents Serializer.
 * @template DeserializedValue
 * @template SerializedValue
 * @template Context
 */
declare class Serializer<DeserializedValue, SerializedValue, Context> {
    /**
     * Creates an instance of Serializer.
     * @param {SerializerMiddleware[]} middlewares serializer middlewares
     * @param {Context=} context context
     */
    constructor(middlewares: SerializerMiddleware[], context?: Context | undefined);
    serializeMiddlewares: import("./SerializerMiddleware")<any, any, EXPECTED_OBJECT>[];
    deserializeMiddlewares: import("./SerializerMiddleware")<any, any, EXPECTED_OBJECT>[];
    /** @type {Context | undefined} */
    context: Context | undefined;
    /**
     * Serializes this instance into the provided serializer context.
     * @template ExtendedContext
     * @param {DeserializedValue | Promise<DeserializedValue>} obj object
     * @param {Context & ExtendedContext} context context object
     * @returns {Promise<SerializedValue>} result
     */
    serialize<ExtendedContext>(obj: DeserializedValue | Promise<DeserializedValue>, context: Context & ExtendedContext): Promise<SerializedValue>;
    /**
     * Restores this instance from the provided deserializer context.
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
/**
 * Defines the serializer middleware type used by this module.
 */
type SerializerMiddleware<T = any, K = any, C = EXPECTED_OBJECT> = import("./SerializerMiddleware")<T, K, C>;
