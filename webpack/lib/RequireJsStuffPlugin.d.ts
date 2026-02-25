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
type JavascriptParserOptions =
  import('../declarations/WebpackOptions').JavascriptParserOptions;
type Compiler = import('./Compiler');
type JavascriptParser = import('./javascript/JavascriptParser');
