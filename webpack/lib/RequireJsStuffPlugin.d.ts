export = RequireJsStuffPlugin;
declare class RequireJsStuffPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace RequireJsStuffPlugin {
  export { JavascriptParserOptions, Compiler, JavascriptParser };
}
type Compiler = import('./Compiler');
type JavascriptParserOptions =
  import('../declarations/WebpackOptions').JavascriptParserOptions;
type JavascriptParser = import('./javascript/JavascriptParser');
