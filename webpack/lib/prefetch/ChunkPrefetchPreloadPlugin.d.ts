export = ChunkPrefetchPreloadPlugin;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../ChunkGroup").RawChunkGroupOptions} RawChunkGroupOptions */
/** @typedef {import("../Compiler")} Compiler */
declare class ChunkPrefetchPreloadPlugin {
  /**
   * @param {Compiler} compiler the compiler
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace ChunkPrefetchPreloadPlugin {
  export { Chunk, RawChunkGroupOptions, Compiler };
}
type Compiler = import('../Compiler');
type Chunk = import('../Chunk');
type RawChunkGroupOptions = import('../ChunkGroup').RawChunkGroupOptions;
