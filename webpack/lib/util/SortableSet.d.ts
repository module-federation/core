export = SortableSet;
/**
 * A subset of Set that offers sorting functionality
 * @template T item type in set
 * @extends {Set<T>}
 */
declare class SortableSet<T> extends Set<T> {
  /**
   * Create a new sortable set
   * @param {Iterable<T>=} initialIterable The initial iterable value
   * @typedef {function(T, T): number} SortFunction
   * @param {SortFunction=} defaultSort Default sorting function
   */
  constructor(
    initialIterable?: Iterable<T> | undefined,
    defaultSort?: (arg0: T, arg1: T) => number,
  );
  /** @private @type {undefined | function(T, T): number}} */
  private _sortFn;
  /** @private @type {typeof NONE | undefined | function(T, T): number}} */
  private _lastActiveSortFn;
  /** @private @type {Map<Function, any> | undefined} */
  private _cache;
  /** @private @type {Map<Function, any> | undefined} */
  private _cacheOrderIndependent;
  /**
   * @param {T} value value to add to set
   * @returns {this} returns itself
   */
  add(value: T): this;
  /**
   * Sort with a comparer function
   * @param {SortFunction} sortFn Sorting comparer function
   * @returns {void}
   */
  sortWith(sortFn: (arg0: T, arg1: T) => number): void;
  sort(): SortableSet<T>;
  /**
   * Get data from cache
   * @template R
   * @param {function(SortableSet<T>): R} fn function to calculate value
   * @returns {R} returns result of fn(this), cached until set changes
   */
  getFromCache<R>(fn: (arg0: SortableSet<T>) => R): R;
  /**
   * Get data from cache (ignoring sorting)
   * @template R
   * @param {function(SortableSet<T>): R} fn function to calculate value
   * @returns {R} returns result of fn(this), cached until set changes
   */
  getFromUnorderedCache<R_1>(fn: (arg0: SortableSet<T>) => R_1): R_1;
  /**
   * @private
   * @returns {void}
   */
  private _invalidateCache;
  /**
   * @private
   * @returns {void}
   */
  private _invalidateOrderedCache;
  /**
   * @returns {T[]} the raw array
   */
  toJSON(): T[];
}
