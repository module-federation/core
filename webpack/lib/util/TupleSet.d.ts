export = TupleSet;
/**
 * @template K
 * @template V
 * @typedef {Map<K, InnerMap<K, V> | Set<V>>} InnerMap
 */
/**
 * @template T
 * @template V
 */
declare class TupleSet<T, V> {
  /**
   * @param {Iterable<[T, V, ...EXPECTED_ANY]>=} init init
   */
  constructor(init?: Iterable<[T, V, ...EXPECTED_ANY]> | undefined);
  /** @type {InnerMap<T, V>} */
  _map: InnerMap<T, V>;
  size: number;
  /**
   * @param {[T, V, ...EXPECTED_ANY]} args tuple
   * @returns {void}
   */
  add(args_0: T, args_1: V, ...args: EXPECTED_ANY[]): void;
  /**
   * @param {[T, V, ...EXPECTED_ANY]} args tuple
   * @returns {boolean} true, if the tuple is in the Set
   */
  has(args_0: T, args_1: V, ...args: EXPECTED_ANY[]): boolean;
  /**
   * @param {[T, V, ...EXPECTED_ANY]} args tuple
   * @returns {void}
   */
  delete(args_0: T, args_1: V, ...args: EXPECTED_ANY[]): void;
  /**
   * @returns {Iterator<[T, V, ...EXPECTED_ANY]>} iterator
   */
  [Symbol.iterator](): Iterator<[T, V, ...EXPECTED_ANY]>;
}
declare namespace TupleSet {
  export { InnerMap };
}
type InnerMap<K, V> = Map<K, InnerMap<K, V> | Set<V>>;
