export = RequireContextDependencyParserPlugin;
declare class RequireContextDependencyParserPlugin {
  /**
   * @param {JavascriptParser} parser the parser
   * @returns {void}
   */
  apply(parser: JavascriptParser): void;
}
declare namespace RequireContextDependencyParserPlugin {
  export { DependencyLocation, JavascriptParser, Range };
}
type JavascriptParser = import('../javascript/JavascriptParser');
type DependencyLocation = import('../Dependency').DependencyLocation;
type Range = import('../javascript/JavascriptParser').Range;
