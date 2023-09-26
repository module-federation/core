export = UnsupportedWebAssemblyFeatureError;
declare class UnsupportedWebAssemblyFeatureError extends WebpackError {
  /** @param {string} message Error message */
  constructor(message: string);
}
import WebpackError = require('../WebpackError');
