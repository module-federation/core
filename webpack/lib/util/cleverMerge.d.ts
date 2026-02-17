export type ObjectParsedPropertyEntry = {
  /**
   * base value
   */
  base: any | undefined;
  /**
   * the name of the selector property
   */
  byProperty: string | undefined;
  /**
   * value depending on selector property, merged with base
   */
  byValues: Map<string, any>;
};
export type ParsedObject = {
  /**
   * static properties (key is property name)
   */
  static: Map<string, ObjectParsedPropertyEntry>;
  /**
   * dynamic part
   */
  dynamic:
    | {
        byProperty: string;
        fn: Function;
      }
    | undefined;
};
/**
 * @template T
 * @param {Partial<T>} obj object
 * @param {string} property property
 * @param {string|number|boolean} value assignment value
 * @returns {T} new object
 */
export function cachedSetProperty<T>(
  obj: Partial<T>,
  property: string,
  value: string | number | boolean,
): T;
/**
 * Merges two given objects and caches the result to avoid computation if same objects passed as arguments again.
 * @template T
 * @template O
 * @example
 * // performs cleverMerge(first, second), stores the result in WeakMap and returns result
 * cachedCleverMerge({a: 1}, {a: 2})
 * {a: 2}
 *  // when same arguments passed, gets the result from WeakMap and returns it.
 * cachedCleverMerge({a: 1}, {a: 2})
 * {a: 2}
 * @param {T} first first object
 * @param {O} second second object
 * @returns {T & O | T | O} merged object of first and second object
 */
export function cachedCleverMerge<T, O>(first: T, second: O): T | O | (T & O);
/**
 * Merges two objects. Objects are deeply clever merged.
 * Arrays might reference the old value with "...".
 * Non-object values take preference over object values.
 * @template T
 * @template O
 * @param {T} first first object
 * @param {O} second second object
 * @returns {T & O | T | O} merged object of first and second object
 */
export function cleverMerge<T, O>(first: T, second: O): T | O | (T & O);
/**
 * @template T
 * @template {string} P
 * @param {T} obj the object
 * @param {P} byProperty the by description
 * @param  {...any} values values
 * @returns {Omit<T, P>} object with merged byProperty
 */
export function resolveByProperty<T, P extends string>(
  obj: T,
  byProperty: P,
  ...values: any[]
): Omit<T, P>;
/**
 * @template T
 * @param {T} obj the object
 * @returns {T} the object without operations like "..." or DELETE
 */
export function removeOperations<T>(obj: T): T;
export const DELETE: unique symbol;
