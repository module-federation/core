export = DeterministicChunkIdsPlugin;
/** @typedef {import("../Compiler")} Compiler */
/** @typedef {import("../Module")} Module */
/**
 * @typedef {Object} DeterministicChunkIdsPluginOptions
 * @property {string=} context context for ids
 * @property {number=} maxLength maximum length of ids
 */
declare class DeterministicChunkIdsPlugin {
  /**
   * @param {DeterministicChunkIdsPluginOptions} [options] options
   */
  constructor(options?: DeterministicChunkIdsPluginOptions);
  options: DeterministicChunkIdsPluginOptions;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace DeterministicChunkIdsPlugin {
  export { Compiler, Module, DeterministicChunkIdsPluginOptions };
}
type DeterministicChunkIdsPluginOptions = {
  /**
   * context for ids
   */
  context?: string | undefined;
  /**
   * maximum length of ids
   */
  maxLength?: number | undefined;
};
type Compiler = import('../Compiler');
type Module = import('../Module');
