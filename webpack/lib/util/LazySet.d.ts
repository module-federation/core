export = LazySet;
/**
 * Defines the set iterator type used by this module.
 * @template T
 * @typedef {import("typescript-iterable").SetIterator<T>} SetIterator
 */
/**
 * Like Set but with an addAll method to eventually add items from another iterable.
 * Access methods make sure that all delayed operations are executed.
 * Iteration methods deopts to normal Set performance until clear is called again (because of the chance of modifications during iteration).
 * @template T
 */
declare class LazySet<T> {
    /**
     * Restores a `LazySet` from serialized item data.
     * @template T
     * @param {import("../serialization/ObjectMiddleware").ObjectDeserializerContext<(number | T)[]>} context context
     * @returns {LazySet<T>} lazy set
     */
    static deserialize<T_1>({ read }: import("../serialization/ObjectMiddleware").ObjectDeserializerContext<(number | T_1)[]>): LazySet<T_1>;
    /**
     * Seeds the set with an optional iterable while preparing internal queues for
     * deferred merges.
     * @param {Iterable<T>=} iterable init iterable
     */
    constructor(iterable?: Iterable<T> | undefined);
    /** @type {Set<T>} */
    _set: Set<T>;
    /** @type {Set<Iterable<T>> | undefined} */
    _toMerge: Set<Iterable<T>> | undefined;
    /** @type {LazySet<T>[] | undefined} */
    _toDeepMerge: LazySet<T>[] | undefined;
    /** @type {boolean} */
    _needMerge: boolean;
    /** @type {boolean} */
    _deopt: boolean;
    /**
     * Flattens any nested lazy sets that were queued for merging.
     */
    _flatten(): void;
    /**
     * Materializes all deferred additions into the backing set.
     */
    _merge(): void;
    /**
     * Reports whether the set is empty without forcing a full merge.
     * @returns {boolean} true when no items have been stored or queued
     */
    _isEmpty(): boolean;
    /**
     * Returns the number of items after applying any deferred merges.
     * @returns {number} number of items in the set
     */
    get size(): number;
    /**
     * Adds a single item immediately to the concrete backing set.
     * @param {T} item an item
     * @returns {LazySet<T>} itself
     */
    add(item: T): LazySet<T>;
    /**
     * Queues another iterable or lazy set for later merging so large bulk adds
     * can stay cheap until the set is read.
     * @param {Iterable<T> | LazySet<T>} iterable a immutable iterable or another immutable LazySet which will eventually be merged into the Set
     * @returns {LazySet<T>} itself
     */
    addAll(iterable: Iterable<T> | LazySet<T>): LazySet<T>;
    /**
     * Removes all items and clears every deferred merge queue.
     */
    clear(): void;
    /**
     * Deletes an item after first materializing any deferred additions that may
     * contain it.
     * @param {T} value an item
     * @returns {boolean} true, if the value was in the Set before
     */
    delete(value: T): boolean;
    /**
     * Returns the set's entry iterator and permanently switches future
     * operations to eager merge mode to preserve iterator correctness.
     * @returns {SetIterator<[T, T]>} entries
     */
    entries(): SetIterator<[T, T]>;
    /**
     * Iterates over every item after forcing pending merges and switching to
     * eager mode for correctness during iteration.
     * @template K
     * @param {(value: T, value2: T, set: Set<T>) => void} callbackFn function called for each entry
     * @param {K} thisArg this argument for the callbackFn
     * @returns {void}
     */
    forEach<K>(callbackFn: (value: T, value2: T, set: Set<T>) => void, thisArg: K): void;
    /**
     * Checks whether an item is present after applying any deferred merges.
     * @param {T} item an item
     * @returns {boolean} true, when the item is in the Set
     */
    has(item: T): boolean;
    /**
     * Returns the key iterator, eagerly materializing pending merges first.
     * @returns {SetIterator<T>} keys
     */
    keys(): SetIterator<T>;
    /**
     * Returns the value iterator, eagerly materializing pending merges first.
     * @returns {SetIterator<T>} values
     */
    values(): SetIterator<T>;
    /**
     * Serializes the fully materialized set contents into webpack's object
     * serialization stream.
     * @param {import("../serialization/ObjectMiddleware").ObjectSerializerContext<(number | T)[]>} context context
     */
    serialize({ write }: import("../serialization/ObjectMiddleware").ObjectSerializerContext<(number | T)[]>): void;
    /**
     * Returns the default iterator over values after forcing pending merges.
     * @returns {SetIterator<T>} iterable iterator
     */
    [Symbol.iterator](): SetIterator<T>;
    get [Symbol.toStringTag](): string;
}
declare namespace LazySet {
    export { SetIterator };
}
/**
 * Defines the set iterator type used by this module.
 */
type SetIterator<T> = any;
