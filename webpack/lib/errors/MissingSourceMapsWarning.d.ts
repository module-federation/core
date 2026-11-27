export = MissingSourceMapsWarning;
/**
 * @typedef {object} MissingSourceMapDetails
 * @property {string} name the module, by request
 * @property {string[]} loaders the loaders that ran on it
 */
declare class MissingSourceMapsWarning extends WebpackError {
    /**
     * Creates an instance of MissingSourceMapsWarning.
     * @param {MissingSourceMapDetails[]} modules the modules whose map was lost
     * @param {number} total how many such modules there are
     */
    constructor(modules: MissingSourceMapDetails[], total: number);
}
declare namespace MissingSourceMapsWarning {
    export { MissingSourceMapDetails };
}
import WebpackError = require("./WebpackError");
type MissingSourceMapDetails = {
    /**
     * the module, by request
     */
    name: string;
    /**
     * the loaders that ran on it
     */
    loaders: string[];
};
