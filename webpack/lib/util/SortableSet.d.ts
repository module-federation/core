export = SortableSet;
/**
 * A subset of Set that offers sorting functionality
 * @template T item type in set
 * @extends {Set<T>}
 */
declare class SortableSet<T> extends Set<T> {
    /**
     * Create a new sortable set
     * @template T
     * @typedef {(a: T, b: T) => number} SortFunction
     * @param {Iterable<T>=} initialIterable The initial iterable value
     * @param {SortFunction<T>=} defaultSort Default sorting function
     */
    constructor(initialIterable?: Iterable<T> | undefined, defaultSort?: ((a: T, b: T) => number) | undefined);
    /**
     * @private
     * @type {undefined | SortFunction<T>}
     */
    private _sortFn;
    /**
     * @private
     * @type {typeof NONE | undefined | ((a: T, b: T) => number)}}
     */
    private _lastActiveSortFn;
    /**
     * @private
     * @type {undefined | typeof MULTIPLE | ((set: SortableSet<T>) => EXPECTED_ANY)}
     */
    private _cacheFn;
    /**
     * @private
     * @type {EXPECTED_ANY}
     */
    private _cacheValue;
    /**
     * @private
     * @type {undefined | typeof MULTIPLE | ((set: SortableSet<T>) => EXPECTED_ANY)}
     */
    private _cacheOrderIndependentFn;
    /**
     * @private
     * @type {EXPECTED_ANY}
     */
    private _cacheOrderIndependentValue;
    /**
     * Returns itself.
     * @param {T} value value to add to set
     * @returns {this} returns itself
     */
    add(value: T): this;
    /**
     * Sort with a comparer function
     * @param {SortFunction<T> | undefined} sortFn Sorting comparer function
     * @returns {void}
     */
    sortWith(sortFn: ((a: T, b: T) => number) | undefined): void;
    sort(): this;
    /**
     * Get data from cache
     * @template R
     * @param {(set: SortableSet<T>) => R} fn function to calculate value
     * @returns {R} returns result of fn(this), cached until set changes
     */
    getFromCache<R>(fn: (set: SortableSet<T>) => R): R;
    /**
     * Get data from cache (ignoring sorting)
     * @template R
     * @param {(set: SortableSet<T>) => R} fn function to calculate value
     * @returns {R} returns result of fn(this), cached until set changes
     */
    getFromUnorderedCache<R>(fn: (set: SortableSet<T>) => R): R;
    /**
     * @private
     * @template R
     * @param {Map<(set: SortableSet<T>) => R, R>} map cache of a set asked by several functions
     * @param {(set: SortableSet<T>) => R} fn function to calculate value
     * @returns {R} returns result of fn(this), cached until set changes
     */
    private _getFromMap;
    /**
     * Invalidates the cached state associated with this value.
     * @private
     * @returns {void}
     */
    private _invalidateCache;
    /**
     * Invalidate ordered cache.
     * @private
     * @returns {void}
     */
    private _invalidateOrderedCache;
    /**
     * Returns the raw array.
     * @returns {T[]} the raw array
     */
    toJSON(): T[];
}
