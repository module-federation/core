export = Cache;
declare class Cache {
  hooks: {
    /** @type {AsyncSeriesBailHook<[string, Etag | null, GotHandler<EXPECTED_ANY>[]], Data>} */
    get: AsyncSeriesBailHook<
      [string, Etag | null, GotHandler<EXPECTED_ANY>[]],
      Data
    >;
    /** @type {AsyncParallelHook<[string, Etag | null, Data]>} */
    store: AsyncParallelHook<[string, Etag | null, Data]>;
    /** @type {AsyncParallelHook<[Iterable<string>]>} */
    storeBuildDependencies: AsyncParallelHook<[Iterable<string>]>;
    /** @type {SyncHook<[]>} */
    beginIdle: SyncHook<[]>;
    /** @type {AsyncParallelHook<[]>} */
    endIdle: AsyncParallelHook<[]>;
    /** @type {AsyncParallelHook<[]>} */
    shutdown: AsyncParallelHook<[]>;
  };
  /**
   * @template T
   * @param {string} identifier the cache identifier
   * @param {Etag | null} etag the etag
   * @param {CallbackCache<T>} callback signals when the value is retrieved
   * @returns {void}
   */
  get<T>(
    identifier: string,
    etag: Etag | null,
    callback: CallbackCache<T>,
  ): void;
  /**
   * @template T
   * @param {string} identifier the cache identifier
   * @param {Etag | null} etag the etag
   * @param {T} data the value to store
   * @param {CallbackCache<void>} callback signals when the value is stored
   * @returns {void}
   */
  store<T>(
    identifier: string,
    etag: Etag | null,
    data: T,
    callback: CallbackCache<void>,
  ): void;
  /**
   * After this method has succeeded the cache can only be restored when build dependencies are
   * @param {Iterable<string>} dependencies list of all build dependencies
   * @param {CallbackCache<void>} callback signals when the dependencies are stored
   * @returns {void}
   */
  storeBuildDependencies(
    dependencies: Iterable<string>,
    callback: CallbackCache<void>,
  ): void;
  /**
   * @returns {void}
   */
  beginIdle(): void;
  /**
   * @param {CallbackCache<void>} callback signals when the call finishes
   * @returns {void}
   */
  endIdle(callback: CallbackCache<void>): void;
  /**
   * @param {CallbackCache<void>} callback signals when the call finishes
   * @returns {void}
   */
  shutdown(callback: CallbackCache<void>): void;
}
declare namespace Cache {
  export {
    STAGE_MEMORY,
    STAGE_DEFAULT,
    STAGE_DISK,
    STAGE_NETWORK,
    WebpackError,
    Etag,
    CallbackCache,
    Data,
    GotHandler,
  };
}
import { AsyncSeriesBailHook } from 'tapable';
import { AsyncParallelHook } from 'tapable';
import { SyncHook } from 'tapable';
declare var STAGE_MEMORY: number;
declare var STAGE_DEFAULT: number;
declare var STAGE_DISK: number;
declare var STAGE_NETWORK: number;
type WebpackError = import('./WebpackError');
type Etag = {
  toString: () => string;
};
type CallbackCache<T> = (
  err: WebpackError | null,
  result?: T | undefined,
) => void;
type Data = EXPECTED_ANY;
type GotHandler<T> = (result: T, callback: () => void) => void;
