export = EntryPlugin;
/** @typedef {import("./Compiler")} Compiler */
/** @typedef {import("./Entrypoint").EntryOptions} EntryOptions */
declare class EntryPlugin {
  /**
   * @param {string} entry entry request
   * @param {EntryOptions | string} options entry options (passing string is deprecated)
   * @returns {EntryDependency} the dependency
   */
  static createDependency(
    entry: string,
    options: EntryOptions | string,
  ): EntryDependency;
  /**
   * An entry plugin which will handle
   * creation of the EntryDependency
   *
   * @param {string} context context path
   * @param {string} entry entry path
   * @param {EntryOptions | string=} options entry options (passing a string is deprecated)
   */
  constructor(
    context: string,
    entry: string,
    options?: (EntryOptions | string) | undefined,
  );
  context: string;
  entry: string;
  options: string | import('./Entrypoint').EntryOptions;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace EntryPlugin {
  export { Compiler, EntryOptions };
}
type Compiler = import('./Compiler');
type EntryOptions = import('./Entrypoint').EntryOptions;
import EntryDependency = require('./dependencies/EntryDependency');
