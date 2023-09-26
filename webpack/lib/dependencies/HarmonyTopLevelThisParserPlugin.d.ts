export = HarmonyTopLevelThisParserPlugin;
/** @typedef {import("../Dependency").DependencyLocation} DependencyLocation */
/** @typedef {import("../javascript/JavascriptParser")} JavascriptParser */
/** @typedef {import("../javascript/JavascriptParser").Range} Range */
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
type JavascriptParser = import('../javascript/JavascriptParser');
type DependencyLocation = import('../Dependency').DependencyLocation;
type Range = import('../javascript/JavascriptParser').Range;
