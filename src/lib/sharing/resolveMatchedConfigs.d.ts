export function resolveMatchedConfigs<T>(compilation: any, configs: [string, T][]): Promise<MatchedConfigs<T>>;
export type Compilation = any;
export type ResolveOptionsWithDependencyType = any;
export type MatchedConfigs<T> = {
    resolved: Map<string, T>;
    unresolved: Map<string, T>;
    prefixed: Map<string, T>;
};
