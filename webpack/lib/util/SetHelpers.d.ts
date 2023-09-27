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
 * @returns {boolean} returns true if smallSet contains all elements inside of the bigSet
 */
export function isSubset<T>(bigSet: Set<T>, smallSet: Set<T>): boolean;
/**
 * @template T
 * @param {Set<T>} set a set
 * @param {function(T): boolean} fn selector function
 * @returns {T | undefined} found item
 */
export function find<T>(set: Set<T>, fn: (arg0: T) => boolean): T;
/**
 * @template T
 * @param {Set<T>} set a set
 * @returns {T | undefined} first item
 */
export function first<T>(set: Set<T>): T;
/**
 * @template T
 * @param {Set<T>} a first
 * @param {Set<T>} b second
 * @returns {Set<T>} combined set, may be identical to a or b
 */
export function combine<T>(a: Set<T>, b: Set<T>): Set<T>;
