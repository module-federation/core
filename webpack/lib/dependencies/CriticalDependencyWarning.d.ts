export = CriticalDependencyWarning;
declare class CriticalDependencyWarning extends WebpackError {
  /**
   * @param {string} message message
   */
  constructor(message: string);
}
import WebpackError = require('../WebpackError');
