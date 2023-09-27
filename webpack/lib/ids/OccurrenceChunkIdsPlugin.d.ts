export = OccurrenceChunkIdsPlugin;
declare class OccurrenceChunkIdsPlugin {
  /**
   * @param {OccurrenceChunkIdsPluginOptions=} options options object
   */
  constructor(options?: OccurrenceChunkIdsPluginOptions | undefined);
  options: import('../../declarations/plugins/ids/OccurrenceChunkIdsPlugin').OccurrenceChunkIdsPluginOptions;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace OccurrenceChunkIdsPlugin {
  export { OccurrenceChunkIdsPluginOptions, Chunk, Compiler, Module };
}
type Compiler = import('../Compiler');
type OccurrenceChunkIdsPluginOptions =
  import('../../declarations/plugins/ids/OccurrenceChunkIdsPlugin').OccurrenceChunkIdsPluginOptions;
type Chunk = import('../Chunk');
type Module = import('../Module');
