export = HookWebpackError;
/** @typedef {import("./serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/**
 * @template T
 * @callback Callback
 * @param {Error | null} err
 * @param {T=} stats
 * @returns {void}
 */
declare class HookWebpackError extends WebpackError {
    /**
     * Creates an instance of HookWebpackError.
     * @param {Error} error inner error
     * @param {string} hook name of hook
     */
    constructor(error: Error, hook: string);
    hook: string;
    error: Error;
}
declare namespace HookWebpackError {
    export { makeWebpackError, makeWebpackErrorCallback, tryRunOrWebpackError, ObjectDeserializerContext, ObjectSerializerContext, Callback };
}
import WebpackError = require("./WebpackError");
/**
 * @param {Error} error an error
 * @param {string} hook name of the hook
 * @returns {WebpackError} a webpack error
 */
declare function makeWebpackError(error: Error, hook: string): WebpackError;
/**
 * @template T
 * @param {(err: WebpackError | null, result?: T) => void} callback webpack error callback
 * @param {string} hook name of hook
 * @returns {Callback<T>} generic callback
 */
declare function makeWebpackErrorCallback<T>(callback: (err: WebpackError | null, result?: T) => void, hook: string): Callback<T>;
/**
 * @template T
 * @param {() => T} fn function which will be wrapping in try catch
 * @param {string} hook name of hook
 * @returns {T} the result
 */
declare function tryRunOrWebpackError<T>(fn: () => T, hook: string): T;
type ObjectDeserializerContext = import("./serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("./serialization/ObjectMiddleware").ObjectSerializerContext;
type Callback<T> = (err: Error | null, stats?: T | undefined) => void;
