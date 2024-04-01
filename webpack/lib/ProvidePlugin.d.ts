export = ProvidePlugin;
declare class ProvidePlugin {
  /**
   * @param {Record<string, string | string[]>} definitions the provided identifiers
   */
  constructor(definitions: Record<string, string | string[]>);
  definitions: Record<string, string | string[]>;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace ProvidePlugin {
  export {
    JavascriptParserOptions,
    Compiler,
    DependencyLocation,
    JavascriptParser,
    Range,
  };
}
type Compiler = import('./Compiler');
type JavascriptParserOptions =
  import('../declarations/WebpackOptions').JavascriptParserOptions;
type DependencyLocation = import('./Dependency').DependencyLocation;
type JavascriptParser = import('./javascript/JavascriptParser');
type Range = import('./javascript/JavascriptParser').Range;
