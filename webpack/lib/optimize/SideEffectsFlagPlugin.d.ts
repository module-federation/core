export = SideEffectsFlagPlugin;
declare class SideEffectsFlagPlugin {
  /**
   * @param {string} moduleName the module name
   * @param {undefined | boolean | string | string[]} flagValue the flag value
   * @param {Map<string, RegExp>} cache cache for glob to regexp
   * @returns {boolean | undefined} true, when the module has side effects, undefined or false when not
   */
  static moduleHasSideEffects(
    moduleName: string,
    flagValue: undefined | boolean | string | string[],
    cache: Map<string, RegExp>,
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
    ModuleDeclaration,
    Statement,
    Compiler,
    Dependency,
    Module,
    JavascriptParser,
    ExportInModule,
    ReexportInfo,
  };
}
type Compiler = import('../Compiler');
type ModuleDeclaration = import('estree').ModuleDeclaration;
type Statement = import('estree').Statement;
type Dependency = import('../Dependency');
type Module = import('../Module');
type JavascriptParser = import('../javascript/JavascriptParser');
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
type ReexportInfo = {
  static: Map<string, ExportInModule[]>;
  dynamic: Map<Module, Set<string>>;
};
