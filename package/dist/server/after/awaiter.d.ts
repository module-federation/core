/**
 * Provides a `waitUntil` implementation which gathers promises to be awaited later (via {@link AwaiterMulti.awaiting}).
 * Unlike a simple `Promise.all`, {@link AwaiterMulti} works recursively --
 * if a promise passed to {@link AwaiterMulti.waitUntil} calls `waitUntil` again,
 * that second promise will also be awaited.
 */
export declare class AwaiterMulti {
    private promises;
    private onError;
    constructor({ onError }?: {
        onError?: (error: unknown) => void;
    });
    waitUntil: (promise: Promise<unknown>) => void;
    awaiting(): Promise<void>;
}
/**
 * Like {@link AwaiterMulti}, but can only be awaited once.
 * If {@link AwaiterOnce.waitUntil} is called after that, it will throw.
 */
export declare class AwaiterOnce {
    private awaiter;
    private done;
    private pending;
    constructor(options?: {
        onError?: (error: unknown) => void;
    });
    waitUntil: (promise: Promise<unknown>) => void;
    awaiting(): Promise<void>;
}
