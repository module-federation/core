export = WeakTupleMap;
/**
 * @template {unknown[]} T
 * @typedef {T extends ReadonlyArray<infer ElementType> ? ElementType : never} ArrayElement
 */
/**
 * @template {EXPECTED_ANY[]} K
 * @template V
 */
declare class WeakTupleMap<K extends EXPECTED_ANY[], V> {
  /** @private */
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
   * @param {[...K, V]} args tuple
   * @returns {void}
   */
  set(...args: [...K, V]): void;
  /**
   * @param {K} args tuple
   * @returns {boolean} true, if the tuple is in the Set
   */
  has(...args: K): boolean;
  /**
   * @param {K} args tuple
   * @returns {V | undefined} the value
   */
  get(...args: K): V | undefined;
  /**
   * @param {[...K, (...args: K) => V]} args tuple
   * @returns {V} the value
   */
  provide(...args: [...K, (...args: K) => V]): V;
  /**
   * @param {K} args tuple
   * @returns {void}
   */
  delete(...args: K): void;
  /**
   * @returns {void}
   */
  clear(): void;
  _getValue(): V;
  _hasValue(): boolean;
  /**
   * @param {V} v value
   * @private
   */
  private _setValue;
  _deleteValue(): void;
  /**
   * @param {ArrayElement<K>} thing thing
   * @returns {WeakTupleMap<K, V> | undefined} thing
   * @private
   */
  private _peek;
  /**
   * @private
   * @param {ArrayElement<K>} thing thing
   * @returns {WeakTupleMap<K, V>} value
   */
  private _get;
}
declare namespace WeakTupleMap {
  export { M, W, ArrayElement };
}
type M<T extends EXPECTED_ANY[], V> = Map<EXPECTED_ANY, WeakTupleMap<T, V>>;
type W<T extends EXPECTED_ANY[], V> = WeakMap<
  EXPECTED_OBJECT,
  WeakTupleMap<T, V>
>;
type ArrayElement<T extends unknown[]> =
  T extends ReadonlyArray<infer ElementType> ? ElementType : never;
