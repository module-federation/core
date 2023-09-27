export = SystemPlugin;
declare class SystemPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace SystemPlugin {
  export {
    SystemImportDeprecationWarning,
    JavascriptParserOptions,
    Compiler,
    DependencyLocation,
    Parser,
    Range,
  };
}
type Compiler = import('../Compiler');
declare class SystemImportDeprecationWarning extends WebpackError {
  /**
   * @param {DependencyLocation} loc location
   */
  constructor(loc: DependencyLocation);
}
type JavascriptParserOptions =
  import('../../declarations/WebpackOptions').JavascriptParserOptions;
type DependencyLocation = import('../Dependency').DependencyLocation;
type Parser = import('../javascript/JavascriptParser');
type Range = import('../javascript/JavascriptParser').Range;
import WebpackError = require('../WebpackError');
