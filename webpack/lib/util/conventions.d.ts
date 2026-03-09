export function camelCase(input: string): string;
export function cssExportConvention(
  input: string,
  convention: CssGeneratorExportsConvention | undefined,
): string[];
export function dashesCamelCase(input: string): string;
export type CssGeneratorExportsConvention =
  import('../../declarations/WebpackOptions').CssGeneratorExportsConvention;
