export = HookWebpackError;
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[Error, string]>} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext<[Error, string]>} ObjectSerializerContext */
/**
 * Defines the callback callback.
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
    /** @type {string} */
    hook: string;
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
declare namespace HookWebpackError {
    export { makeWebpackError, makeWebpackErrorCallback, tryRunOrWebpackError, ObjectDeserializerContext, ObjectSerializerContext, Callback };
}
import WebpackError = require("./WebpackError");
/**
 * Creates webpack error.
 * @template T
 * @param {T} error what a plugin failed with
 * @param {string} hook name of the hook
 * @returns {WebpackError} a webpack error
 */
declare function makeWebpackError<T>(error: T, hook: string): WebpackError;
/**
 * Creates webpack error callback.
 * @template T
 * @param {(err: Error | null, result?: T) => void} callback webpack error callback
 * @param {string} hook name of hook
 * @returns {Callback<T>} generic callback
 */
declare function makeWebpackErrorCallback<T>(callback: (err: Error | null, result?: T) => void, hook: string): Callback<T>;
/**
 * Try run or webpack error.
 * @template T
 * @param {() => T} fn function which will be wrapping in try catch
 * @param {string} hook name of hook
 * @returns {T} the result
 */
declare function tryRunOrWebpackError<T>(fn: () => T, hook: string): T;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[Error, string]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[Error, string]>;
/**
 * Defines the callback callback.
 */
type Callback<T> = (err: Error | null, stats?: T | undefined) => void;
