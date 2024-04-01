export = ContextReplacementPlugin;
/** @typedef {import("./Compiler")} Compiler */
declare class ContextReplacementPlugin {
  /**
   * @param {RegExp} resourceRegExp A regular expression that determines which files will be selected
   * @param {TODO=} newContentResource A new resource to replace the match
   * @param {TODO=} newContentRecursive If true, all subdirectories are searched for matches
   * @param {TODO=} newContentRegExp A regular expression that determines which files will be selected
   */
  constructor(
    resourceRegExp: RegExp,
    newContentResource?: TODO,
    newContentRecursive?: TODO,
    newContentRegExp?: TODO,
  );
  resourceRegExp: RegExp;
  newContentCallback: any;
  newContentResource: any;
  newContentCreateContextMap: any;
  newContentRecursive: any;
  newContentRegExp: any;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace ContextReplacementPlugin {
  export { Compiler };
}
type Compiler = import('./Compiler');
