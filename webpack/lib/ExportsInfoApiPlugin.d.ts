export = ExportsInfoApiPlugin;
declare class ExportsInfoApiPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace ExportsInfoApiPlugin {
  export { Compiler, DependencyLocation, JavascriptParser, Range };
}
type Compiler = import('./Compiler');
type DependencyLocation = import('./Dependency').DependencyLocation;
type JavascriptParser = import('./javascript/JavascriptParser');
type Range = import('./javascript/JavascriptParser').Range;
