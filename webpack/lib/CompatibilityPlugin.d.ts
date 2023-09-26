export = CompatibilityPlugin;
declare class CompatibilityPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace CompatibilityPlugin {
  export {
    CallExpression,
    Compiler,
    DependencyLocation,
    JavascriptParser,
    Range,
  };
}
type Compiler = import('./Compiler');
type CallExpression = import('estree').CallExpression;
type DependencyLocation = import('./Dependency').DependencyLocation;
type JavascriptParser = import('./javascript/JavascriptParser');
type Range = import('./javascript/JavascriptParser').Range;
