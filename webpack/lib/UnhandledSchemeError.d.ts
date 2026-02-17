export = UnhandledSchemeError;
declare class UnhandledSchemeError extends WebpackError {
  /**
   * @param {string} scheme scheme
   * @param {string} resource resource
   */
  constructor(scheme: string, resource: string);
}
import WebpackError = require('./WebpackError');
