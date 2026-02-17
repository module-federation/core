export = DllEntryPlugin;
declare class DllEntryPlugin {
  /**
   * @param {string} context context
   * @param {Entries} entries entry names
   * @param {Options} options options
   */
  constructor(context: string, entries: Entries, options: Options);
  context: string;
  entries: Entries;
  options: Options;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace DllEntryPlugin {
  export { Compiler, EntryOptions, Entries, Options };
}
type Compiler = import('./Compiler');
type EntryOptions = import('./Entrypoint').EntryOptions;
type Entries = string[];
type Options = EntryOptions & {
  name: string;
};
