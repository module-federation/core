export = ReadFileCompileWasmPlugin;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Compiler")} Compiler */
/**
 * @typedef {Object} ReadFileCompileWasmPluginOptions
 * @property {boolean} [mangleImports] mangle imports
 */
declare class ReadFileCompileWasmPlugin {
  /**
   * @param {ReadFileCompileWasmPluginOptions} [options] options object
   */
  constructor(options?: ReadFileCompileWasmPluginOptions);
  options: ReadFileCompileWasmPluginOptions;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace ReadFileCompileWasmPlugin {
  export { Chunk, Compiler, ReadFileCompileWasmPluginOptions };
}
type ReadFileCompileWasmPluginOptions = {
  /**
   * mangle imports
   */
  mangleImports?: boolean;
};
type Compiler = import('../Compiler');
type Chunk = import('../Chunk');
