export = ModuleHashingError;
/** @typedef {import("./Module")} Module */
declare class ModuleHashingError extends WebpackError {
  /**
   * Create a new ModuleHashingError
   * @param {Module} module related module
   * @param {Error} error Original error
   */
  constructor(module: Module, error: Error);
  error: Error;
}
declare namespace ModuleHashingError {
  export { Module };
}
import WebpackError = require('./WebpackError');
type Module = import('./Module');
