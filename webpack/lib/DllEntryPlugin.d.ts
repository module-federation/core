export = DllEntryPlugin;
/** @typedef {import("./Compiler")} Compiler */
declare class DllEntryPlugin {
  /**
   * @param {string} context context
   * @param {string[]} entries entry names
   * @param {TODO} options options
   */
  constructor(context: string, entries: string[], options: TODO);
  context: string;
  entries: string[];
  options: TODO;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace DllEntryPlugin {
  export { Compiler };
}
type Compiler = import('./Compiler');
