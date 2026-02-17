export = compileBooleanMatcher;
/**
 * @param {Record<string|number, boolean>} map value map
 * @returns {boolean|(function(string): string)} true/false, when unconditionally true/false, or a template function to determine the value at runtime
 */
declare function compileBooleanMatcher(
  map: Record<string | number, boolean>,
): boolean | ((arg0: string) => string);
declare namespace compileBooleanMatcher {
  export { compileBooleanMatcherFromLists as fromLists };
  export { itemsToRegexp };
}
/**
 * @param {string[]} positiveItems positive items
 * @param {string[]} negativeItems negative items
 * @returns {function(string): string} a template function to determine the value at runtime
 */
declare function compileBooleanMatcherFromLists(
  positiveItems: string[],
  negativeItems: string[],
): (arg0: string) => string;
/**
 * @param {Array<string>} itemsArr array of items
 * @returns {string} regexp
 */
declare function itemsToRegexp(itemsArr: Array<string>): string;
