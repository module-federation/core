export type LazyResult<TValue> = PromiseLike<TValue> & {
    value?: TValue;
};
export type ResolvedLazyResult<TValue> = PromiseLike<TValue> & {
    value: TValue;
};
/**
 * Calls the given async function only when the returned promise-like object is
 * awaited. Afterwards, it provides the resolved value synchronously as `value`
 * property.
 */
export declare function createLazyResult<TValue>(fn: () => Promise<TValue>): LazyResult<TValue>;
export declare function isResolvedLazyResult<TValue>(result: LazyResult<TValue>): result is ResolvedLazyResult<TValue>;
