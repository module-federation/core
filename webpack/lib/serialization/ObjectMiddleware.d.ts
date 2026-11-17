export = ObjectMiddleware;
/** @typedef {ComplexSerializableType[]} DeserializedType */
/** @typedef {PrimitiveSerializableType[]} SerializedType */
/** @typedef {{ logger: Logger }} Context */
/** @typedef {(context: ObjectSerializerContext<ComplexSerializableType[]> | ObjectDeserializerContext<ComplexSerializableType[]>) => void} ExtendContext */
/**
 * Represents ObjectMiddleware.
 * @extends {SerializerMiddleware<DeserializedType, SerializedType, Context>}
 */
declare class ObjectMiddleware extends SerializerMiddleware<DeserializedType, SerializedType, Context> {
    /**
     * Processes the provided reg exp.
     * @param {RegExp} regExp RegExp for which the request is tested
     * @param {(request: string) => boolean} loader loader to load the request, returns true when successful
     * @returns {void}
     */
    static registerLoader(regExp: RegExp, loader: (request: string) => boolean): void;
    /**
     * Processes the provided constructor.
     * @template {Constructor} C
     * @param {C} Constructor the constructor
     * @param {string} request the request which will be required when deserializing
     * @param {string | null} name the name to make multiple serializer unique when sharing a request
     * @param {ObjectSerializer<InstanceType<C>>} serializer the serializer
     * @returns {void}
     */
    static register<C extends Constructor>(Constructor: C, request: string, name: string | null, serializer: ObjectSerializer<InstanceType<C>>): void;
    /**
     * Accepts a historical request/name as an extra deserialization key for an
     * already registered constructor, so caches written before a move restore.
     * @param {Constructor} Constructor the constructor, already registered
     * @param {string} request the historical request
     * @param {(string | null)=} name the historical name
     * @returns {void}
     */
    static registerLegacyRequest(Constructor: Constructor, request: string, name?: (string | null) | undefined): void;
    /**
     * Register not serializable.
     * @param {Constructor} Constructor the constructor
     * @returns {void}
     */
    static registerNotSerializable(Constructor: Constructor): void;
    /**
     * Gets serializer for.
     * @param {ComplexSerializableType} object for serialization
     * @returns {SerializerConfigWithSerializer} Serializer config
     */
    static getSerializerFor(object: ComplexSerializableType): SerializerConfigWithSerializer;
    /**
     * Gets deserializer for.
     * @param {string} request request
     * @param {string | null} name name
     * @returns {ObjectSerializer} serializer
     */
    static getDeserializerFor(request: string, name: string | null): ObjectSerializer;
    /**
     * Get deserializer for without error.
     * @param {string} request request
     * @param {string | null} name name
     * @returns {ObjectSerializer | undefined} serializer
     */
    static _getDeserializerForWithoutError(request: string, name: string | null): ObjectSerializer | undefined;
    /**
     * Creates an instance of ObjectMiddleware.
     * @param {ExtendContext} extendContext context extensions
     * @param {HashFunction} hashFunction hash function to use
     */
    constructor(extendContext: ExtendContext, hashFunction?: HashFunction);
    /** @type {ExtendContext} */
    extendContext: ExtendContext;
    /** @type {HashFunction} */
    _hashFunction: HashFunction;
}
declare namespace ObjectMiddleware {
    export { NOT_SERIALIZABLE, Constructor, ObjectSerializerSnapshot, ReferenceableItem, Head, Tail, ObjectSerializerContext, ObjectDeserializerContext, ObjectSerializer, SerializerConfig, SerializerConfigWithSerializer, DeserializedType, SerializedType, Context, ExtendContext };
}
import SerializerMiddleware = require("./SerializerMiddleware");
import type { HashFunction } from "../util/Hash";
import type { ComplexSerializableType } from "./types";
declare const NOT_SERIALIZABLE: {};
type Constructor = abstract new (...params: never[]) => EXPECTED_OBJECT;
/**
 * Defines the object serializer snapshot type used by this module.
 */
type ObjectSerializerSnapshot = {
    length: number;
    cycleStackSize: number;
    referenceableSize: number;
    currentPos: number;
    objectTypeLookupSize: number;
    currentPosTypeLookup: number;
};
type ReferenceableItem = EXPECTED_OBJECT | string;
/**
 * First tuple element; element type for an open array; `never` once exhausted,
 * so a read or write past the declared tuple fails to type-check.
 */
type Head<T> = T extends readonly [infer H, ...infer _Rest] ? H : T extends readonly [] ? never : T extends readonly (infer E)[] ? E : never;
/**
 * Tuple without its first element; unchanged when `T` is an open array.
 */
type Tail<T> = T extends readonly [infer _First, ...infer R] ? R : T;
/**
 * Defines the object serializer context type used by this module.
 * `T` is the tuple of values written in order; each `write` consumes the head.
 */
type ObjectSerializerContext<T = readonly EXPECTED_ANY[]> = {
    write: (value: Head<T>) => ObjectSerializerContext<Tail<T>>;
    setCircularReference: (value: ReferenceableItem) => void;
    snapshot: () => ObjectSerializerSnapshot;
    rollback: (snapshot: ObjectSerializerSnapshot) => void;
    writeLazy?: ((item: ComplexSerializableType) => void) | undefined;
    writeSeparate?: ((item: ComplexSerializableType, obj: SerializerMiddleware.LazyOptions | undefined) => import("./SerializerMiddleware").LazyFunction<EXPECTED_ANY, PrimitiveSerializableType[], SerializerMiddleware.LazyTarget, SerializerMiddleware.LazyOptions>) | undefined;
};
/**
 * Defines the object deserializer context type used by this module.
 * `T` is the tuple of values read in order: `read` returns the head, and `rest`
 * re-types the same context to `Tail<T>` so successive reads stay positional.
 */
type ObjectDeserializerContext<T = readonly EXPECTED_ANY[]> = {
    read: () => Head<T>;
    rest: ObjectDeserializerContext<Tail<T>>;
    setCircularReference: (value: ReferenceableItem) => void;
};
/**
 * Defines the object serializer type used by this module.
 * Methods, so a serializer may narrow `value` to the class it is registered for.
 */
type ObjectSerializer<T extends EXPECTED_OBJECT = EXPECTED_OBJECT> = {
    serialize(value: T, context: ObjectSerializerContext): void;
    deserialize(context: ObjectDeserializerContext): EXPECTED_OBJECT;
};
type SerializerConfig = {
    request?: string;
    name?: string | number | null;
    serializer?: ObjectSerializer;
};
type SerializerConfigWithSerializer = {
    request?: string;
    name?: string | number | null;
    serializer: ObjectSerializer;
};
type DeserializedType = ComplexSerializableType[];
type SerializedType = PrimitiveSerializableType[];
type Context = {
    logger: Logger;
};
type ExtendContext = (context: ObjectSerializerContext<ComplexSerializableType[]> | ObjectDeserializerContext<ComplexSerializableType[]>) => void;
import type { PrimitiveSerializableType } from "./types";
import type { Logger } from "../logging/Logger";
