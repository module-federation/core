export = AsyncWebAssemblyJavascriptGenerator;
/**
 * @typedef {{ request: string, importVar: string }} ImportObjRequestItem
 */
declare class AsyncWebAssemblyJavascriptGenerator extends Generator {
  /**
   * @param {OutputOptions["webassemblyModuleFilename"]} filenameTemplate template for the WebAssembly module filename
   */
  constructor(filenameTemplate: OutputOptions['webassemblyModuleFilename']);
  filenameTemplate: string;
}
declare namespace AsyncWebAssemblyJavascriptGenerator {
  export {
    Source,
    OutputOptions,
    DependencyTemplates,
    GenerateContext,
    Module,
    NormalModule,
    RuntimeTemplate,
    ImportObjRequestItem,
  };
}
import Generator = require('../Generator');
type OutputOptions =
  import('../../declarations/WebpackOptions').OutputNormalized;
type Source = any;
type DependencyTemplates = import('../DependencyTemplates');
type GenerateContext = import('../Generator').GenerateContext;
type Module = import('../Module');
type NormalModule = import('../NormalModule');
type RuntimeTemplate = import('../RuntimeTemplate');
type ImportObjRequestItem = {
  request: string;
  importVar: string;
};
