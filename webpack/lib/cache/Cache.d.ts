export = Cache;
/**
 * Abstract cache interface backed by tapable hooks for reading, writing, idle
 * transitions, and shutdown across webpack cache implementations.
 */
declare class Cache {
    hooks: {
        /** @type {AsyncSeriesBailHook<[string, Etag | null, GotHandler<EXPECTED_ANY>[]], Data>} */
        get: AsyncSeriesBailHook<[string, Etag | null, GotHandler<EXPECTED_ANY>[]], Data>;
        /** @type {AsyncParallelHook<[string, Etag | null, Data]>} */
        store: AsyncParallelHook<[string, Etag | null, Data]>;
        /** @type {AsyncParallelHook<[Iterable<string>, Iterable<string>]>} */
        storeBuildDependencies: AsyncParallelHook<[Iterable<string>, Iterable<string>]>;
        /** @type {SyncHook<[]>} */
        beginIdle: SyncHook<[]>;
        /** @type {AsyncParallelHook<[]>} */
        endIdle: AsyncParallelHook<[]>;
        /** @type {AsyncParallelHook<[]>} */
        shutdown: AsyncParallelHook<[]>;
    };
    /**
     * Retrieves a cached value and lets registered `gotHandlers` observe the
     * result before the caller receives it.
     * @template T
     * @param {string} identifier the cache identifier
     * @param {Etag | null} etag the etag
     * @param {CallbackCache<T>} callback signals when the value is retrieved
     * @returns {void}
     */
    get<T>(identifier: string, etag: Etag | null, callback: CallbackCache<T>): void;
    /**
     * Stores a cache entry for the identifier and etag through the registered
     * cache backend hooks.
     * @template T
     * @param {string} identifier the cache identifier
     * @param {Etag | null} etag the etag
     * @param {T} data the value to store
     * @param {CallbackCache<void>} callback signals when the value is stored
     * @returns {void}
     */
    store<T>(identifier: string, etag: Etag | null, data: T, callback: CallbackCache<void>): void;
    /**
     * Persists the set of build dependencies required to determine whether the
     * cache can be restored in a future compilation.
     * @param {Iterable<string>} dependencies list of all build dependencies
     * @param {Iterable<string>} optionalDependencies list of optional build dependencies
     * @param {CallbackCache<void>} callback signals when the dependencies are stored
     * @returns {void}
     */
    storeBuildDependencies(dependencies: Iterable<string>, optionalDependencies: Iterable<string>, callback: CallbackCache<void>): void;
    /**
     * Signals that webpack is entering an idle phase and cache backends may flush
     * or compact pending work.
     * @returns {void}
     */
    beginIdle(): void;
    /**
     * Signals that webpack is leaving the idle phase and waits for cache
     * backends to finish any asynchronous resume work.
     * @param {CallbackCache<void>} callback signals when the call finishes
     * @returns {void}
     */
    endIdle(callback: CallbackCache<void>): void;
    /**
     * Shuts down every registered cache backend and waits for cleanup to finish.
     * @param {CallbackCache<void>} callback signals when the call finishes
     * @returns {void}
     */
    shutdown(callback: CallbackCache<void>): void;
}
declare namespace Cache {
    export { STAGE_MEMORY, STAGE_DEFAULT, STAGE_DISK, STAGE_NETWORK, Etag, CallbackCache, Data, GotHandler };
}
import { AsyncSeriesBailHook } from "tapable";
import { AsyncParallelHook } from "tapable";
import { SyncHook } from "tapable";
declare var STAGE_MEMORY: number;
declare var STAGE_DEFAULT: number;
declare var STAGE_DISK: number;
declare var STAGE_NETWORK: number;
/**
 * Cache validation token whose string representation identifies the build
 * inputs associated with a cached value.
 */
type Etag = {
    toString: () => string;
};
/**
 * Completion callback used by cache operations that either fail with a `Error` or resolve with a typed result.
 */
type CallbackCache<T> = (err: Error | null, result?: T | undefined) => void;
type Data = EXPECTED_ANY;
/**
 * Handler invoked after a cache read succeeds so additional cache layers can
 * react to the retrieved value.
 */
type GotHandler<T> = (result: T, callback: () => void) => void;
