export = ChunkModuleIdRangePlugin;
/** @typedef {import("../Compiler")} Compiler */
/**
 * @typedef {Object} ChunkModuleIdRangePluginOptions
 * @property {string} name the chunk name
 * @property {("index" | "index2" | "preOrderIndex" | "postOrderIndex")=} order order
 * @property {number=} start start id
 * @property {number=} end end id
 */
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
  export { Compiler, ChunkModuleIdRangePluginOptions };
}
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
type Compiler = import('../Compiler');
