/**
 * Returns combined set, may be identical to a or b.
 * @template T
 * @param {Set<T>} a first
 * @param {Set<T>} b second
 * @returns {Set<T>} combined set, may be identical to a or b
 */
export function combine<T>(a: Set<T>, b: Set<T>): Set<T>;
/**
 * Returns found item.
 * @template T
 * @param {Set<T>} set a set
 * @param {(set: T) => boolean} fn selector function
 * @returns {T | undefined} found item
 */
export function find<T>(set: Set<T>, fn: (set: T) => boolean): T | undefined;
/**
 * Returns first item.
 * @template T
 * @param {Set<T> | ReadonlySet<T>} set a set
 * @returns {T | undefined} first item
 */
export function first<T>(set: Set<T> | ReadonlySet<T>): T | undefined;
/**
 * intersect creates Set containing the intersection of elements between all sets
 * @template T
 * @param {Set<T>[]} sets an array of sets being checked for shared elements
 * @returns {Set<T>} returns a new Set containing the intersecting items
 */
export function intersect<T>(sets: Set<T>[]): Set<T>;
/**
 * Checks if a set is the subset of another set
 * @template T
 * @param {Set<T>} bigSet a Set which contains the original elements to compare against
 * @param {Set<T>} smallSet the set whose elements might be contained inside of bigSet
 * @returns {boolean} returns true if bigSet contains all elements inside of smallSet
 */
export function isSubset<T>(bigSet: Set<T>, smallSet: Set<T>): boolean;
