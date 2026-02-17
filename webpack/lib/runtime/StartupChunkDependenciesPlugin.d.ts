export = StartupChunkDependenciesPlugin;
/** @typedef {import("../../declarations/WebpackOptions").ChunkLoadingType} ChunkLoadingType */
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Compiler")} Compiler */
/**
 * @typedef {Object} Options
 * @property {ChunkLoadingType} chunkLoading
 * @property {boolean=} asyncChunkLoading
 */
declare class StartupChunkDependenciesPlugin {
  /**
   * @param {Options} options options
   */
  constructor(options: Options);
  chunkLoading: string;
  asyncChunkLoading: boolean;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace StartupChunkDependenciesPlugin {
  export { ChunkLoadingType, Chunk, Compiler, Options };
}
type Compiler = import('../Compiler');
type Options = {
  chunkLoading: ChunkLoadingType;
  asyncChunkLoading?: boolean | undefined;
};
type ChunkLoadingType =
  import('../../declarations/WebpackOptions').ChunkLoadingType;
type Chunk = import('../Chunk');
