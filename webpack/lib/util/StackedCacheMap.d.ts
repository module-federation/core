export = StackedCacheMap;
/**
 * The StackedCacheMap is a data structure designed as an alternative to a Map
 * in situations where you need to handle multiple item additions and
 * frequently access the largest map.
 *
 * It is particularly optimized for efficiently adding multiple items
 * at once, which can be achieved using the `addAll` method.
 *
 * It has a fallback Map that is used when the map to be added is mutable.
 *
 * Note: `delete` and `has` are not supported for performance reasons.
 * @example
 * ```js
 * const map = new StackedCacheMap();
 * map.addAll(new Map([["a", 1], ["b", 2]]), true);
 * map.addAll(new Map([["c", 3], ["d", 4]]), true);
 * map.get("a"); // 1
 * map.get("d"); // 4
 * for (const [key, value] of map) {
 * 		console.log(key, value);
 * }
 * ```
 * @template K
 * @template V
 */
declare class StackedCacheMap<K, V> {
  /** @type {Map<K, V>} */
  map: Map<K, V>;
  /** @type {ReadonlyMap<K, V>[]} */
  stack: ReadonlyMap<K, V>[];
  /**
   * If `immutable` is true, the map can be referenced by the StackedCacheMap
   * and should not be changed afterwards. If the map is mutable, all items
   * are copied into a fallback Map.
   * @param {ReadonlyMap<K, V>} map map to add
   * @param {boolean=} immutable if 'map' is immutable and StackedCacheMap can keep referencing it
   */
  addAll(map: ReadonlyMap<K, V>, immutable?: boolean | undefined): void;
  /**
   * @param {K} item the key of the element to add
   * @param {V} value the value of the element to add
   * @returns {void}
   */
  set(item: K, value: V): void;
  /**
   * @param {K} item the item to delete
   * @returns {void}
   */
  delete(item: K): void;
  /**
   * @param {K} item the item to test
   * @returns {boolean} true if the item exists in this set
   */
  has(item: K): boolean;
  /**
   * @param {K} item the key of the element to return
   * @returns {V | undefined} the value of the element
   */
  get(item: K): V | undefined;
  clear(): void;
  /**
   * @returns {number} size of the map
   */
  get size(): number;
  /**
   * @returns {Iterator<[K, V]>} iterator
   */
  [Symbol.iterator](): Iterator<[K, V]>;
}
