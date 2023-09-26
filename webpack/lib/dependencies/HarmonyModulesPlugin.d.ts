export = HarmonyModulesPlugin;
/** @typedef {{ topLevelAwait?: boolean }} HarmonyModulesPluginOptions */
declare class HarmonyModulesPlugin {
  /**
   * @param {HarmonyModulesPluginOptions} options options
   */
  constructor(options: HarmonyModulesPluginOptions);
  options: HarmonyModulesPluginOptions;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace HarmonyModulesPlugin {
  export {
    JavascriptParserOptions,
    Compiler,
    Parser,
    HarmonyModulesPluginOptions,
  };
}
type HarmonyModulesPluginOptions = {
  topLevelAwait?: boolean;
};
type Compiler = import('../Compiler');
type JavascriptParserOptions =
  import('../../declarations/WebpackOptions').JavascriptParserOptions;
type Parser = import('../javascript/JavascriptParser');
