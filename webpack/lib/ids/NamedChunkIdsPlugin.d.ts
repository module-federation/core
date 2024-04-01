export = NamedChunkIdsPlugin;
/** @typedef {import("../../declarations/WebpackOptions").OutputNormalized} Output */
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Compiler")} Compiler */
/** @typedef {import("../Module")} Module */
/**
 * @typedef {Object} NamedChunkIdsPluginOptions
 * @property {string} [context] context
 * @property {string} [delimiter] delimiter
 */
declare class NamedChunkIdsPlugin {
  /**
   * @param {NamedChunkIdsPluginOptions=} options options
   */
  constructor(options?: NamedChunkIdsPluginOptions | undefined);
  delimiter: string;
  context: string;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace NamedChunkIdsPlugin {
  export { Output, Chunk, Compiler, Module, NamedChunkIdsPluginOptions };
}
type Compiler = import('../Compiler');
type NamedChunkIdsPluginOptions = {
  /**
   * context
   */
  context?: string;
  /**
   * delimiter
   */
  delimiter?: string;
};
type Output = import('../../declarations/WebpackOptions').OutputNormalized;
type Chunk = import('../Chunk');
type Module = import('../Module');
