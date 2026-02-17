export = DynamicEntryPlugin;
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
  export { EntryDescriptionNormalized, EntryDynamic, Compiler };
}
type EntryDescriptionNormalized =
  import('../declarations/WebpackOptions').EntryDescriptionNormalized;
type EntryDynamic =
  import('../declarations/WebpackOptions').EntryDynamicNormalized;
type Compiler = import('./Compiler');
