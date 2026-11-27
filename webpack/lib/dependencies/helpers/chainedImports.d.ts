export function getTrimmedIdsAndRange(untrimmedIds: string[], untrimmedRange: Range, ranges: IdRanges | undefined, moduleGraph: ModuleGraph, dependency: Dependency): {
    trimmedIds: string[];
    trimmedRange: Range;
};
export type IdRanges = Range[];
import type { Range } from "../../javascript/JavascriptParser";
import type ModuleGraph from "../../graph/ModuleGraph";
import type Dependency from "../../graph/Dependency";
