export interface MappedPath {
  key: string;
  path: string;
}
export interface GetMappedPathsOptions {
  rootTsConfigPath: string;
  sharedMappings?: string[];
  rootPath?: string;
}
export declare function getMappedPaths({
  rootTsConfigPath,
  sharedMappings,
  rootPath,
}: GetMappedPathsOptions): Array<MappedPath>;
