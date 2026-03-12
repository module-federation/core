export = HarmonyExportDependencyParserPlugin;
declare class HarmonyExportDependencyParserPlugin {
  /**
   * @param {import("../../declarations/WebpackOptions").JavascriptParserOptions} options options
   */
  constructor(
    options: import('../../declarations/WebpackOptions').JavascriptParserOptions,
  );
  options: import('../../declarations/WebpackOptions').JavascriptParserOptions;
  exportPresenceMode: import('./HarmonyImportDependency').ExportPresenceMode;
  /**
   * @param {JavascriptParser} parser the parser
   * @returns {void}
   */
  apply(parser: JavascriptParser): void;
}
declare namespace HarmonyExportDependencyParserPlugin {
  export {
    DependencyLocation,
    JavascriptParser,
    ClassDeclaration,
    FunctionDeclaration,
    Range,
    HarmonySettings,
    CompatibilitySettings,
  };
}
type DependencyLocation = import('../Dependency').DependencyLocation;
type JavascriptParser = import('../javascript/JavascriptParser');
type ClassDeclaration =
  import('../javascript/JavascriptParser').ClassDeclaration;
type FunctionDeclaration =
  import('../javascript/JavascriptParser').FunctionDeclaration;
type Range = import('../javascript/JavascriptParser').Range;
type HarmonySettings =
  import('./HarmonyImportDependencyParserPlugin').HarmonySettings;
type CompatibilitySettings =
  import('../CompatibilityPlugin').CompatibilitySettings;
