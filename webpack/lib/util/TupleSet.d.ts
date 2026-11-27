export = TupleSet;
/**
 * Nested map structure used to index tuple prefixes until the final tuple
 * element can be stored in a `Set`.
 * @template K
 * @template V
 * @typedef {Map<K, InnerMap<K, V> | Set<V>>} InnerMap
 */
/**
 * Stores tuples of arbitrary length while preserving efficient prefix lookups
 * through a tree of maps that ends in a set of final values.
 * @template {EXPECTED_ANY[]} K
 * @template V
 */
declare class TupleSet<K extends EXPECTED_ANY[], V> {
    /**
     * Seeds the tuple set with an optional iterable of tuples.
     * @param {Iterable<[...K, V]>=} init init
     */
    constructor(init?: Iterable<[...K, V]> | undefined);
    /** @type {InnerMap<K[number], V>} */
    _map: InnerMap<K[number], V>;
    /** @type {number} */
    size: number;
    /**
     * Adds a tuple to the set, creating any missing prefix maps along the way.
     * @param {[...K, V]} args tuple
     * @returns {void}
     */
    add(...args: [...K, V]): void;
    /**
     * Checks whether the exact tuple is already present in the set.
     * @param {[...K, V]} args tuple
     * @returns {boolean} true, if the tuple is in the Set
     */
    has(...args: [...K, V]): boolean;
    /**
     * Removes a tuple from the set when it is present.
     * @param {[...K, V]} args tuple
     * @returns {void}
     */
    delete(...args: [...K, V]): void;
    /**
     * Iterates over every stored tuple by walking the nested map structure and
     * yielding each complete prefix plus its terminal set value.
     * @returns {Iterator<[...K, V]>} iterator
     */
    [Symbol.iterator](): Iterator<[...K, V]>;
}
declare namespace TupleSet {
    export { InnerMap };
}
/**
 * Nested map structure used to index tuple prefixes until the final tuple
 * element can be stored in a `Set`.
 */
type InnerMap<K, V> = Map<K, InnerMap<K, V> | Set<V>>;
