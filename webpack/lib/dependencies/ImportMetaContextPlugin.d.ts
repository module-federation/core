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
  export { JavascriptParserOptions, ResolveOptions, Compiler, Parser };
}
type Compiler = import('../Compiler');
type JavascriptParserOptions =
  import('../../declarations/WebpackOptions').JavascriptParserOptions;
type ResolveOptions =
  import('../../declarations/WebpackOptions').ResolveOptions;
type Parser = import('../javascript/JavascriptParser');
