export = CodeGenerationError;
/** @typedef {import("./Module")} Module */
declare class CodeGenerationError extends WebpackError {
  /**
   * Create a new CodeGenerationError
   * @param {Module} module related module
   * @param {Error} error Original error
   */
  constructor(module: Module, error: Error);
  error: Error;
}
declare namespace CodeGenerationError {
  export { Module };
}
import WebpackError = require('./WebpackError');
type Module = import('./Module');
