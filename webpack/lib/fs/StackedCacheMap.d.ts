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
     * Adds another cache layer. Immutable maps are retained by reference and
     * reordered so larger layers are checked first, while mutable maps are
     * copied into the fallback map.
     * @param {ReadonlyMap<K, V>} map map to add
     * @param {boolean=} immutable if 'map' is immutable and StackedCacheMap can keep referencing it
     */
    addAll(map: ReadonlyMap<K, V>, immutable?: boolean | undefined): void;
    /**
     * Stores or overrides a value in the mutable fallback map.
     * @param {K} item the key of the element to add
     * @param {V} value the value of the element to add
     * @returns {void}
     */
    set(item: K, value: V): void;
    /**
     * Rejects deletions because this data structure is optimized for append-only
     * cache layers.
     * @param {K} item the item to delete
     * @returns {void}
     */
    delete(item: K): void;
    /**
     * Rejects `has` checks because they would force the same layered lookup work
     * as `get` without returning the cached value.
     * @param {K} item the item to test
     * @returns {boolean} true if the item exists in this set
     */
    has(item: K): boolean;
    /**
     * Looks up a key by scanning immutable cache layers first and then the
     * mutable fallback map.
     * @param {K} item the key of the element to return
     * @returns {V | undefined} the value of the element
     */
    get(item: K): V | undefined;
    /**
     * Removes every cache layer and clears the mutable fallback map.
     */
    clear(): void;
    /**
     * Returns the total number of entries across the fallback map and all stacked
     * cache layers.
     * @returns {number} size of the map
     */
    get size(): number;
    /**
     * Iterates over the fallback map first and then each stacked cache layer.
     * @returns {Iterator<[K, V]>} iterator
     */
    [Symbol.iterator](): Iterator<[K, V]>;
}
