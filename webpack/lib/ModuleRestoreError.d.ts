export = ModuleRestoreError;
/** @typedef {import("./Module")} Module */
declare class ModuleRestoreError extends WebpackError {
  /**
   * @param {Module} module module tied to dependency
   * @param {string | Error} err error thrown
   */
  constructor(module: Module, err: string | Error);
  error: string | Error;
}
declare namespace ModuleRestoreError {
  export { Module };
}
import WebpackError = require('./WebpackError');
type Module = import('./Module');
