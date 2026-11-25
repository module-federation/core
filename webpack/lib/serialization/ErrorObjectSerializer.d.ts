export = ErrorObjectSerializer;
/** @import { ComplexSerializableType } from "./types" */
/** @typedef {import("./ObjectMiddleware").ObjectDeserializerContext<ComplexSerializableType[]>} ObjectDeserializerContext */
/** @typedef {import("./ObjectMiddleware").ObjectSerializerContext<ComplexSerializableType[]>} ObjectSerializerContext */
/** @typedef {Error & { cause?: ComplexSerializableType }} ErrorWithCause */
declare class ErrorObjectSerializer {
    /**
     * Creates an instance of ErrorObjectSerializer.
     * @param {ErrorConstructor | EvalErrorConstructor | RangeErrorConstructor | ReferenceErrorConstructor | SyntaxErrorConstructor | TypeErrorConstructor} Type error type
     */
    constructor(Type: ErrorConstructor | EvalErrorConstructor | RangeErrorConstructor | ReferenceErrorConstructor | SyntaxErrorConstructor | TypeErrorConstructor);
    Type: ErrorConstructor | EvalErrorConstructor | RangeErrorConstructor | ReferenceErrorConstructor | SyntaxErrorConstructor | TypeErrorConstructor;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {Error | EvalError | RangeError | ReferenceError | SyntaxError | TypeError} obj error
     * @param {ObjectSerializerContext} context context
     */
    serialize(obj: Error | EvalError | RangeError | ReferenceError | SyntaxError | TypeError, context: ObjectSerializerContext): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     * @returns {Error | EvalError | RangeError | ReferenceError | SyntaxError | TypeError} error
     */
    deserialize(context: ObjectDeserializerContext): Error | EvalError | RangeError | ReferenceError | SyntaxError | TypeError;
}
declare namespace ErrorObjectSerializer {
    export { ObjectDeserializerContext, ObjectSerializerContext, ErrorWithCause };
}
type ObjectDeserializerContext = import("./ObjectMiddleware").ObjectDeserializerContext<ComplexSerializableType[]>;
type ObjectSerializerContext = import("./ObjectMiddleware").ObjectSerializerContext<ComplexSerializableType[]>;
type ErrorWithCause = Error & {
    cause?: ComplexSerializableType;
};
import type { ComplexSerializableType } from "./types";
