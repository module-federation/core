export = compileBooleanMatcher;
/**
 * @param {Record<string | number, boolean>} map value map
 * @returns {boolean | ((value: string) => string)} true/false, when unconditionally true/false, or a template function to determine the value at runtime
 */
declare function compileBooleanMatcher(
  map: Record<string | number, boolean>,
): boolean | ((value: string) => string);
declare namespace compileBooleanMatcher {
  export {
    compileBooleanMatcherFromLists as fromLists,
    itemsToRegexp,
    ListOfCommonItems,
  };
}
/**
 * @param {string[]} positiveItems positive items
 * @param {string[]} negativeItems negative items
 * @returns {(value: string) => string} a template function to determine the value at runtime
 */
declare function compileBooleanMatcherFromLists(
  positiveItems: string[],
  negativeItems: string[],
): (value: string) => string;
/**
 * @param {string[]} itemsArr array of items
 * @returns {string} regexp
 */
declare function itemsToRegexp(itemsArr: string[]): string;
type ListOfCommonItems = string[][];
