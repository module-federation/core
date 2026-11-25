export = UnsplitVendorsWarning;
/**
 * @typedef {object} UnsplitVendorChunkDetails
 * @property {string} name
 * @property {number} vendorModules how many of its modules come from node_modules
 * @property {number} vendorSize bytes those modules contribute
 */
declare class UnsplitVendorsWarning extends WebpackError {
    /**
     * Creates an instance of UnsplitVendorsWarning.
     * @param {UnsplitVendorChunkDetails[]} chunks the worst offenders, largest vendor size first
     */
    constructor(chunks: UnsplitVendorChunkDetails[]);
}
declare namespace UnsplitVendorsWarning {
    export { UnsplitVendorChunkDetails };
}
import WebpackError = require("./WebpackError");
type UnsplitVendorChunkDetails = {
    name: string;
    /**
     * how many of its modules come from node_modules
     */
    vendorModules: number;
    /**
     * bytes those modules contribute
     */
    vendorSize: number;
};
