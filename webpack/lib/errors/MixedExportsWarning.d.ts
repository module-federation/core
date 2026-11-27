export = MixedExportsWarning;
/**
 * @typedef {object} MixedExportsDetails
 * @property {string} name the entry, by name
 * @property {string[]} named the named exports sitting beside the default
 */
declare class MixedExportsWarning extends WebpackError {
    /**
     * Creates an instance of MixedExportsWarning.
     * @param {MixedExportsDetails[]} entries the entries that mix them
     * @param {string} type the library type they are built for
     */
    constructor(entries: MixedExportsDetails[], type: string);
}
declare namespace MixedExportsWarning {
    export { MixedExportsDetails };
}
import WebpackError = require("./WebpackError");
type MixedExportsDetails = {
    /**
     * the entry, by name
     */
    name: string;
    /**
     * the named exports sitting beside the default
     */
    named: string[];
};
