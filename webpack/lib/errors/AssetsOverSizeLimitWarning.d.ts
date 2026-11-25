export = AssetsOverSizeLimitWarning;
/** @import { AssetDetails } from "../performance/SizeLimitsPlugin" */
declare class AssetsOverSizeLimitWarning extends WebpackError {
    /**
     * Creates an instance of AssetsOverSizeLimitWarning.
     * @param {AssetDetails[]} assetsOverSizeLimit the assets
     * @param {number} assetLimit the size limit
     */
    constructor(assetsOverSizeLimit: AssetDetails[], assetLimit: number);
    /** @type {AssetDetails[]} */
    assets: AssetDetails[];
}
import WebpackError = require("./WebpackError");
import type { AssetDetails } from "../performance/SizeLimitsPlugin";
