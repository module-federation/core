export type TsConfigCompilerOptions = Record<string, any> & {
  rootDir?: string;
  outDir?: string;
  declarationDir?: string;
  tsBuildInfoFile?: string;
  incremental?: boolean;
  paths?: Record<string, string[]>;
  baseUrl?: string;
};

export interface TsConfigJson {
  extends?: string;
  compilerOptions?: TsConfigCompilerOptions;
  exclude?: string[];
  include?: string[];
  files?: string[];
  references?: Array<{ path: string }>;
  [key: string]: any;
}
