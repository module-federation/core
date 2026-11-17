export = PlainObjectSerializer;
declare class PlainObjectSerializer {
    /**
     * Serializes this instance into the provided serializer context.
     * @template {object} T
     * @param {T} obj plain object
     * @param {ObjectSerializerContext<((keyof T)[] | keyof T | null | T[keyof T])[]>} context context
     */
    serialize<T extends unknown>(obj: T, context: ObjectSerializerContext<((keyof T)[] | keyof T | null | T[keyof T])[]>): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @template {object} T
     * @param {ObjectDeserializerContext<((keyof T)[] | keyof T | null | T[keyof T])[]>} context context
     * @returns {T} plain object
     */
    deserialize<T extends unknown>(context: ObjectDeserializerContext<((keyof T)[] | keyof T | null | T[keyof T])[]>): T;
}
declare namespace PlainObjectSerializer {
    export { CacheAssoc };
}
import type { ObjectSerializerContext } from "./ObjectMiddleware";
import type { ObjectDeserializerContext } from "./ObjectMiddleware";
type CacheAssoc = (value: never) => EXPECTED_OBJECT;
