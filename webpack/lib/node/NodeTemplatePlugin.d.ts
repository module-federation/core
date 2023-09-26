export = NodeTemplatePlugin;
/** @typedef {import("../Compiler")} Compiler */
/**
 * @typedef {Object} NodeTemplatePluginOptions
 * @property {boolean} [asyncChunkLoading] enable async chunk loading
 */
declare class NodeTemplatePlugin {
  /**
   * @param {NodeTemplatePluginOptions} [options] options object
   */
  constructor(options?: NodeTemplatePluginOptions);
  _options: NodeTemplatePluginOptions;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace NodeTemplatePlugin {
  export { Compiler, NodeTemplatePluginOptions };
}
type NodeTemplatePluginOptions = {
  /**
   * enable async chunk loading
   */
  asyncChunkLoading?: boolean;
};
type Compiler = import('../Compiler');
