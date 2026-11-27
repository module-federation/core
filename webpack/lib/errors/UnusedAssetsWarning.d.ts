export = UnusedAssetsWarning;
/**
 * @typedef {object} UnusedAssetDetails
 * @property {string} name the module, by request
 * @property {number} size the bytes its file adds to the output
 */
declare class UnusedAssetsWarning extends WebpackError {
    /**
     * Creates an instance of UnusedAssetsWarning.
     * @param {UnusedAssetDetails[]} assets the assets nothing reads
     * @param {number} total the bytes they add between them
     */
    constructor(assets: UnusedAssetDetails[], total: number);
}
declare namespace UnusedAssetsWarning {
    export { UnusedAssetDetails };
}
import WebpackError = require("./WebpackError");
type UnusedAssetDetails = {
    /**
     * the module, by request
     */
    name: string;
    /**
     * the bytes its file adds to the output
     */
    size: number;
};
