export = FetchCompileAsyncWasmPlugin;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Compiler")} Compiler */
declare class FetchCompileAsyncWasmPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace FetchCompileAsyncWasmPlugin {
  export { Chunk, Compiler };
}
type Compiler = import('../Compiler');
type Chunk = import('../Chunk');
