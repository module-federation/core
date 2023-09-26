export = FlagIncludedChunksPlugin;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Chunk").ChunkId} ChunkId */
/** @typedef {import("../Compiler")} Compiler */
/** @typedef {import("../Module")} Module */
declare class FlagIncludedChunksPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace FlagIncludedChunksPlugin {
  export { Chunk, ChunkId, Compiler, Module };
}
type Compiler = import('../Compiler');
type Chunk = import('../Chunk');
type ChunkId = import('../Chunk').ChunkId;
type Module = import('../Module');
