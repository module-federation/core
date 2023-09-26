export = JsonpTemplatePlugin;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("../Compiler")} Compiler */
declare class JsonpTemplatePlugin {
  /**
   * @deprecated use JsonpChunkLoadingRuntimeModule.getCompilationHooks instead
   * @param {Compilation} compilation the compilation
   * @returns {JsonpChunkLoadingRuntimeModule.JsonpCompilationPluginHooks} hooks
   */
  static getCompilationHooks(
    compilation: Compilation,
  ): JsonpChunkLoadingRuntimeModule.JsonpCompilationPluginHooks;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace JsonpTemplatePlugin {
  export { Chunk, Compilation, Compiler };
}
type Compiler = import('../Compiler');
type Compilation = import('../Compilation');
import JsonpChunkLoadingRuntimeModule = require('./JsonpChunkLoadingRuntimeModule');
type Chunk = import('../Chunk');
