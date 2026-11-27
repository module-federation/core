export = LazyBucketSortedSet;
/**
 * Callback that extracts the grouping key for an item at one bucket layer.
 * @template T
 * @template K
 * @typedef {(item: T) => K} GetKey
 */
/**
 * Comparison function used to order keys or leaf items.
 * @template T
 * @typedef {(a: T, n: T) => number} Comparator
 */
/**
 * Internal bucket entry, either another nested bucket set or a sorted leaf set.
 * @template T
 * @template K
 * @typedef {LazyBucketSortedSet<T, K> | SortableSet<T>} Entry
 */
/**
 * Constructor argument accepted for nested bucket layers or the final leaf
 * comparator.
 * @template T
 * @template K
 * @typedef {GetKey<T, K> | Comparator<K> | Comparator<T>} Arg
 */
/**
 * Multi layer bucket sorted set:
 * Supports adding non-existing items (DO NOT ADD ITEM TWICE),
 * Supports removing exiting items (DO NOT REMOVE ITEM NOT IN SET),
 * Supports popping the first items according to defined order,
 * Supports iterating all items without order,
 * Supports updating an item in an efficient way,
 * Supports size property, which is the number of items,
 * Items are lazy partially sorted when needed
 * @template T
 * @template K
 */
declare class LazyBucketSortedSet<T, K> {
    /**
     * Creates a lazily sorted, potentially multi-level bucket structure whose
     * order is only fully resolved when items are popped.
     * @param {GetKey<T, K>} getKey function to get key from item
     * @param {Comparator<K>=} comparator comparator to sort keys
     * @param {...Arg<T, K>} args more pairs of getKey and comparator plus optional final comparator for the last layer
     */
    constructor(getKey: GetKey<T, K>, comparator?: Comparator<K> | undefined, ...args: Arg<T, K>[]);
    /** @type {GetKey<T, K>} */
    _getKey: GetKey<T, K>;
    /** @type {Arg<T, K>[]} */
    _innerArgs: Arg<T, K>[];
    /** @type {boolean} */
    _leaf: boolean;
    /** @type {SortableSet<K>} */
    _keys: SortableSet<K>;
    /** @type {Map<K, Entry<T, K>>} */
    _map: Map<K, Entry<T, K>>;
    /** @type {Set<T>} */
    _unsortedItems: Set<T>;
    /** @type {number} */
    size: number;
    /**
     * Adds an item to the unsorted staging area so sorting can be deferred until
     * an ordered pop is requested.
     * @param {T} item an item
     * @returns {void}
     */
    add(item: T): void;
    /**
     * Inserts an item into the correct nested bucket, creating intermediate
     * bucket structures on demand.
     * @param {K} key key of item
     * @param {T} item the item
     * @returns {void}
     */
    _addInternal(key: K, item: T): void;
    /**
     * Removes an item from either the unsorted staging area or its resolved
     * bucket and prunes empty buckets as needed.
     * @param {T} item an item
     * @returns {void}
     */
    delete(item: T): void;
    /**
     * Removes an empty bucket key and its corresponding nested entry.
     * @param {K} key key to be removed
     * @returns {void}
     */
    _deleteKey(key: K): void;
    /**
     * Removes and returns the smallest item according to the configured bucket
     * order, sorting only the portions of the structure that are needed.
     * @returns {T | undefined} an item
     */
    popFirst(): T | undefined;
    /**
     * Begins an in-place update for an item and returns a completion callback
     * that can either reinsert it under a new key or remove it entirely.
     * @param {T} item to be updated item
     * @returns {(remove?: true) => void} finish update
     */
    startUpdate(item: T): (remove?: true) => void;
    /**
     * Appends iterators for every stored bucket and leaf to support unordered
     * traversal across the entire structure.
     * @param {Iterator<T>[]} iterators list of iterators to append to
     * @returns {void}
     */
    _appendIterators(iterators: Iterator<T>[]): void;
    /**
     * Iterates over all stored items without imposing bucket sort order.
     * @returns {Iterator<T>} the iterator
     */
    [Symbol.iterator](): Iterator<T>;
}
declare namespace LazyBucketSortedSet {
    export { GetKey, Comparator, Entry, Arg };
}
import SortableSet = require("../util/SortableSet");
/**
 * Callback that extracts the grouping key for an item at one bucket layer.
 */
type GetKey<T, K> = (item: T) => K;
/**
 * Comparison function used to order keys or leaf items.
 */
type Comparator<T> = (a: T, n: T) => number;
/**
 * Internal bucket entry, either another nested bucket set or a sorted leaf set.
 */
type Entry<T, K> = LazyBucketSortedSet<T, K> | SortableSet<T>;
/**
 * Constructor argument accepted for nested bucket layers or the final leaf
 * comparator.
 */
type Arg<T, K> = GetKey<T, K> | Comparator<K> | Comparator<T>;
