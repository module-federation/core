export = HarmonyLinkingError;
declare class HarmonyLinkingError extends WebpackError {
  /** @param {string} message Error message */
  constructor(message: string);
}
import WebpackError = require('./WebpackError');
