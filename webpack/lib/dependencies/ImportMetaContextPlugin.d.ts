export = ImportMetaContextPlugin;
declare class ImportMetaContextPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace ImportMetaContextPlugin {
  export { JavascriptParserOptions, Compiler, Parser };
}
type JavascriptParserOptions =
  import('../../declarations/WebpackOptions').JavascriptParserOptions;
type Compiler = import('../Compiler');
type Parser = import('../javascript/JavascriptParser');
