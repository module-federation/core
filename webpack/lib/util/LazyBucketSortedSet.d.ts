export = LazyBucketSortedSet;
/**
 * @template T
 * @template K
 * @typedef {(item: T) => K} GetKey
 */
/**
 * @template T
 * @typedef {(a: T, n: T) => number} Comparator
 */
/**
 * @template T
 * @template K
 * @typedef {LazyBucketSortedSet<T, K> | SortableSet<T>} Entry
 */
/**
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
     * @param {GetKey<T, K>} getKey function to get key from item
     * @param {Comparator<K>=} comparator comparator to sort keys
     * @param {...Arg<T, K>} args more pairs of getKey and comparator plus optional final comparator for the last layer
     */
    constructor(getKey: GetKey<T, K>, comparator?: Comparator<K> | undefined, ...args: Arg<T, K>[]);
    _getKey: GetKey<T, K>;
    _innerArgs: Arg<T, K>[];
    _leaf: boolean;
    _keys: SortableSet<K>;
    /** @type {Map<K, Entry<T, K>>} */
    _map: Map<K, Entry<T, K>>;
    _unsortedItems: Set<any>;
    size: number;
    /**
     * @param {T} item an item
     * @returns {void}
     */
    add(item: T): void;
    /**
     * @param {K} key key of item
     * @param {T} item the item
     * @returns {void}
     */
    _addInternal(key: K, item: T): void;
    /**
     * @param {T} item an item
     * @returns {void}
     */
    delete(item: T): void;
    /**
     * @param {K} key key to be removed
     * @returns {void}
     */
    _deleteKey(key: K): void;
    /**
     * @returns {T | undefined} an item
     */
    popFirst(): T | undefined;
    /**
     * @param {T} item to be updated item
     * @returns {(remove?: true) => void} finish update
     */
    startUpdate(item: T): (remove?: true) => void;
    /**
     * @param {Iterator<T>[]} iterators list of iterators to append to
     * @returns {void}
     */
    _appendIterators(iterators: Iterator<T>[]): void;
    /**
     * @returns {Iterator<T>} the iterator
     */
    [Symbol.iterator](): Iterator<T>;
}
declare namespace LazyBucketSortedSet {
    export { GetKey, Comparator, Entry, Arg };
}
import SortableSet = require("./SortableSet");
type GetKey<T, K> = (item: T) => K;
type Comparator<T> = (a: T, n: T) => number;
type Entry<T, K> = LazyBucketSortedSet<T, K> | SortableSet<T>;
type Arg<T, K> = GetKey<T, K> | Comparator<K> | Comparator<T>;
