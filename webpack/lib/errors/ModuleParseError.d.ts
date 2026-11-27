export = ModuleParseError;
declare class ModuleParseError extends WebpackError {
    /**
     * Creates an instance of ModuleParseError.
     * @param {string | Buffer} source source code
     * @param {Error & { loc?: SourcePosition }} err the parse error
     * @param {string[]} loaders the loaders used
     * @param {string} type module type
     */
    constructor(source: string | Buffer, err: Error & {
        loc?: SourcePosition;
    }, loaders: string[], type: string);
    /** @type {Error} */
    error: Error;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     */
    deserialize(context: ObjectDeserializerContext): void;
}
declare namespace ModuleParseError {
    export { ObjectDeserializerContext, ObjectSerializerContext };
}
import WebpackError = require("./WebpackError");
import type { SourcePosition } from "../graph/Dependency";
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[Error]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[Error]>;
