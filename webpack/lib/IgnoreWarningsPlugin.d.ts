export = IgnoreWarningsPlugin;
declare class IgnoreWarningsPlugin {
  /**
   * @param {IgnoreWarningsNormalized} ignoreWarnings conditions to ignore warnings
   */
  constructor(ignoreWarnings: IgnoreWarningsNormalized);
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
type IgnoreWarningsNormalized =
  import('../declarations/WebpackOptions').IgnoreWarningsNormalized;
type Compiler = import('./Compiler');
