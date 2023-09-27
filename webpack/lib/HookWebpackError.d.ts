export = HookWebpackError;
/** @typedef {import("./Module")} Module */
/**
 * @template T
 * @callback Callback
 * @param {Error=} err
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
  export {
    makeWebpackError,
    makeWebpackErrorCallback,
    tryRunOrWebpackError,
    Module,
    Callback,
  };
}
import WebpackError = require('./WebpackError');
/**
 * @param {Error} error an error
 * @param {string} hook name of the hook
 * @returns {WebpackError} a webpack error
 */
declare function makeWebpackError(error: Error, hook: string): WebpackError;
/**
 * @template T
 * @param {function((WebpackError | null)=, T=): void} callback webpack error callback
 * @param {string} hook name of hook
 * @returns {Callback<T>} generic callback
 */
declare function makeWebpackErrorCallback<T>(
  callback: (arg0?: (WebpackError | null) | undefined, arg1?: T) => void,
  hook: string,
): Callback<T>;
/**
 * @template T
 * @param {function(): T} fn function which will be wrapping in try catch
 * @param {string} hook name of hook
 * @returns {T} the result
 */
declare function tryRunOrWebpackError<T>(fn: () => T, hook: string): T;
type Module = import('./Module');
type Callback<T> = (err?: Error | undefined, stats?: T | undefined) => void;
