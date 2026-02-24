/**
 * @template T
 * @param {Iterable<T>} iterable an iterable
 * @returns {number} count of items
 */
export function countIterable<T>(iterable: Iterable<T>): number;
/**
 * @template T
 * @param {Iterable<T>} set a set
 * @returns {T | undefined} last item
 */
export function last<T>(set: Iterable<T>): T | undefined;
/**
 * @template T
 * @param {Iterable<T>} iterable iterable
 * @param {(value: T) => boolean | null | undefined} filter predicate
 * @returns {boolean} true, if some items match the filter predicate
 */
export function someInIterable<T>(
  iterable: Iterable<T>,
  filter: (value: T) => boolean | null | undefined,
): boolean;
