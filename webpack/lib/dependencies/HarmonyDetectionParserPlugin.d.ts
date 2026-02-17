export = HarmonyDetectionParserPlugin;
declare class HarmonyDetectionParserPlugin {
  /**
   * @param {HarmonyModulesPluginOptions} options options
   */
  constructor(options: HarmonyModulesPluginOptions);
  topLevelAwait: boolean;
  /**
   * @param {JavascriptParser} parser the parser
   * @returns {void}
   */
  apply(parser: JavascriptParser): void;
}
declare namespace HarmonyDetectionParserPlugin {
  export { BuildMeta, JavascriptParser, HarmonyModulesPluginOptions };
}
type JavascriptParser = import('../javascript/JavascriptParser');
type HarmonyModulesPluginOptions =
  import('./HarmonyModulesPlugin').HarmonyModulesPluginOptions;
type BuildMeta = import('../Module').BuildMeta;
