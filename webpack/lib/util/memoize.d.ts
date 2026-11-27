export = memoize;
/**
 * Defines the function returning type used by this module.
 * @template T
 * @typedef {() => T} FunctionReturning
 */
/**
 * Returns new function.
 * @template T
 * @param {FunctionReturning<T>} fn memorized function
 * @returns {FunctionReturning<T>} new function
 */
declare function memoize<T>(fn: FunctionReturning<T>): FunctionReturning<T>;
declare namespace memoize {
    export { FunctionReturning };
}
/**
 * Defines the function returning type used by this module.
 */
type FunctionReturning<T> = () => T;
