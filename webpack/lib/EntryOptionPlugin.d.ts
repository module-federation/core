export = EntryOptionPlugin;
/** @typedef {import("../declarations/WebpackOptions").EntryDescriptionNormalized} EntryDescription */
/** @typedef {import("../declarations/WebpackOptions").EntryNormalized} Entry */
/** @typedef {import("./Compiler")} Compiler */
/** @typedef {import("./Entrypoint").EntryOptions} EntryOptions */
declare class EntryOptionPlugin {
  /**
   * @param {Compiler} compiler the compiler
   * @param {string} context context directory
   * @param {Entry} entry request
   * @returns {void}
   */
  static applyEntryOption(
    compiler: Compiler,
    context: string,
    entry: Entry,
  ): void;
  /**
   * @param {Compiler} compiler the compiler
   * @param {string} name entry name
   * @param {EntryDescription} desc entry description
   * @returns {EntryOptions} options for the entry
   */
  static entryDescriptionToOptions(
    compiler: Compiler,
    name: string,
    desc: EntryDescription,
  ): EntryOptions;
  /**
   * @param {Compiler} compiler the compiler instance one is tapping into
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace EntryOptionPlugin {
  export { EntryDescription, Entry, Compiler, EntryOptions };
}
type Compiler = import('./Compiler');
type Entry = import('../declarations/WebpackOptions').EntryNormalized;
type EntryDescription =
  import('../declarations/WebpackOptions').EntryDescriptionNormalized;
type EntryOptions = import('./Entrypoint').EntryOptions;
