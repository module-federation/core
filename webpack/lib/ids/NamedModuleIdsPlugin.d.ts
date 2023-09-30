export = NamedModuleIdsPlugin;
/** @typedef {import("../../declarations/WebpackOptions").OutputNormalized} Output */
/** @typedef {import("../Compiler")} Compiler */
/** @typedef {import("../Module")} Module */
/**
 * @typedef {Object} NamedModuleIdsPluginOptions
 * @property {string} [context] context
 */
declare class NamedModuleIdsPlugin {
  /**
   * @param {NamedModuleIdsPluginOptions} [options] options
   */
  constructor(options?: NamedModuleIdsPluginOptions);
  options: NamedModuleIdsPluginOptions;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace NamedModuleIdsPlugin {
  export { Output, Compiler, Module, NamedModuleIdsPluginOptions };
}
type NamedModuleIdsPluginOptions = {
  /**
   * context
   */
  context?: string;
};
type Compiler = import('../Compiler');
type Output = import('../../declarations/WebpackOptions').OutputNormalized;
type Module = import('../Module');
