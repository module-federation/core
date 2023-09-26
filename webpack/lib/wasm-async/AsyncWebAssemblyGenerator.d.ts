export = AsyncWebAssemblyGenerator;
/**
 * @typedef {Object} AsyncWebAssemblyGeneratorOptions
 * @property {boolean} [mangleImports] mangle imports
 */
declare class AsyncWebAssemblyGenerator extends Generator {
  /**
   * @param {AsyncWebAssemblyGeneratorOptions} options options
   */
  constructor(options: AsyncWebAssemblyGeneratorOptions);
  options: AsyncWebAssemblyGeneratorOptions;
}
declare namespace AsyncWebAssemblyGenerator {
  export {
    Source,
    GenerateContext,
    NormalModule,
    AsyncWebAssemblyGeneratorOptions,
  };
}
import Generator = require('../Generator');
type AsyncWebAssemblyGeneratorOptions = {
  /**
   * mangle imports
   */
  mangleImports?: boolean;
};
type Source = any;
type GenerateContext = import('../Generator').GenerateContext;
type NormalModule = import('../NormalModule');
