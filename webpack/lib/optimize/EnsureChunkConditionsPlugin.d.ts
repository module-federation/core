export = EnsureChunkConditionsPlugin;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../ChunkGroup")} ChunkGroup */
/** @typedef {import("../Compiler")} Compiler */
declare class EnsureChunkConditionsPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace EnsureChunkConditionsPlugin {
  export { Chunk, ChunkGroup, Compiler };
}
type Compiler = import('../Compiler');
type Chunk = import('../Chunk');
type ChunkGroup = import('../ChunkGroup');
