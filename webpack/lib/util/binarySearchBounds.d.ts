export type BinarySearchPredicate = ">=" | "<=" | "<" | ">" | "-";
export type SearchPredicateSuffix = "GE" | "GT" | "LT" | "LE" | "EQ";
/**
 * Defines the search type used by this module.
 */
export type Search<T> = (items: T[], start: number, compareFn?: number | ((item: T, needle: number) => number), l?: number, h?: number) => number;
