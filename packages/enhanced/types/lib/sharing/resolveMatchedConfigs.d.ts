export function resolveMatchedConfigs<T>(
  compilation: Compilation,
  configs: [string, T][],
): Promise<MatchedConfigs<T>>;
export type Compilation = import('webpack/lib/Compilation');
export type ResolveOptionsWithDependencyType =
  import('webpack/lib/ResolverFactory').ResolveOptionsWithDependencyType;
export type MatchedConfigs<T> = {
  resolved: Map<string, T>;
  unresolved: Map<string, T>;
  prefixed: Map<string, T>;
};
