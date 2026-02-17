export = WebpackIsIncludedPlugin;
declare class WebpackIsIncludedPlugin {
  /**
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace WebpackIsIncludedPlugin {
  export {
    Resolver,
    Compiler,
    DependencyLocation,
    Module,
    JavascriptParser,
    Range,
  };
}
type Compiler = import('./Compiler');
type Resolver = import('enhanced-resolve').Resolver;
type DependencyLocation = import('./Dependency').DependencyLocation;
type Module = import('./Module');
type JavascriptParser = import('./javascript/JavascriptParser');
type Range = import('./javascript/JavascriptParser').Range;
