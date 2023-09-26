export = RequireIncludeDependencyParserPlugin;
declare class RequireIncludeDependencyParserPlugin {
  /**
   * @param {boolean} warn true: warn about deprecation, false: don't warn
   */
  constructor(warn: boolean);
  warn: boolean;
  /**
   * @param {JavascriptParser} parser the parser
   * @returns {void}
   */
  apply(parser: JavascriptParser): void;
}
declare namespace RequireIncludeDependencyParserPlugin {
  export { DependencyLocation, JavascriptParser, Range };
}
type JavascriptParser = import('../javascript/JavascriptParser');
type DependencyLocation = import('../Dependency').DependencyLocation;
type Range = import('../javascript/JavascriptParser').Range;
