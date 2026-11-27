export = AsyncChunkWaterfallWarning;
/**
 * @typedef {object} WaterfallDetails
 * @property {string[]} chain the chunk groups making up the chain, outermost first
 * @property {number} size the bytes the chain loads in total
 */
declare class AsyncChunkWaterfallWarning extends WebpackError {
    /**
     * Creates an instance of AsyncChunkWaterfallWarning.
     * @param {WaterfallDetails[]} waterfalls the chains that are too deep
     * @param {number} depth the depth the deepest of them reaches
     */
    constructor(waterfalls: WaterfallDetails[], depth: number);
}
declare namespace AsyncChunkWaterfallWarning {
    export { WaterfallDetails };
}
import WebpackError = require("./WebpackError");
type WaterfallDetails = {
    /**
     * the chunk groups making up the chain, outermost first
     */
    chain: string[];
    /**
     * the bytes the chain loads in total
     */
    size: number;
};
