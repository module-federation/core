export = JsonpChunkLoadingPlugin;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Compiler")} Compiler */
declare class JsonpChunkLoadingPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace JsonpChunkLoadingPlugin {
  export { Chunk, Compiler };
}
type Compiler = import('../Compiler');
type Chunk = import('../Chunk');
