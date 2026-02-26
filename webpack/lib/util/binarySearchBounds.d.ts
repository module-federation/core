declare namespace _exports {
  export { BinarySearchPredicate, SearchPredicateSuffix };
}
declare namespace _exports {
  let ge: (
    items: any[],
    start: number,
    compareFn?: number | ((item: any, needle: number) => number),
    l?: number,
    h?: number,
  ) => number;
  let gt: (
    items: any[],
    start: number,
    compareFn?: number | ((item: any, needle: number) => number),
    l?: number,
    h?: number,
  ) => number;
  let lt: (
    items: any[],
    start: number,
    compareFn?: number | ((item: any, needle: number) => number),
    l?: number,
    h?: number,
  ) => number;
  let le: (
    items: any[],
    start: number,
    compareFn?: number | ((item: any, needle: number) => number),
    l?: number,
    h?: number,
  ) => number;
  let eq: (
    items: any[],
    start: number,
    compareFn?: number | ((item: any, needle: number) => number),
    l?: number,
    h?: number,
  ) => number;
}
export = _exports;
type BinarySearchPredicate = '>=' | '<=' | '<' | '>' | '-';
type SearchPredicateSuffix = 'GE' | 'GT' | 'LT' | 'LE' | 'EQ';
