export = SplitChunksCappedWarning;
/**
 * @typedef {object} CappedSplitDetails
 * @property {string} cacheGroup the cache group whose split was refused
 * @property {string} chunk the chunk it would have been taken out of
 * @property {string} limit the option that refused it
 * @property {number} maxRequests the value that option had
 * @property {number} modules how many modules the split would have moved
 */
declare class SplitChunksCappedWarning extends WebpackError {
    /**
     * Creates an instance of SplitChunksCappedWarning.
     * @param {CappedSplitDetails[]} splits the refused splits, most modules first
     */
    constructor(splits: CappedSplitDetails[]);
}
declare namespace SplitChunksCappedWarning {
    export { CappedSplitDetails };
}
import WebpackError = require("./WebpackError");
type CappedSplitDetails = {
    /**
     * the cache group whose split was refused
     */
    cacheGroup: string;
    /**
     * the chunk it would have been taken out of
     */
    chunk: string;
    /**
     * the option that refused it
     */
    limit: string;
    /**
     * the value that option had
     */
    maxRequests: number;
    /**
     * how many modules the split would have moved
     */
    modules: number;
};
