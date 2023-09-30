export = BuildCycleError;
/** @typedef {import("../Module")} Module */
declare class BuildCycleError extends WebpackError {
  /**
   * Creates an instance of ModuleDependencyError.
   * @param {Module} module the module starting the cycle
   */
  constructor(module: Module);
}
declare namespace BuildCycleError {
  export { Module };
}
import WebpackError = require('../WebpackError');
type Module = import('../Module');
