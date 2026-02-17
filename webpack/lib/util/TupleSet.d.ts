export = TupleSet;
/**
 * @template {any[]} T
 */
declare class TupleSet<T extends any[]> {
  constructor(init: any);
  _map: Map<any, any>;
  size: number;
  /**
   * @param  {T} args tuple
   * @returns {void}
   */
  add(...args: T): void;
  /**
   * @param  {T} args tuple
   * @returns {boolean} true, if the tuple is in the Set
   */
  has(...args: T): boolean;
  /**
   * @param {T} args tuple
   * @returns {void}
   */
  delete(...args: T): void;
  /**
   * @returns {Iterator<T>} iterator
   */
  [Symbol.iterator](): Iterator<T>;
}
