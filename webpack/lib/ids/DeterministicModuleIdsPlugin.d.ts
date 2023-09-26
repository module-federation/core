export = DeterministicModuleIdsPlugin;
/** @typedef {import("../Compiler")} Compiler */
/** @typedef {import("../Module")} Module */
/**
 * @typedef {Object} DeterministicModuleIdsPluginOptions
 * @property {string=} context context relative to which module identifiers are computed
 * @property {function(Module): boolean=} test selector function for modules
 * @property {number=} maxLength maximum id length in digits (used as starting point)
 * @property {number=} salt hash salt for ids
 * @property {boolean=} fixedLength do not increase the maxLength to find an optimal id space size
 * @property {boolean=} failOnConflict throw an error when id conflicts occur (instead of rehashing)
 */
declare class DeterministicModuleIdsPlugin {
  /**
   * @param {DeterministicModuleIdsPluginOptions} [options] options
   */
  constructor(options?: DeterministicModuleIdsPluginOptions);
  options: DeterministicModuleIdsPluginOptions;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace DeterministicModuleIdsPlugin {
  export { Compiler, Module, DeterministicModuleIdsPluginOptions };
}
type DeterministicModuleIdsPluginOptions = {
  /**
   * context relative to which module identifiers are computed
   */
  context?: string | undefined;
  /**
   * selector function for modules
   */
  test?: ((arg0: Module) => boolean) | undefined;
  /**
   * maximum id length in digits (used as starting point)
   */
  maxLength?: number | undefined;
  /**
   * hash salt for ids
   */
  salt?: number | undefined;
  /**
   * do not increase the maxLength to find an optimal id space size
   */
  fixedLength?: boolean | undefined;
  /**
   * throw an error when id conflicts occur (instead of rehashing)
   */
  failOnConflict?: boolean | undefined;
};
type Compiler = import('../Compiler');
type Module = import('../Module');
