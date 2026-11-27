export = ModuleBuildError;
/** @typedef {Error & { hideStack?: boolean }} ErrorWithHideStack */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[string | ErrorWithHideStack]>} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext<[string | ErrorWithHideStack]>} ObjectSerializerContext */
declare class ModuleBuildError extends WebpackError {
    /**
     * Creates an instance of ModuleBuildError.
     * @param {string | ErrorWithHideStack} err error thrown
     * @param {{ from?: string | null }} info additional info
     */
    constructor(err: string | ErrorWithHideStack, { from }?: {
        from?: string | null;
    });
    /** @type {string | ErrorWithHideStack} */
    error: string | ErrorWithHideStack;
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
declare namespace ModuleBuildError {
    export { ErrorWithHideStack, ObjectDeserializerContext, ObjectSerializerContext };
}
import WebpackError = require("./WebpackError");
type ErrorWithHideStack = Error & {
    hideStack?: boolean;
};
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[string | ErrorWithHideStack]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[string | ErrorWithHideStack]>;
