export = AggregateErrorSerializer;
/** @typedef {import("./ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {Error & { cause?: unknown, errors: EXPECTED_ANY[] }} AggregateError */
declare class AggregateErrorSerializer {
    /**
     * @param {AggregateError} obj error
     * @param {ObjectSerializerContext} context context
     */
    serialize(obj: AggregateError, context: ObjectSerializerContext): void;
    /**
     * @param {ObjectDeserializerContext} context context
     * @returns {AggregateError} error
     */
    deserialize(context: ObjectDeserializerContext): AggregateError;
}
declare namespace AggregateErrorSerializer {
    export { ObjectDeserializerContext, ObjectSerializerContext, AggregateError };
}
type ObjectDeserializerContext = import("./ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("./ObjectMiddleware").ObjectSerializerContext;
type AggregateError = Error & {
    cause?: unknown;
    errors: EXPECTED_ANY[];
};
