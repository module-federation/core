export = AsyncQueue;
/**
 * @template T
 * @template K
 * @template R
 */
declare class AsyncQueue<T, K, R> {
  /**
   * @param {Object} options options object
   * @param {string=} options.name name of the queue
   * @param {number=} options.parallelism how many items should be processed at once
   * @param {AsyncQueue<any, any, any>=} options.parent parent queue, which will have priority over this queue and with shared parallelism
   * @param {function(T): K=} options.getKey extract key from item
   * @param {function(T, Callback<R>): void} options.processor async function to process items
   */
  constructor({
    name,
    parallelism,
    parent,
    processor,
    getKey,
  }: {
    name?: string | undefined;
    parallelism?: number | undefined;
    parent?: AsyncQueue<any, any, any> | undefined;
    getKey?: ((arg0: T) => K) | undefined;
    processor: (arg0: T, arg1: Callback<R>) => void;
  });
  _name: string;
  _parallelism: number;
  _processor: (arg0: T, arg1: Callback<R>) => void;
  _getKey: (arg0: T) => K;
  /** @type {Map<K, AsyncQueueEntry<T, K, R>>} */
  _entries: Map<K, AsyncQueueEntry<T, K, R>>;
  /** @type {ArrayQueue<AsyncQueueEntry<T, K, R>>} */
  _queued: ArrayQueue<AsyncQueueEntry<T, K, R>>;
  /** @type {AsyncQueue<any, any, any>[] | undefined} */
  _children: AsyncQueue<any, any, any>[] | undefined;
  _activeTasks: number;
  _willEnsureProcessing: boolean;
  _needProcessing: boolean;
  _stopped: boolean;
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
    /** @type {SyncHook<[T, Error, R]>} */
    result: SyncHook<[T, Error, R]>;
  };
  /**
   * @returns {void}
   */
  _ensureProcessing(): void;
  /**
   * @param {T} item an item
   * @param {Callback<R>} callback callback function
   * @returns {void}
   */
  add(item: T, callback: Callback<R>): void;
  /**
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
   * @returns {void}
   */
  stop(): void;
  /**
   * @returns {void}
   */
  increaseParallelism(): void;
  /**
   * @returns {void}
   */
  decreaseParallelism(): void;
  /**
   * @param {T} item an item
   * @returns {boolean} true, if the item is currently being processed
   */
  isProcessing(item: T): boolean;
  /**
   * @param {T} item an item
   * @returns {boolean} true, if the item is currently queued
   */
  isQueued(item: T): boolean;
  /**
   * @param {T} item an item
   * @returns {boolean} true, if the item is currently queued
   */
  isDone(item: T): boolean;
  /**
   * @param {AsyncQueueEntry<T, K, R>} entry the entry
   * @returns {void}
   */
  _startProcessing(entry: AsyncQueueEntry<T, K, R>): void;
  /**
   * @param {AsyncQueueEntry<T, K, R>} entry the entry
   * @param {WebpackError=} err error, if any
   * @param {R=} result result, if any
   * @returns {void}
   */
  _handleResult(
    entry: AsyncQueueEntry<T, K, R>,
    err?: WebpackError | undefined,
    result?: R | undefined,
  ): void;
  clear(): void;
}
declare namespace AsyncQueue {
  export { Callback };
}
type Callback<T> = (
  err?: (WebpackError | null) | undefined,
  result?: T | undefined,
) => any;
/**
 * @template T
 * @callback Callback
 * @param {(WebpackError | null)=} err
 * @param {T=} result
 */
/**
 * @template T
 * @template K
 * @template R
 */
declare class AsyncQueueEntry<T, K, R> {
  /**
   * @param {T} item the item
   * @param {Callback<R>} callback the callback
   */
  constructor(item: T, callback: Callback<R>);
  item: T;
  /** @type {typeof QUEUED_STATE | typeof PROCESSING_STATE | typeof DONE_STATE} */
  state: typeof QUEUED_STATE | typeof PROCESSING_STATE | typeof DONE_STATE;
  callback: Callback<R>;
  /** @type {Callback<R>[] | undefined} */
  callbacks: Callback<R>[];
  result: any;
  /** @type {WebpackError | undefined} */
  error: WebpackError | undefined;
}
import ArrayQueue = require('./ArrayQueue');
import { AsyncSeriesHook } from 'tapable';
import { SyncHook } from 'tapable';
import WebpackError = require('../WebpackError');
declare const QUEUED_STATE: 0;
declare const PROCESSING_STATE: 1;
declare const DONE_STATE: 2;
