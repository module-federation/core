export = InlinedAssetsWarning;
/**
 * @typedef {object} InlinedAssetDetails
 * @property {string} name the asset, by path
 * @property {number} size the bytes it adds to the JavaScript
 */
declare class InlinedAssetsWarning extends WebpackError {
    /**
     * Creates an instance of InlinedAssetsWarning.
     * @param {InlinedAssetDetails[]} assets the assets inlined as data urls
     * @param {number} total the bytes they add between them
     */
    constructor(assets: InlinedAssetDetails[], total: number);
}
declare namespace InlinedAssetsWarning {
    export { InlinedAssetDetails };
}
import WebpackError = require("./WebpackError");
type InlinedAssetDetails = {
    /**
     * the asset, by path
     */
    name: string;
    /**
     * the bytes it adds to the JavaScript
     */
    size: number;
};
