export = WebAssemblyGenerator;
/**
 * @typedef {Object} WebAssemblyGeneratorOptions
 * @property {boolean} [mangleImports] mangle imports
 */
declare class WebAssemblyGenerator extends Generator {
  /**
   * @param {WebAssemblyGeneratorOptions} options options
   */
  constructor(options: WebAssemblyGeneratorOptions);
  options: WebAssemblyGeneratorOptions;
}
declare namespace WebAssemblyGenerator {
  export {
    Source,
    DependencyTemplates,
    GenerateContext,
    Module,
    ModuleGraph,
    NormalModule,
    RuntimeTemplate,
    RuntimeSpec,
    UsedWasmDependency,
    ArrayBufferTransform,
    WebAssemblyGeneratorOptions,
  };
}
import Generator = require('../Generator');
type WebAssemblyGeneratorOptions = {
  /**
   * mangle imports
   */
  mangleImports?: boolean;
};
type Source = any;
type DependencyTemplates = import('../DependencyTemplates');
type GenerateContext = import('../Generator').GenerateContext;
type Module = import('../Module');
type ModuleGraph = import('../ModuleGraph');
type NormalModule = import('../NormalModule');
type RuntimeTemplate = import('../RuntimeTemplate');
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
type UsedWasmDependency = import('./WebAssemblyUtils').UsedWasmDependency;
type ArrayBufferTransform = (buf: ArrayBuffer) => ArrayBuffer;
