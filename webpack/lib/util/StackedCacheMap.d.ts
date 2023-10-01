export = StackedCacheMap;
/**
 * @template K
 * @template V
 */
declare class StackedCacheMap<K, V> {
  /** @type {Map<K, V>} */
  map: Map<K, V>;
  /** @type {ReadonlyMap<K, V>[]} */
  stack: ReadonlyMap<K, V>[];
  /**
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
   * @returns {V} the value of the element
   */
  get(item: K): V;
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
