export = IgnoreWarningsPlugin;
/** @typedef {import("../declarations/WebpackOptions").IgnoreWarningsNormalized} IgnoreWarningsNormalized */
/** @typedef {import("./Compiler")} Compiler */
declare class IgnoreWarningsPlugin {
  /**
   * @param {IgnoreWarningsNormalized} ignoreWarnings conditions to ignore warnings
   */
  constructor(
    ignoreWarnings: import('../declarations/WebpackOptions').IgnoreWarningsNormalized,
  );
  _ignoreWarnings: import('../declarations/WebpackOptions').IgnoreWarningsNormalized;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace IgnoreWarningsPlugin {
  export { IgnoreWarningsNormalized, Compiler };
}
type Compiler = import('./Compiler');
type IgnoreWarningsNormalized =
  import('../declarations/WebpackOptions').IgnoreWarningsNormalized;
