export = FetchCompileAsyncWasmPlugin;
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
type Chunk = import('../Chunk');
type Compiler = import('../Compiler');
