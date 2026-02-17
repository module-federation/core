export = ModuleBuildError;
/** @typedef {import("./serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {Error & { hideStack?: boolean }} ErrorWithHideStack */
declare class ModuleBuildError extends WebpackError {
    /**
     * @param {string | ErrorWithHideStack} err error thrown
     * @param {{from?: string | null}} info additional info
     */
    constructor(err: string | ErrorWithHideStack, { from }?: {
        from?: string | null;
    });
    error: string | ErrorWithHideStack;
}
declare namespace ModuleBuildError {
    export { ObjectDeserializerContext, ObjectSerializerContext, ErrorWithHideStack };
}
import WebpackError = require("./WebpackError");
type ObjectDeserializerContext = import("./serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("./serialization/ObjectMiddleware").ObjectSerializerContext;
type ErrorWithHideStack = Error & {
    hideStack?: boolean;
};
