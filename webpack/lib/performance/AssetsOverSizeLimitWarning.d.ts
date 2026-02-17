export = AssetsOverSizeLimitWarning;
declare class AssetsOverSizeLimitWarning extends WebpackError {
  /**
   * @param {AssetDetails[]} assetsOverSizeLimit the assets
   * @param {number} assetLimit the size limit
   */
  constructor(assetsOverSizeLimit: AssetDetails[], assetLimit: number);
  assets: import('./SizeLimitsPlugin').AssetDetails[];
}
declare namespace AssetsOverSizeLimitWarning {
  export { AssetDetails };
}
import WebpackError = require('../WebpackError');
type AssetDetails = import('./SizeLimitsPlugin').AssetDetails;
