export function resolveMatchedConfigs<T>(
  compilation: Compilation,
  configs: [string, T][],
): Promise<MatchedConfigs<T>>;
export type ResolveContext = import('enhanced-resolve').ResolveContext;
export type Compilation = import('../Compilation');
export type FileSystemDependencies =
  import('../Compilation').FileSystemDependencies;
export type ResolveOptionsWithDependencyType =
  import('../ResolverFactory').ResolveOptionsWithDependencyType;
export type MatchedConfigsItem<T> = Map<string, T>;
export type MatchedConfigs<T> = {
  resolved: MatchedConfigsItem<T>;
  unresolved: MatchedConfigsItem<T>;
  prefixed: MatchedConfigsItem<T>;
};
