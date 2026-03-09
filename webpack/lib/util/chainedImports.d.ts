export function getTrimmedIdsAndRange(
  untrimmedIds: string[],
  untrimmedRange: Range,
  ranges: IdRanges | undefined,
  moduleGraph: ModuleGraph,
  dependency: Dependency,
): {
  trimmedIds: string[];
  trimmedRange: Range;
};
export type Dependency = import('../Dependency');
export type Module = import('../Module');
export type ModuleGraph = import('../ModuleGraph');
export type Range = import('../javascript/JavascriptParser').Range;
export type IdRanges = Range[];
