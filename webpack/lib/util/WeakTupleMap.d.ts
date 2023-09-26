export = WeakTupleMap;
/**
 * @template {any[]} T
 * @template V
 */
declare class WeakTupleMap<T extends any[], V> {
  /** @private */
  private f;
  /** @private @type {any} */
  private v;
  /** @private @type {Map<object, WeakTupleMap<T, V>> | undefined} */
  private m;
  /** @private @type {WeakMap<object, WeakTupleMap<T, V>> | undefined} */
  private w;
  /**
   * @param {[...T, V]} args tuple
   * @returns {void}
   */
  set(...args: [...T, V]): void;
  /**
   * @param {T} args tuple
   * @returns {boolean} true, if the tuple is in the Set
   */
  has(...args: T): boolean;
  /**
   * @param {T} args tuple
   * @returns {V} the value
   */
  get(...args: T): V;
  /**
   * @param {[...T, function(): V]} args tuple
   * @returns {V} the value
   */
  provide(...args: [...T, () => V]): V;
  /**
   * @param {T} args tuple
   * @returns {void}
   */
  delete(...args: T): void;
  /**
   * @returns {void}
   */
  clear(): void;
  _getValue(): any;
  _hasValue(): boolean;
  _setValue(v: any): void;
  _deleteValue(): void;
  _peek(thing: any): WeakTupleMap<T, V>;
  _get(thing: any): any;
}
