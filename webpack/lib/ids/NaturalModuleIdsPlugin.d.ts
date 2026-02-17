export = NaturalModuleIdsPlugin;
/** @typedef {import("../Compiler")} Compiler */
/** @typedef {import("../Module")} Module */
declare class NaturalModuleIdsPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace NaturalModuleIdsPlugin {
  export { Compiler, Module };
}
type Compiler = import('../Compiler');
type Module = import('../Module');
