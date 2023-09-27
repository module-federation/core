export = AsyncWasmLoadingRuntimeModule;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Compilation")} Compilation */
/**
 * @typedef {Object} AsyncWasmLoadingRuntimeModuleOptions
 * @property {function(string): string} generateLoadBinaryCode
 * @property {boolean} supportsStreaming
 */
declare class AsyncWasmLoadingRuntimeModule extends RuntimeModule {
  /**
   * @param {AsyncWasmLoadingRuntimeModuleOptions} options options
   */
  constructor({
    generateLoadBinaryCode,
    supportsStreaming,
  }: AsyncWasmLoadingRuntimeModuleOptions);
  generateLoadBinaryCode: (arg0: string) => string;
  supportsStreaming: boolean;
}
declare namespace AsyncWasmLoadingRuntimeModule {
  export { Chunk, Compilation, AsyncWasmLoadingRuntimeModuleOptions };
}
import RuntimeModule = require('../RuntimeModule');
type AsyncWasmLoadingRuntimeModuleOptions = {
  generateLoadBinaryCode: (arg0: string) => string;
  supportsStreaming: boolean;
};
type Chunk = import('../Chunk');
type Compilation = import('../Compilation');
