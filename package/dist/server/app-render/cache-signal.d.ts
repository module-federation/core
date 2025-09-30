/**
 * This class is used to detect when all cache reads for a given render are settled.
 * We do this to allow for cache warming the prerender without having to continue rendering
 * the remainder of the page. This feature is really only useful when the dynamicIO flag is on
 * and should only be used in codepaths gated with this feature.
 */
export declare class CacheSignal {
    private count;
    private earlyListeners;
    private listeners;
    private tickPending;
    private taskPending;
    constructor();
    private noMorePendingCaches;
    /**
     * This promise waits until there are no more in progress cache reads but no later.
     * This allows for adding more cache reads after to delay cacheReady.
     */
    inputReady(): Promise<void>;
    /**
     * If there are inflight cache reads this Promise can resolve in a microtask however
     * if there are no inflight cache reads then we wait at least one task to allow initial
     * cache reads to be initiated.
     */
    cacheReady(): Promise<void>;
    beginRead(): void;
    endRead(): void;
}
