export = UseStrictPlugin;
declare class UseStrictPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace UseStrictPlugin {
  export {
    JavascriptParserOptions,
    Compiler,
    DependencyLocation,
    BuildInfo,
    JavascriptParser,
    Range,
  };
}
type JavascriptParserOptions =
  import('../declarations/WebpackOptions').JavascriptParserOptions;
type Compiler = import('./Compiler');
type DependencyLocation = import('./Dependency').DependencyLocation;
type BuildInfo = import('./Module').BuildInfo;
type JavascriptParser = import('./javascript/JavascriptParser');
type Range = import('./javascript/JavascriptParser').Range;
