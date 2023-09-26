export = HarmonyExportDependencyParserPlugin;
declare class HarmonyExportDependencyParserPlugin {
  /**
   * @param {import("../../declarations/WebpackOptions").JavascriptParserOptions} options options
   */
  constructor(
    options: import('../../declarations/WebpackOptions').JavascriptParserOptions,
  );
  exportPresenceMode: 0 | 2 | 1 | 3;
  apply(parser: any): void;
}
declare namespace HarmonyExportDependencyParserPlugin {
  export { JavascriptParser };
}
type JavascriptParser = import('../javascript/JavascriptParser');
