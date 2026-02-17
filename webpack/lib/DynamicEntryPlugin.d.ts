export = DynamicEntryPlugin;
/** @typedef {import("../declarations/WebpackOptions").EntryDynamicNormalized} EntryDynamic */
/** @typedef {import("../declarations/WebpackOptions").EntryItem} EntryItem */
/** @typedef {import("../declarations/WebpackOptions").EntryStaticNormalized} EntryStatic */
/** @typedef {import("./Compiler")} Compiler */
declare class DynamicEntryPlugin {
  /**
   * @param {string} context the context path
   * @param {EntryDynamic} entry the entry value
   */
  constructor(context: string, entry: EntryDynamic);
  context: string;
  entry: import('../declarations/WebpackOptions').EntryDynamicNormalized;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace DynamicEntryPlugin {
  export { EntryDynamic, EntryItem, EntryStatic, Compiler };
}
type Compiler = import('./Compiler');
type EntryDynamic =
  import('../declarations/WebpackOptions').EntryDynamicNormalized;
type EntryItem = import('../declarations/WebpackOptions').EntryItem;
type EntryStatic =
  import('../declarations/WebpackOptions').EntryStaticNormalized;
