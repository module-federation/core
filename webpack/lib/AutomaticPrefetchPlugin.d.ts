export = AutomaticPrefetchPlugin;
/** @typedef {import("./Compiler")} Compiler */
declare class AutomaticPrefetchPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace AutomaticPrefetchPlugin {
  export { Compiler };
}
type Compiler = import('./Compiler');
