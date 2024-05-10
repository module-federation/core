export interface PackageInfo {
  packageName: string;
  entryPoint: string;
  version: string;
  esm: boolean;
}
export interface PartialPackageJson {
  module: string;
  main: string;
}
export type VersionMap = Record<string, string>;
export type PackageJsonInfo = {
  content: any;
  directory: string;
};
export declare function findPackageJsonFiles(
  project: string,
  workspace: string,
): string[];
export declare function expandFolders(child: string, parent: string): string[];
export declare function getPackageInfo(
  packageName: string,
  workspaceRoot: string,
): PackageInfo | null;
export declare function getVersionMaps(
  project: string,
  workspace: string,
): VersionMap[];
export declare function getPackageJsonFiles(
  project: string,
  workspace: string,
): PackageJsonInfo[];
export declare function findDepPackageJson(
  packageName: string,
  projectRoot: string,
): string | null;
export declare function _getPackageInfo(
  packageName: string,
  directory: string,
): PackageInfo | null;
