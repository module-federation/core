import ts from 'typescript';

export interface TsConfigJson {
  extends?: string;
  compilerOptions?: ts.CompilerOptions;
  exclude?: string[];
  include?: string[];
  files?: string[];
}
