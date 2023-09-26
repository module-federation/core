export = ChunkPrefetchFunctionRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("../RuntimeTemplate")} RuntimeTemplate */
declare class ChunkPrefetchFunctionRuntimeModule extends RuntimeModule {
  /**
   * @param {string} childType TODO
   * @param {string} runtimeFunction TODO
   * @param {string} runtimeHandlers TODO
   */
  constructor(
    childType: string,
    runtimeFunction: string,
    runtimeHandlers: string,
  );
  childType: string;
  runtimeFunction: string;
  runtimeHandlers: string;
}
declare namespace ChunkPrefetchFunctionRuntimeModule {
  export { Compilation, RuntimeTemplate };
}
import RuntimeModule = require('../RuntimeModule');
type Compilation = import('../Compilation');
type RuntimeTemplate = import('../RuntimeTemplate');
