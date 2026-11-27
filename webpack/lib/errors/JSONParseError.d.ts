export = JSONParseError;
declare class JSONParseError extends SyntaxError {
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     * @returns {JSONParseError} DelegatedModule
     */
    static deserialize(context: ObjectDeserializerContext): JSONParseError;
    /**
     * @param {Error} err err
     * @param {string | Buffer} raw the text `parseJson` was handed, before its byte order mark is stripped
     * @param {string} txt text
     */
    constructor(err: Error, raw: string | Buffer, txt: string);
    /** @type {Error} */
    systemError: Error;
    /** @type {string | Buffer} */
    raw: string | Buffer;
    /** @type {string} */
    txt: string;
    /** @type {number} */
    position: number;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
}
declare namespace JSONParseError {
    export { ObjectDeserializerContext, ObjectSerializerContext };
}
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[Error, string | Buffer, string]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[Error, string | Buffer, string]>;
