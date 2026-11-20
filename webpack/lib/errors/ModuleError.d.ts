export = ModuleError;
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[Error]>} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext<[Error]>} ObjectSerializerContext */
declare class ModuleError extends WebpackError {
    /**
     * @param {Error} err error thrown
     * @param {{ from?: string | null }} info additional info
     */
    constructor(err: Error, { from }?: {
        from?: string | null;
    });
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
declare namespace ModuleError {
    export { ObjectDeserializerContext, ObjectSerializerContext };
}
import WebpackError = require("./WebpackError");
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[Error]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[Error]>;
