/**
 * @template T
 * @param {Iterable<T>} set a set
 * @returns {T | undefined} last item
 */
export function last<T>(set: Iterable<T>): T;
/**
 * @template T
 * @param {Iterable<T>} iterable iterable
 * @param {function(T): boolean} filter predicate
 * @returns {boolean} true, if some items match the filter predicate
 */
export function someInIterable<T>(
  iterable: Iterable<T>,
  filter: (arg0: T) => boolean,
): boolean;
/**
 * @template T
 * @param {Iterable<T>} iterable an iterable
 * @returns {number} count of items
 */
export function countIterable<T>(iterable: Iterable<T>): number;
