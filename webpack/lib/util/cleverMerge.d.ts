export type ByValues = Map<string, EXPECTED_ANY>;
export type ObjectParsedPropertyEntry<T> = {
  /**
   * base value
   */
  base: T[keyof T] | undefined;
  /**
   * the name of the selector property
   */
  byProperty: `by${string}` | undefined;
  /**
   * value depending on selector property, merged with base
   */
  byValues: ByValues | undefined;
};
export type DynamicFunction = ((...args: EXPECTED_ANY[]) => object) & {
  [DYNAMIC_INFO]: [DynamicFunction, object];
};
export type ParsedObjectStatic<T extends unknown> = Map<
  keyof T,
  ObjectParsedPropertyEntry<T>
>;
export type ParsedObjectDynamic<T extends unknown> = {
  byProperty: `by${string}`;
  fn: DynamicFunction;
};
export type ParsedObject<T extends unknown> = {
  /**
   * static properties (key is property name)
   */
  static: ParsedObjectStatic<T>;
  /**
   * dynamic part
   */
  dynamic: ParsedObjectDynamic<T> | undefined;
};
export type ByObject =
  | {
      [p: string]: {
        [p: string]: EXPECTED_ANY;
      };
    }
  | DynamicFunction;
export const DELETE: unique symbol;
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
 * @param {T | null | undefined} first first object
 * @param {O | null | undefined} second second object
 * @returns {T & O | T | O} merged object of first and second object
 */
export function cachedCleverMerge<T, O>(
  first: T | null | undefined,
  second: O | null | undefined,
): (T & O) | T | O;
/**
 * @template T
 * @param {Partial<T>} obj object
 * @param {string} property property
 * @param {string | number | boolean} value assignment value
 * @returns {T} new object
 */
export function cachedSetProperty<T>(
  obj: Partial<T>,
  property: string,
  value: string | number | boolean,
): T;
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
export function cleverMerge<T, O>(first: T, second: O): (T & O) | T | O;
/**
 * @template {object} T
 * @param {T} obj the object
 * @param {(keyof T)[]=} keysToKeepOriginalValue keys to keep original value
 * @returns {T} the object without operations like "..." or DELETE
 */
export function removeOperations<T extends unknown>(
  obj: T,
  keysToKeepOriginalValue?: (keyof T)[] | undefined,
): T;
/**
 * @template T
 * @template {keyof T} P
 * @template V
 * @param {T} obj the object
 * @param {P} byProperty the by description
 * @param {...V} values values
 * @returns {Omit<T, P>} object with merged byProperty
 */
export function resolveByProperty<T, P extends keyof T, V>(
  obj: T,
  byProperty: P,
  ...values: V[]
): Omit<T, P>;
declare const DYNAMIC_INFO: unique symbol;
export {};
