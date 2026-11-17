export = AggregateErrorSerializer;
/** @import { ComplexSerializableType } from "./types" */
/** @typedef {import("./ObjectMiddleware").ObjectDeserializerContext<ComplexSerializableType[]>} ObjectDeserializerContext */
/** @typedef {import("./ObjectMiddleware").ObjectSerializerContext<ComplexSerializableType[]>} ObjectSerializerContext */
/** @typedef {Error & { cause?: ComplexSerializableType, errors: ComplexSerializableType[] }} AggregateError */
declare class AggregateErrorSerializer {
    /**
     * Serializes this instance into the provided serializer context.
     * @param {AggregateError} obj error
     * @param {ObjectSerializerContext} context context
     */
    serialize(obj: AggregateError, context: ObjectSerializerContext): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     * @returns {AggregateError} error
     */
    deserialize(context: ObjectDeserializerContext): AggregateError;
}
declare namespace AggregateErrorSerializer {
    export { ObjectDeserializerContext, ObjectSerializerContext, AggregateError };
}
type ObjectDeserializerContext = import("./ObjectMiddleware").ObjectDeserializerContext<ComplexSerializableType[]>;
type ObjectSerializerContext = import("./ObjectMiddleware").ObjectSerializerContext<ComplexSerializableType[]>;
type AggregateError = Error & {
    cause?: ComplexSerializableType;
    errors: ComplexSerializableType[];
};
import type { ComplexSerializableType } from "./types";
