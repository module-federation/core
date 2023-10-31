export = CommonJsChunkLoadingPlugin;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Compiler")} Compiler */
/** @typedef {Object} CommonJsChunkLoadingPluginOptions
 * @property {boolean} [asyncChunkLoading] enable async chunk loading
 */
declare class CommonJsChunkLoadingPlugin {
  /**
   * @param {CommonJsChunkLoadingPluginOptions} [options] options
   */
  constructor(options?: CommonJsChunkLoadingPluginOptions);
  _asyncChunkLoading: boolean;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace CommonJsChunkLoadingPlugin {
  export { Chunk, Compiler, CommonJsChunkLoadingPluginOptions };
}
type Compiler = import('../Compiler');
type CommonJsChunkLoadingPluginOptions = {
  /**
   * enable async chunk loading
   */
  asyncChunkLoading?: boolean;
};
type Chunk = import('../Chunk');
