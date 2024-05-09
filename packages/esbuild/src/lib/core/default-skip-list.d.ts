export type SkipFn = (name: string) => boolean;
export type SkipListEntry = string | RegExp | SkipFn;
export type SkipList = SkipListEntry[];
export declare const DEFAULT_SKIP_LIST: SkipList;
export declare const PREPARED_DEFAULT_SKIP_LIST: PreparedSkipList;
export type PreparedSkipList = {
  strings: Set<string>;
  functions: SkipFn[];
  regexps: RegExp[];
};
export declare function prepareSkipList(skipList: SkipList): PreparedSkipList;
export declare function isInSkipList(
  entry: string,
  skipList: PreparedSkipList,
): boolean;
