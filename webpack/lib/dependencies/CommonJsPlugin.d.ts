export = CommonJsPlugin;
declare class CommonJsPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace CommonJsPlugin {
  export {
    JavascriptParserOptions,
    Compilation,
    Compiler,
    DependencyLocation,
    BuildInfo,
    Parser,
  };
}
type Compiler = import('../Compiler');
type JavascriptParserOptions =
  import('../../declarations/WebpackOptions').JavascriptParserOptions;
type Compilation = import('../Compilation');
type DependencyLocation = import('../Dependency').DependencyLocation;
type BuildInfo = import('../Module').BuildInfo;
type Parser = import('../javascript/JavascriptParser');
