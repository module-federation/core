export = LazySet;
/**
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
   * @template T
   * @param {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} context context
   * @returns {LazySet<T>} lazy set
   */
  static deserialize<T_1>({
    read,
  }: import('../serialization/ObjectMiddleware').ObjectDeserializerContext): LazySet<T_1>;
  /**
   * @param {Iterable<T>=} iterable init iterable
   */
  constructor(iterable?: Iterable<T> | undefined);
  /** @type {Set<T>} */
  _set: Set<T>;
  /** @type {Set<Iterable<T>>} */
  _toMerge: Set<Iterable<T>>;
  /** @type {LazySet<T>[]} */
  _toDeepMerge: LazySet<T>[];
  _needMerge: boolean;
  _deopt: boolean;
  _flatten(): void;
  _merge(): void;
  _isEmpty(): boolean;
  get size(): number;
  /**
   * @param {T} item an item
   * @returns {LazySet<T>} itself
   */
  add(item: T): LazySet<T>;
  /**
   * @param {Iterable<T> | LazySet<T>} iterable a immutable iterable or another immutable LazySet which will eventually be merged into the Set
   * @returns {LazySet<T>} itself
   */
  addAll(iterable: Iterable<T> | LazySet<T>): LazySet<T>;
  clear(): void;
  /**
   * @param {T} value an item
   * @returns {boolean} true, if the value was in the Set before
   */
  delete(value: T): boolean;
  /**
   * @returns {SetIterator<[T, T]>} entries
   */
  entries(): SetIterator<[T, T]>;
  /**
   * @template K
   * @param {(value: T, value2: T, set: Set<T>) => void} callbackFn function called for each entry
   * @param {K} thisArg this argument for the callbackFn
   * @returns {void}
   */
  forEach<K>(
    callbackFn: (value: T, value2: T, set: Set<T>) => void,
    thisArg: K,
  ): void;
  /**
   * @param {T} item an item
   * @returns {boolean} true, when the item is in the Set
   */
  has(item: T): boolean;
  /**
   * @returns {SetIterator<T>} keys
   */
  keys(): SetIterator<T>;
  /**
   * @returns {SetIterator<T>} values
   */
  values(): SetIterator<T>;
  /**
   * @param {import("../serialization/ObjectMiddleware").ObjectSerializerContext} context context
   */
  serialize({
    write,
  }: import('../serialization/ObjectMiddleware').ObjectSerializerContext): void;
  /**
   * @returns {SetIterator<T>} iterable iterator
   */
  [Symbol.iterator](): SetIterator<T>;
  get [Symbol.toStringTag](): string;
}
declare namespace LazySet {
  export { SetIterator };
}
type SetIterator<T> = any;
