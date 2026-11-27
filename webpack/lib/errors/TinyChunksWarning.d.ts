export = TinyChunksWarning;
/**
 * @typedef {object} TinyChunkDetails
 * @property {string} name the chunk, by name or by id
 * @property {number} size bytes it carries
 */
declare class TinyChunksWarning extends WebpackError {
    /**
     * Creates an instance of TinyChunksWarning.
     * @param {TinyChunkDetails[]} chunks the smallest of them
     * @param {number} total how many fall under the floor in all
     * @param {number} totalSize bytes they carry between them
     */
    constructor(chunks: TinyChunkDetails[], total: number, totalSize: number);
}
declare namespace TinyChunksWarning {
    export { TinyChunkDetails };
}
import WebpackError = require("./WebpackError");
type TinyChunkDetails = {
    /**
     * the chunk, by name or by id
     */
    name: string;
    /**
     * bytes it carries
     */
    size: number;
};
