export = ModuleWarning;
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[Error]>} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext<[Error]>} ObjectSerializerContext */
declare class ModuleWarning extends WebpackError {
    /**
     * Creates an instance of ModuleWarning.
     * @param {Error} warning error thrown
     * @param {{ from?: string | null }} info additional info
     */
    constructor(warning: Error, { from }?: {
        from?: string | null;
    });
    /** @type {Error} */
    warning: Error;
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
declare namespace ModuleWarning {
    export { ObjectDeserializerContext, ObjectSerializerContext };
}
import WebpackError = require("./WebpackError");
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[Error]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[Error]>;
