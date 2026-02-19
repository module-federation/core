export = MergeDuplicateChunksPlugin;
declare class MergeDuplicateChunksPlugin {
  /**
   * @param {MergeDuplicateChunksPluginOptions} options options object
   */
  constructor(options?: MergeDuplicateChunksPluginOptions);
  options: import('../../declarations/plugins/optimize/MergeDuplicateChunksPlugin').MergeDuplicateChunksPluginOptions;
  /**
   * @param {Compiler} compiler the compiler
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace MergeDuplicateChunksPlugin {
  export { MergeDuplicateChunksPluginOptions, Compiler };
}
type MergeDuplicateChunksPluginOptions =
  import('../../declarations/plugins/optimize/MergeDuplicateChunksPlugin').MergeDuplicateChunksPluginOptions;
type Compiler = import('../Compiler');
