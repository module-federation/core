export = NoEmitOnErrorsPlugin;
/** @typedef {import("./Compiler")} Compiler */
declare class NoEmitOnErrorsPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace NoEmitOnErrorsPlugin {
  export { Compiler };
}
type Compiler = import('./Compiler');
