export = ModuleInfoHeaderPlugin;
declare class ModuleInfoHeaderPlugin {
  /**
   * @param {boolean=} verbose add more information like exports, runtime requirements and bailouts
   */
  constructor(verbose?: boolean | undefined);
  _verbose: boolean;
  /**
   * @param {Compiler} compiler the compiler
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace ModuleInfoHeaderPlugin {
  export {
    Source,
    Compiler,
    ExportsInfo,
    ExportInfo,
    Module,
    BuildMeta,
    ModuleGraph,
    ModuleTemplate,
    RequestShortener,
  };
}
type Compiler = import('./Compiler');
type Source = any;
type ExportsInfo = import('./ExportsInfo');
type ExportInfo = import('./ExportsInfo').ExportInfo;
type Module = import('./Module');
type BuildMeta = import('./Module').BuildMeta;
type ModuleGraph = import('./ModuleGraph');
type ModuleTemplate = import('./ModuleTemplate');
type RequestShortener = import('./RequestShortener');
