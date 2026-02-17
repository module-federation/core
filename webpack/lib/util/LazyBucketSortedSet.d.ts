export = LazyBucketSortedSet;
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
   * @param {function(T): K} getKey function to get key from item
   * @param {function(K, K): number} comparator comparator to sort keys
   * @param  {...((function(T): any) | (function(any, any): number))} args more pairs of getKey and comparator plus optional final comparator for the last layer
   */
  constructor(
    getKey: (arg0: T) => K,
    comparator: (arg0: K, arg1: K) => number,
    ...args: (((arg0: T) => any) | ((arg0: any, arg1: any) => number))[]
  );
  _getKey: (arg0: T) => K;
  _innerArgs: (((arg0: T) => any) | ((arg0: any, arg1: any) => number))[];
  _leaf: boolean;
  _keys: SortableSet<K>;
  /** @type {Map<K, LazyBucketSortedSet<T, any> | SortableSet<T>>} */
  _map: Map<K, LazyBucketSortedSet<T, any> | SortableSet<T>>;
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
   * @returns {function(true=): void} finish update
   */
  startUpdate(item: T): (arg0: true | undefined) => void;
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
import SortableSet = require('./SortableSet');
