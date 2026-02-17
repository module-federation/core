export = memoize;
/**
 * @template T
 * @typedef {() => T} FunctionReturning
 */
/**
 * @template T
 * @param {FunctionReturning<T>} fn memorized function
 * @returns {FunctionReturning<T>} new function
 */
declare function memoize<T>(fn: FunctionReturning<T>): FunctionReturning<T>;
declare namespace memoize {
    export { FunctionReturning };
}
type FunctionReturning<T> = () => T;
