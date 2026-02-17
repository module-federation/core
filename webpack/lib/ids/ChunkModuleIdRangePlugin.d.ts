export = ChunkModuleIdRangePlugin;
declare class ChunkModuleIdRangePlugin {
  /**
   * @param {ChunkModuleIdRangePluginOptions} options options object
   */
  constructor(options: ChunkModuleIdRangePluginOptions);
  options: ChunkModuleIdRangePluginOptions;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace ChunkModuleIdRangePlugin {
  export { Compiler, Module, ChunkModuleIdRangePluginOptions };
}
type Compiler = import('../Compiler');
type Module = import('../Module');
type ChunkModuleIdRangePluginOptions = {
  /**
   * the chunk name
   */
  name: string;
  /**
   * order
   */
  order?: ('index' | 'index2' | 'preOrderIndex' | 'postOrderIndex') | undefined;
  /**
   * start id
   */
  start?: number | undefined;
  /**
   * end id
   */
  end?: number | undefined;
};
