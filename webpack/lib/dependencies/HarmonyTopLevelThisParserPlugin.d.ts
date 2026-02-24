export = HarmonyTopLevelThisParserPlugin;
declare class HarmonyTopLevelThisParserPlugin {
  /**
   * @param {JavascriptParser} parser the parser
   * @returns {void}
   */
  apply(parser: JavascriptParser): void;
}
declare namespace HarmonyTopLevelThisParserPlugin {
  export { DependencyLocation, JavascriptParser, Range };
}
type DependencyLocation = import('../Dependency').DependencyLocation;
type JavascriptParser = import('../javascript/JavascriptParser');
type Range = import('../javascript/JavascriptParser').Range;
