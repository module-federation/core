export declare function getBuiltinRequestContext(): BuiltinRequestContextValue | undefined;
/** A request context provided by the platform. */
export type BuiltinRequestContext = {
    get(): BuiltinRequestContextValue | undefined;
};
export type RunnableBuiltinRequestContext = BuiltinRequestContext & {
    run<T>(value: BuiltinRequestContextValue, callback: () => T): T;
};
export type BuiltinRequestContextValue = {
    waitUntil?: WaitUntil;
};
export type WaitUntil = (promise: Promise<any>) => void;
/** "@next/request-context" has a different signature from AsyncLocalStorage,
 * matching [AsyncContext.Variable](https://github.com/tc39/proposal-async-context).
 * We don't need a full AsyncContext adapter here, just having `.get()` is enough
 */
export declare function createLocalRequestContext(): RunnableBuiltinRequestContext;
