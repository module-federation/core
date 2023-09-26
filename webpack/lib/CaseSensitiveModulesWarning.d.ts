export = CaseSensitiveModulesWarning;
declare class CaseSensitiveModulesWarning extends WebpackError {
  /**
   * Creates an instance of CaseSensitiveModulesWarning.
   * @param {Iterable<Module>} modules modules that were detected
   * @param {ModuleGraph} moduleGraph the module graph
   */
  constructor(modules: Iterable<Module>, moduleGraph: ModuleGraph);
}
declare namespace CaseSensitiveModulesWarning {
  export { Module, ModuleGraph };
}
import WebpackError = require('./WebpackError');
type Module = import('./Module');
type ModuleGraph = import('./ModuleGraph');
