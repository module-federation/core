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
     * @template R
     * @type {Map<(set: SortableSet<T>) => EXPECTED_ANY, EXPECTED_ANY> | undefined}
     */
    private _cache;
    /**
     * @private
     * @template R
     * @type {Map<(set: SortableSet<T>) => EXPECTED_ANY, EXPECTED_ANY> | undefined}
     */
    private _cacheOrderIndependent;
    /**
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
     * @template {EXPECTED_ANY} R
     * @param {(set: SortableSet<T>) => R} fn function to calculate value
     * @returns {R} returns result of fn(this), cached until set changes
     */
    getFromCache<R extends EXPECTED_ANY>(fn: (set: SortableSet<T>) => R): R;
    /**
     * Get data from cache (ignoring sorting)
     * @template R
     * @param {(set: SortableSet<T>) => R} fn function to calculate value
     * @returns {R} returns result of fn(this), cached until set changes
     */
    getFromUnorderedCache<R>(fn: (set: SortableSet<T>) => R): R;
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
