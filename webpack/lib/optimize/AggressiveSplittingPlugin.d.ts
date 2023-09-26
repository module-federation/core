export = AggressiveSplittingPlugin;
declare class AggressiveSplittingPlugin {
  /**
   * @param {Chunk} chunk the chunk to test
   * @returns {boolean} true if the chunk was recorded
   */
  static wasChunkRecorded(chunk: Chunk): boolean;
  /**
   * @param {AggressiveSplittingPluginOptions=} options options object
   */
  constructor(options?: AggressiveSplittingPluginOptions | undefined);
  options: import('../../declarations/plugins/optimize/AggressiveSplittingPlugin').AggressiveSplittingPluginOptions;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace AggressiveSplittingPlugin {
  export {
    AggressiveSplittingPluginOptions,
    Chunk,
    ChunkGraph,
    Compiler,
    Module,
  };
}
type Compiler = import('../Compiler');
type Chunk = import('../Chunk');
type AggressiveSplittingPluginOptions =
  import('../../declarations/plugins/optimize/AggressiveSplittingPlugin').AggressiveSplittingPluginOptions;
type ChunkGraph = import('../ChunkGraph');
type Module = import('../Module');
