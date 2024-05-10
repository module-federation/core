import { MappedPath } from '../utils/mapped-paths';
export type BuildKind =
  | 'shared-package'
  | 'shared-mapping'
  | 'exposed'
  | 'mapping-or-exposed';
export interface EntryPoint {
  fileName: string;
  outName: string;
}
export interface BuildAdapterOptions {
  entryPoints: EntryPoint[];
  tsConfigPath?: string;
  external: Array<string>;
  outdir: string;
  mappedPaths: MappedPath[];
  packageName?: string;
  esm?: boolean;
  dev?: boolean;
  watch?: boolean;
  kind: BuildKind;
  hash: boolean;
}
export interface BuildResult {
  fileName: string;
}
export type BuildAdapter = (
  options: BuildAdapterOptions,
) => Promise<BuildResult[]>;
export declare function setBuildAdapter(buildAdapter: BuildAdapter): void;
export declare function getBuildAdapter(): BuildAdapter;
