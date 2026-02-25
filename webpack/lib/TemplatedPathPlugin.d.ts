export = TemplatedPathPlugin;
declare class TemplatedPathPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace TemplatedPathPlugin {
  export {
    ChunkGraph,
    ModuleId,
    AssetInfo,
    PathData,
    Compiler,
    ReplacerFunction,
    Replacer,
    TemplatePathFn,
    TemplatePath,
  };
}
type ChunkGraph = import('./ChunkGraph');
type ModuleId = import('./ChunkGraph').ModuleId;
type AssetInfo = import('./Compilation').AssetInfo;
type PathData = import('./Compilation').PathData;
type Compiler = import('./Compiler');
type ReplacerFunction = (
  match: string,
  arg: string | undefined,
  input: string,
) => any;
type Replacer = (
  match: string,
  arg: string | undefined,
  input: string,
) => string;
type TemplatePathFn = (pathData: PathData, assetInfo?: AssetInfo) => string;
type TemplatePath = string | TemplatePathFn;
