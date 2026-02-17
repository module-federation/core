export = StackedMap;
/**
 * @template K
 * @template V
 */
declare class StackedMap<K, V> {
  /**
   * @param {Map<K, InternalCell<V>>[]=} parentStack an optional parent
   */
  constructor(parentStack?: Map<K, InternalCell<V>>[] | undefined);
  /** @type {Map<K, InternalCell<V>>} */
  map: Map<K, InternalCell<V>>;
  /** @type {Map<K, InternalCell<V>>[]} */
  stack: Map<K, InternalCell<V>>[];
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
   * @returns {Cell<V>} the value of the element
   */
  get(item: K): Cell<V>;
  _compress(): void;
  asArray(): K[];
  asSet(): Set<K>;
  asPairArray(): [K, V][];
  asMap(): Map<K, V>;
  get size(): number;
  createChild(): import('./StackedMap')<K, V>;
}
declare namespace StackedMap {
  export { Cell, InternalCell };
}
/**
 * <T>
 */
type InternalCell<T> = T | typeof TOMBSTONE | typeof UNDEFINED_MARKER;
/**
 * <T>
 */
type Cell<T> = T | undefined;
declare const TOMBSTONE: unique symbol;
declare const UNDEFINED_MARKER: unique symbol;
