export = AggressiveMergingPlugin;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Compiler")} Compiler */
/**
 * @typedef {Object} AggressiveMergingPluginOptions
 * @property {number=} minSizeReduce minimal size reduction to trigger merging
 */
declare class AggressiveMergingPlugin {
  /**
   * @param {AggressiveMergingPluginOptions=} [options] options object
   */
  constructor(options?: AggressiveMergingPluginOptions | undefined);
  options: AggressiveMergingPluginOptions;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace AggressiveMergingPlugin {
  export { Chunk, Compiler, AggressiveMergingPluginOptions };
}
type AggressiveMergingPluginOptions = {
  /**
   * minimal size reduction to trigger merging
   */
  minSizeReduce?: number | undefined;
};
type Compiler = import('../Compiler');
type Chunk = import('../Chunk');
