export = AsyncWebAssemblyGenerator;
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("../Generator").GenerateContext} GenerateContext */
/** @typedef {import("../Module").SourceType} SourceType */
/** @typedef {import("../Module").SourceTypes} SourceTypes */
/** @typedef {import("../NormalModule")} NormalModule */
/**
 * @typedef {object} AsyncWebAssemblyGeneratorOptions
 * @property {boolean=} mangleImports mangle imports
 */
declare class AsyncWebAssemblyGenerator extends Generator {
  /**
   * @param {AsyncWebAssemblyGeneratorOptions} options options
   */
  constructor(options: AsyncWebAssemblyGeneratorOptions);
  options: AsyncWebAssemblyGeneratorOptions;
  /**
   * @param {Error} error the error
   * @param {NormalModule} module module for which the code should be generated
   * @param {GenerateContext} generateContext context for generate
   * @returns {Source | null} generated code
   */
  generateError(
    error: Error,
    module: NormalModule,
    generateContext: GenerateContext,
  ): Source | null;
}
declare namespace AsyncWebAssemblyGenerator {
  export {
    Source,
    GenerateContext,
    SourceType,
    SourceTypes,
    NormalModule,
    AsyncWebAssemblyGeneratorOptions,
  };
}
import Generator = require('../Generator');
type Source = import('webpack-sources').Source;
type GenerateContext = import('../Generator').GenerateContext;
type SourceType = import('../Module').SourceType;
type SourceTypes = import('../Module').SourceTypes;
type NormalModule = import('../NormalModule');
type AsyncWebAssemblyGeneratorOptions = {
  /**
   * mangle imports
   */
  mangleImports?: boolean | undefined;
};
