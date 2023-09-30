export = FileUriPlugin;
/** @typedef {import("../Compiler")} Compiler */
declare class FileUriPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace FileUriPlugin {
  export { Compiler };
}
type Compiler = import('../Compiler');
