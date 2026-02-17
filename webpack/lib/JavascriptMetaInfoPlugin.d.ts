export = JavascriptMetaInfoPlugin;
declare class JavascriptMetaInfoPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace JavascriptMetaInfoPlugin {
  export { Compiler, BuildInfo, JavascriptParser };
}
type Compiler = import('./Compiler');
type BuildInfo = import('./Module').BuildInfo;
type JavascriptParser = import('./javascript/JavascriptParser');
