export = MinChunkSizePlugin;
declare class MinChunkSizePlugin {
  /**
   * @param {MinChunkSizePluginOptions} options options object
   */
  constructor(options: MinChunkSizePluginOptions);
  options: import('../../declarations/plugins/optimize/MinChunkSizePlugin').MinChunkSizePluginOptions;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace MinChunkSizePlugin {
  export { MinChunkSizePluginOptions, Chunk, Compiler };
}
type Compiler = import('../Compiler');
type MinChunkSizePluginOptions =
  import('../../declarations/plugins/optimize/MinChunkSizePlugin').MinChunkSizePluginOptions;
type Chunk = import('../Chunk');
