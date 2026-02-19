export = SideEffectsFlagPlugin;
declare class SideEffectsFlagPlugin {
  /**
   * @param {string} moduleName the module name
   * @param {SideEffectsFlagValue} flagValue the flag value
   * @param {CacheItem} cache cache for glob to regexp
   * @returns {boolean | undefined} true, when the module has side effects, undefined or false when not
   */
  static moduleHasSideEffects(
    moduleName: string,
    flagValue: SideEffectsFlagValue,
    cache: CacheItem,
  ): boolean | undefined;
  /**
   * @param {boolean} analyseSource analyse source code for side effects
   */
  constructor(analyseSource?: boolean);
  _analyseSource: boolean;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace SideEffectsFlagPlugin {
  export {
    MaybeNamedClassDeclaration,
    MaybeNamedFunctionDeclaration,
    ModuleDeclaration,
    Statement,
    Compiler,
    DependencyLocation,
    Module,
    BuildMeta,
    ModuleGraphConnection,
    ModuleSettings,
    JavascriptParser,
    Range,
    ExportInModule,
    SideEffectsFlagValue,
    CacheItem,
  };
}
type MaybeNamedClassDeclaration = import('estree').MaybeNamedClassDeclaration;
type MaybeNamedFunctionDeclaration =
  import('estree').MaybeNamedFunctionDeclaration;
type ModuleDeclaration = import('estree').ModuleDeclaration;
type Statement = import('estree').Statement;
type Compiler = import('../Compiler');
type DependencyLocation = import('../Dependency').DependencyLocation;
type Module = import('../Module');
type BuildMeta = import('../Module').BuildMeta;
type ModuleGraphConnection = import('../ModuleGraphConnection');
type ModuleSettings = import('../NormalModuleFactory').ModuleSettings;
type JavascriptParser = import('../javascript/JavascriptParser');
type Range = import('../javascript/JavascriptParser').Range;
type ExportInModule = {
  /**
   * the module
   */
  module: Module;
  /**
   * the name of the export
   */
  exportName: string;
  /**
   * if the export is conditional
   */
  checked: boolean;
};
type SideEffectsFlagValue = string | boolean | string[] | undefined;
type CacheItem = Map<string, RegExp>;
