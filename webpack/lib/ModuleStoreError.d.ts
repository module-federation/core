export = ModuleStoreError;
/** @typedef {import("./Module")} Module */
declare class ModuleStoreError extends WebpackError {
  /**
   * @param {Module} module module tied to dependency
   * @param {string | Error} err error thrown
   */
  constructor(module: Module, err: string | Error);
  error: string | Error;
}
declare namespace ModuleStoreError {
  export { Module };
}
import WebpackError = require('./WebpackError');
type Module = import('./Module');
