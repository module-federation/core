export type FallbackRouteParams = ReadonlyMap<string, string>;
export declare function getParamKeys(page: string): string[];
export declare function getFallbackRouteParams(pageOrKeys: string | readonly string[]): FallbackRouteParams | null;
