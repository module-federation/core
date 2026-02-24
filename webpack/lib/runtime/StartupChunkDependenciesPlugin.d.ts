export = StartupChunkDependenciesPlugin;
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
type ChunkLoadingType =
  import('../../declarations/WebpackOptions').ChunkLoadingType;
type Chunk = import('../Chunk');
type Compiler = import('../Compiler');
type Options = {
  chunkLoading: ChunkLoadingType;
  asyncChunkLoading?: boolean | undefined;
};
