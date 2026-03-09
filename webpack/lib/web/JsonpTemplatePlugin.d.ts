export = JsonpTemplatePlugin;
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
  export { Compilation, Compiler };
}
import JsonpChunkLoadingRuntimeModule = require('./JsonpChunkLoadingRuntimeModule');
type Compilation = import('../Compilation');
type Compiler = import('../Compiler');
