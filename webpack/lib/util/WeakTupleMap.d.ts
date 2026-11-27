export = WeakTupleMap;
/**
 * Extracts the element type from a tuple-like array.
 * @template T
 * @typedef {T extends ReadonlyArray<infer ElementType> ? ElementType : never} ArrayElement
 */
/**
 * Stores values by tuple keys while using `WeakMap` for object elements so the
 * cache can release entries when those objects are collected.
 * @template {TupleElement[]} K
 * @template V
 */
declare class WeakTupleMap<K extends TupleElement[], V> {
    /**
     * @private
     * @type {number}
     */
    private f;
    /**
     * @private
     * @type {V | undefined}
     */
    private v;
    /**
     * @private
     * @type {M<K, V> | undefined}
     */
    private m;
    /**
     * @private
     * @type {W<K, V> | undefined}
     */
    private w;
    /**
     * Stores a value at the node identified by the provided tuple key.
     * @param {[...K, V]} args tuple
     * @returns {void}
     */
    set(...args: [...K, V]): void;
    /**
     * Checks whether the exact tuple key has a stored value.
     * @param {K} args tuple
     * @returns {boolean} true, if the tuple is in the Set
     */
    has(...args: K): boolean;
    /**
     * Returns the value stored for the exact tuple key, if any.
     * @param {K} args tuple
     * @returns {V | undefined} the value
     */
    get(...args: K): V | undefined;
    /**
     * Returns an existing value for the tuple or computes, stores, and returns a
     * new one when the tuple is missing.
     * @param {[...K, (...args: K) => V]} args tuple
     * @returns {V} the value
     */
    provide(...args: [...K, (...args: K) => V]): V;
    /**
     * Memoizes `compute(thisArg, ...args)` under the tuple key `[compute,
     * ...args]`, computing it on a miss. Equivalent to `provide(compute, ...args,
     * () => compute(thisArg, ...args))` but without allocating that closure (or an
     * extra rest array) on every call — `ModuleGraph#cached` runs this on hot
     * paths where most calls hit the cache and the closure would be pure waste.
     * @template This
     * @param {(thisArg: This, ...args: K) => V} compute computer, also the first key element
     * @param {This} thisArg first argument passed to `compute`
     * @param {K} args remaining key elements, also passed to `compute`
     * @returns {V} the value
     */
    cachedProvide<This>(compute: (thisArg: This, ...args: K) => V, thisArg: This, args: K): V;
    /**
     * Removes the value stored for the tuple key without pruning the trie.
     * @param {K} args tuple
     * @returns {void}
     */
    delete(...args: K): void;
    /**
     * Clears the stored value and all strong and weak child maps from this node.
     * @returns {void}
     */
    clear(): void;
    /**
     * Returns the value stored directly on this trie node.
     * @returns {V | undefined} stored value
     */
    _getValue(): V | undefined;
    /**
     * Reports whether this trie node currently stores a value.
     * @returns {boolean} true when a value is present
     */
    _hasValue(): boolean;
    /**
     * Stores a value directly on this trie node.
     * @param {V} v value
     * @private
     */
    private _setValue;
    /**
     * Removes the value stored directly on this trie node.
     */
    _deleteValue(): void;
    /**
     * Returns the child node for a tuple element without creating one.
     * @param {ArrayElement<K>} thing thing
     * @returns {WeakTupleMap<K, V> | undefined} thing
     * @private
     */
    private _peek;
    /**
     * Returns the child node for a tuple element, creating and storing it when
     * necessary.
     * @private
     * @param {ArrayElement<K>} thing thing
     * @returns {WeakTupleMap<K, V>} value
     */
    private _get;
}
declare namespace WeakTupleMap {
    export { TupleElement, M, W, ArrayElement };
}
/**
 * A value one position of a tuple key may hold: a primitive kept in a `Map`, or
 * an object (functions included) kept in a `WeakMap`.
 */
type TupleElement = string | number | bigint | boolean | symbol | EXPECTED_OBJECT | null | undefined;
/**
 * Strong-key child map used for tuple elements that cannot be stored in a
 * `WeakMap`.
 */
type M<T extends TupleElement[], V> = Map<ArrayElement<T>, WeakTupleMap<T, V>>;
/**
 * Weak-key child map used for tuple elements that are objects and can be held
 * without preventing garbage collection.
 */
type W<T extends TupleElement[], V> = WeakMap<ArrayElement<T> & EXPECTED_OBJECT, WeakTupleMap<T, V>>;
/**
 * Extracts the element type from a tuple-like array.
 */
type ArrayElement<T> = T extends ReadonlyArray<infer ElementType> ? ElementType : never;
