export = AsyncQueue;
/**
 * Defines the get key type used by this module.
 * @template T, K
 * @typedef {(item: T) => K} getKey
 */
/**
 * Defines the processor type used by this module.
 * @template T, R
 * @typedef {(item: T, callback: Callback<R>) => void} Processor
 */
/**
 * Represents AsyncQueue.
 * @template T
 * @template K
 * @template R
 */
declare class AsyncQueue<T, K, R> {
    /**
     * Creates an instance of AsyncQueue.
     * @param {object} options options object
     * @param {string=} options.name name of the queue
     * @param {number=} options.parallelism how many items should be processed at once
     * @param {string=} options.context context of execution
     * @param {AsyncQueue<EXPECTED_ANY, EXPECTED_ANY, EXPECTED_ANY>=} options.parent parent queue, which will have priority over this queue and with shared parallelism
     * @param {getKey<T, K>=} options.getKey extract key from item
     * @param {Processor<T, R>} options.processor async function to process items
     */
    constructor({ name, context, parallelism, parent, processor, getKey }: {
        name?: string | undefined;
        parallelism?: number | undefined;
        context?: string | undefined;
        parent?: AsyncQueue<EXPECTED_ANY, EXPECTED_ANY, EXPECTED_ANY> | undefined;
        getKey?: getKey<T, K> | undefined;
        processor: Processor<T, R>;
    });
    /** @type {string | undefined} */
    _name: string | undefined;
    /** @type {string} */
    _context: string;
    /** @type {number} */
    _parallelism: number;
    /** @type {Processor<T, R>} */
    _processor: Processor<T, R>;
    /** @type {getKey<T, K>} */
    _getKey: getKey<T, K>;
    /** @type {Map<K, AsyncQueueEntry<T, K, R>>} */
    _entries: Map<K, AsyncQueueEntry<T, K, R>>;
    /** @type {ArrayQueue<AsyncQueueEntry<T, K, R>>} */
    _queued: ArrayQueue<AsyncQueueEntry<T, K, R>>;
    /** @type {AsyncQueue<T, K, R>[] | undefined} */
    _children: AsyncQueue<T, K, R>[] | undefined;
    /** @type {number} */
    _activeTasks: number;
    /** @type {boolean} */
    _willEnsureProcessing: boolean;
    /** @type {boolean} */
    _needProcessing: boolean;
    /** @type {boolean} */
    _stopped: boolean;
    /** @type {AsyncQueue<T, K, R>} */
    _root: AsyncQueue<T, K, R>;
    hooks: {
        /** @type {AsyncSeriesHook<[T]>} */
        beforeAdd: AsyncSeriesHook<[T]>;
        /** @type {SyncHook<[T]>} */
        added: SyncHook<[T]>;
        /** @type {AsyncSeriesHook<[T]>} */
        beforeStart: AsyncSeriesHook<[T]>;
        /** @type {SyncHook<[T]>} */
        started: SyncHook<[T]>;
        /** @type {SyncHook<[T, WebpackError | null | undefined, R | null | undefined]>} */
        result: SyncHook<[T, WebpackError | null | undefined, R | null | undefined]>;
    };
    /**
     * Describes how this ensure processing operation behaves.
     * @returns {void}
     */
    _ensureProcessing(): void;
    /**
     * Returns context of execution.
     * @returns {string} context of execution
     */
    getContext(): string;
    /**
     * Updates context using the provided value.
     * @param {string} value context of execution
     */
    setContext(value: string): void;
    /**
     * Processes the provided item.
     * @param {T} item an item
     * @param {Callback<R>} callback callback function
     * @returns {void}
     */
    add(item: T, callback: Callback<R>): void;
    /**
     * Processes the provided item, after the beforeAdd hook.
     * @param {T} item an item
     * @param {Callback<R>} callback callback function
     * @returns {void}
     */
    _add(item: T, callback: Callback<R>): void;
    /**
     * Processes the provided item.
     * @param {T} item an item
     * @returns {void}
     */
    invalidate(item: T): void;
    /**
     * Waits for an already started item
     * @param {T} item an item
     * @param {Callback<R>} callback callback function
     * @returns {void}
     */
    waitFor(item: T, callback: Callback<R>): void;
    /**
     * Describes how this stop operation behaves.
     * @returns {void}
     */
    stop(): void;
    /**
     * Increase parallelism.
     * @returns {void}
     */
    increaseParallelism(): void;
    /**
     * Decrease parallelism.
     * @returns {void}
     */
    decreaseParallelism(): void;
    /**
     * Checks whether this async queue is processing.
     * @param {T} item an item
     * @returns {boolean} true, if the item is currently being processed
     */
    isProcessing(item: T): boolean;
    /**
     * Checks whether this async queue is queued.
     * @param {T} item an item
     * @returns {boolean} true, if the item is currently queued
     */
    isQueued(item: T): boolean;
    /**
     * Checks whether this async queue is done.
     * @param {T} item an item
     * @returns {boolean} true, if the item is currently queued
     */
    isDone(item: T): boolean;
    /**
     * Processes the provided entry.
     * @param {AsyncQueueEntry<T, K, R>} entry the entry
     * @returns {void}
     */
    _startProcessing(entry: AsyncQueueEntry<T, K, R>): void;
    /**
     * Processes the provided entry, after the beforeStart hook.
     * @param {AsyncQueueEntry<T, K, R>} entry the entry
     * @returns {void}
     */
    _startProcessing2(entry: AsyncQueueEntry<T, K, R>): void;
    /**
     * Processes the provided entry.
     * @param {AsyncQueueEntry<T, K, R>} entry the entry
     * @param {(WebpackError | null)=} err error, if any
     * @param {(R | null)=} result result, if any
     * @returns {void}
     */
    _handleResult(entry: AsyncQueueEntry<T, K, R>, err?: (WebpackError | null) | undefined, result?: (R | null) | undefined): void;
    /**
     * Finalizes the provided entry, after the result hook.
     * @param {AsyncQueueEntry<T, K, R>} entry the entry
     * @param {(WebpackError | null)=} error error, if any
     * @param {(R | null)=} result result, if any
     * @returns {void}
     */
    _handleResult2(entry: AsyncQueueEntry<T, K, R>, error?: (WebpackError | null) | undefined, result?: (R | null) | undefined): void;
    clear(): void;
}
declare namespace AsyncQueue {
    export { Callback, getKey, Processor };
}
/**
 * Defines the callback callback.
 * @template T
 * @callback Callback
 * @param {(WebpackError | null)=} err
 * @param {(T | null)=} result
 * @returns {void}
 */
/**
 * Represents AsyncQueueEntry.
 * @template T
 * @template K
 * @template R
 */
declare class AsyncQueueEntry<T, K, R> {
    /**
     * Creates an instance of AsyncQueueEntry.
     * @param {T} item the item
     * @param {Callback<R>} callback the callback
     */
    constructor(item: T, callback: Callback<R>);
    /** @type {T} */
    item: T;
    /** @type {typeof QUEUED_STATE | typeof PROCESSING_STATE | typeof DONE_STATE} */
    state: typeof QUEUED_STATE | typeof PROCESSING_STATE | typeof DONE_STATE;
    /** @type {Callback<R> | undefined} */
    callback: Callback<R> | undefined;
    /** @type {Callback<R>[] | undefined} */
    callbacks: Callback<R>[] | undefined;
    /** @type {R | null | undefined} */
    result: R | null | undefined;
    /** @type {WebpackError | null | undefined} */
    error: WebpackError | null | undefined;
}
import ArrayQueue = require("./ArrayQueue");
import { AsyncSeriesHook } from "tapable";
import { SyncHook } from "tapable";
import WebpackError = require("../errors/WebpackError");
/**
 * Defines the callback callback.
 */
type Callback<T> = (err?: (WebpackError | null) | undefined, result?: (T | null) | undefined) => void;
/**
 * Defines the get key type used by this module.
 */
type getKey<T, K> = (item: T) => K;
/**
 * Defines the processor type used by this module.
 */
type Processor<T, R> = (item: T, callback: Callback<R>) => void;
declare const QUEUED_STATE: 0;
declare const PROCESSING_STATE: 1;
declare const DONE_STATE: 2;
