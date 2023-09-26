export = EntrypointsOverSizeLimitWarning;
declare class EntrypointsOverSizeLimitWarning extends WebpackError {
  /**
   * @param {EntrypointDetails[]} entrypoints the entrypoints
   * @param {number} entrypointLimit the size limit
   */
  constructor(entrypoints: EntrypointDetails[], entrypointLimit: number);
  entrypoints: import('./SizeLimitsPlugin').EntrypointDetails[];
}
declare namespace EntrypointsOverSizeLimitWarning {
  export { EntrypointDetails };
}
import WebpackError = require('../WebpackError');
type EntrypointDetails = import('./SizeLimitsPlugin').EntrypointDetails;
