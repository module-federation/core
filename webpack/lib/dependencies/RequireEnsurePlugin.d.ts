export = RequireEnsurePlugin;
declare class RequireEnsurePlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace RequireEnsurePlugin {
  export { JavascriptParserOptions, Compiler, Parser };
}
type Compiler = import('../Compiler');
type JavascriptParserOptions =
  import('../../declarations/WebpackOptions').JavascriptParserOptions;
type Parser = import('../javascript/JavascriptParser');
