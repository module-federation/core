export = HarmonyDetectionParserPlugin;
declare class HarmonyDetectionParserPlugin {
  /**
   * @param {JavascriptParser} parser the parser
   * @returns {void}
   */
  apply(parser: JavascriptParser): void;
}
declare namespace HarmonyDetectionParserPlugin {
  export { BuildMeta, JavascriptParser };
}
type BuildMeta = import('../Module').BuildMeta;
type JavascriptParser = import('../javascript/JavascriptParser');
