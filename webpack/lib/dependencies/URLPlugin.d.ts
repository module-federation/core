export = URLPlugin;
declare class URLPlugin {
  /**
   * @param {Compiler} compiler compiler
   */
  apply(compiler: Compiler): void;
}
declare namespace URLPlugin {
  export { JavascriptParserOptions, Compiler, JavascriptParser };
}
type JavascriptParserOptions =
  import('../../declarations/WebpackOptions').JavascriptParserOptions;
type Compiler = import('../Compiler');
type JavascriptParser = import('../javascript/JavascriptParser');
