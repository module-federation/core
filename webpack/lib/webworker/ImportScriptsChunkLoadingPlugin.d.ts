export = ImportScriptsChunkLoadingPlugin;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Compiler")} Compiler */
declare class ImportScriptsChunkLoadingPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace ImportScriptsChunkLoadingPlugin {
  export { Chunk, Compiler };
}
type Compiler = import('../Compiler');
type Chunk = import('../Chunk');
