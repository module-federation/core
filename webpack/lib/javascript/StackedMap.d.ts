export = StackedMap;
/**
 * Layered map that supports child scopes while memoizing lookups from parent
 * scopes. Layers form a linked parent chain, so `createChild` is O(1) instead
 * of copying a layer array per scope. A layer's `Map` is only allocated on its
 * first own write, and lookup results are memoized into the nearest
 * `Map`-bearing layer of the walk — read-only layers (most block scopes) stay
 * allocation-free and share their parent's memoized entries.
 * @template K
 * @template V
 */
declare class StackedMap<K, V> {
    /**
     * Creates a new map layer on top of an optional parent.
     * @param {StackedMap<K, V>=} parent an optional parent map
     */
    constructor(parent?: StackedMap<K, V> | undefined);
    /** @type {Map<K, InternalCell<V>> | undefined} */
    map: Map<K, InternalCell<V>> | undefined;
    /** @type {StackedMap<K, V> | undefined} */
    parent: StackedMap<K, V> | undefined;
    /**
     * Stores a value in the current layer, preserving explicit `undefined`
     * values with an internal marker.
     * @param {K} item the key of the element to add
     * @param {V} value the value of the element to add
     * @returns {void}
     */
    set(item: K, value: V): void;
    /**
     * Deletes a key from the current view, either by removing it outright in the
     * root layer or by recording a tombstone in child layers.
     * @param {K} item the item to delete
     * @returns {void}
     */
    delete(item: K): void;
    /**
     * Checks whether a key exists in the current scope chain, caching any parent
     * lookup result in the nearest `Map`-bearing layer.
     * @param {K} item the item to test
     * @returns {boolean} true if the item exists in this set
     */
    has(item: K): boolean;
    /**
     * Returns the visible value for a key, caching parent hits and misses in the
     * nearest `Map`-bearing layer so repeated lookups (from this layer or any
     * sibling below that layer) answer with a single probe.
     * @param {K} item the key of the element to return
     * @returns {Cell<V>} the value of the element
     */
    get(item: K): Cell<V>;
    /**
     * Collapses the parent chain into a single concrete map.
     */
    _compress(): void;
    /**
     * Returns the visible keys as an array after collapsing the stack.
     * @returns {K[]} array of keys
     */
    asArray(): K[];
    /**
     * Returns the visible keys as a `Set` after collapsing the stack.
     * @returns {Set<K>} set of keys
     */
    asSet(): Set<K>;
    /**
     * Returns visible key/value pairs using the external representation.
     * @returns {[K, Cell<V>][]} array of key/value pairs
     */
    asPairArray(): [K, Cell<V>][];
    /**
     * Returns the visible contents as a plain `Map`.
     * @returns {Map<K, Cell<V>>} materialized map
     */
    asMap(): Map<K, Cell<V>>;
    /**
     * Returns the number of visible keys after collapsing the stack.
     * @returns {number} number of keys
     */
    get size(): number;
    /**
     * Creates a child `StackedMap` that sees the current layers as its parent
     * scope.
     * @returns {StackedMap<K, V>} child map
     */
    createChild(): StackedMap<K, V>;
}
declare namespace StackedMap {
    export { Cell, InternalCell };
}
/**
 * <T>
 */
type Cell<T> = T | undefined;
/**
 * <T>
 */
type InternalCell<T> = T | typeof TOMBSTONE | typeof UNDEFINED_MARKER;
declare const TOMBSTONE: unique symbol;
declare const UNDEFINED_MARKER: unique symbol;
