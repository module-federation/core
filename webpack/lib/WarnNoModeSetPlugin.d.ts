export = WarnNoModeSetPlugin;
/** @typedef {import("./Compiler")} Compiler */
declare class WarnNoModeSetPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace WarnNoModeSetPlugin {
  export { Compiler };
}
type Compiler = import('./Compiler');
