export = AsyncQueue;
/**
 * @template T, K
 * @typedef {(item: T) => K} getKey
 */
/**
 * @template T, R
 * @typedef {(item: T, callback: Callback<R>) => void} Processor
 */
/**
 * @template T
 * @template K
 * @template R
 */
declare class AsyncQueue<T, K, R> {
  /**
   * @param {object} options options object
   * @param {string=} options.name name of the queue
   * @param {number=} options.parallelism how many items should be processed at once
   * @param {string=} options.context context of execution
   * @param {AsyncQueue<EXPECTED_ANY, EXPECTED_ANY, EXPECTED_ANY>=} options.parent parent queue, which will have priority over this queue and with shared parallelism
   * @param {getKey<T, K>=} options.getKey extract key from item
   * @param {Processor<T, R>} options.processor async function to process items
   */
  constructor({
    name,
    context,
    parallelism,
    parent,
    processor,
    getKey,
  }: {
    name?: string | undefined;
    parallelism?: number | undefined;
    context?: string | undefined;
    parent?: AsyncQueue<EXPECTED_ANY, EXPECTED_ANY, EXPECTED_ANY> | undefined;
    getKey?: getKey<T, K> | undefined;
    processor: Processor<T, R>;
  });
  _name: string;
  _context: string;
  _parallelism: number;
  _processor: Processor<T, R>;
  _getKey: getKey<T, K>;
  /** @type {Map<K, AsyncQueueEntry<T, K, R>>} */
  _entries: Map<K, AsyncQueueEntry<T, K, R>>;
  /** @type {ArrayQueue<AsyncQueueEntry<T, K, R>>} */
  _queued: ArrayQueue<AsyncQueueEntry<T, K, R>>;
  /** @type {AsyncQueue<T, K, R>[] | undefined} */
  _children: AsyncQueue<T, K, R>[] | undefined;
  _activeTasks: number;
  _willEnsureProcessing: boolean;
  _needProcessing: boolean;
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
    result: SyncHook<
      [T, WebpackError | null | undefined, R | null | undefined]
    >;
  };
  /**
   * @returns {void}
   */
  _ensureProcessing(): void;
  /**
   * @returns {string} context of execution
   */
  getContext(): string;
  /**
   * @param {string} value context of execution
   */
  setContext(value: string): void;
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
   * @param {(WebpackError | null)=} err error, if any
   * @param {(R | null)=} result result, if any
   * @returns {void}
   */
  _handleResult(
    entry: AsyncQueueEntry<T, K, R>,
    err?: (WebpackError | null) | undefined,
    result?: (R | null) | undefined,
  ): void;
  clear(): void;
}
declare namespace AsyncQueue {
  export { Callback, getKey, Processor };
}
/**
 * @template T
 * @callback Callback
 * @param {(WebpackError | null)=} err
 * @param {(T | null)=} result
 * @returns {void}
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
  /** @type {Callback<R> | undefined} */
  callback: Callback<R> | undefined;
  /** @type {Callback<R>[] | undefined} */
  callbacks: Callback<R>[] | undefined;
  /** @type {R | null | undefined} */
  result: R | null | undefined;
  /** @type {WebpackError | null | undefined} */
  error: WebpackError | null | undefined;
}
import ArrayQueue = require('./ArrayQueue');
import { AsyncSeriesHook } from 'tapable';
import { SyncHook } from 'tapable';
import WebpackError = require('../WebpackError');
type Callback<T> = (
  err?: (WebpackError | null) | undefined,
  result?: (T | null) | undefined,
) => void;
type getKey<T, K> = (item: T) => K;
type Processor<T, R> = (item: T, callback: Callback<R>) => void;
declare const QUEUED_STATE: 0;
declare const PROCESSING_STATE: 1;
declare const DONE_STATE: 2;
