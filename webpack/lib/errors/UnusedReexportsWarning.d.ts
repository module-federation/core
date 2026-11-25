export = UnusedReexportsWarning;
/**
 * @typedef {object} UnusedReexportDetails
 * @property {string} name
 * @property {number} size bytes the module costs
 */
declare class UnusedReexportsWarning extends WebpackError {
    /**
     * Creates an instance of UnusedReexportsWarning.
     * @param {UnusedReexportDetails[]} modules the worst offenders, largest first
     * @param {number} total how many modules are bundled unused
     * @param {number} wasted bytes they cost together
     */
    constructor(modules: UnusedReexportDetails[], total: number, wasted: number);
}
declare namespace UnusedReexportsWarning {
    export { UnusedReexportDetails };
}
import WebpackError = require("./WebpackError");
type UnusedReexportDetails = {
    name: string;
    /**
     * bytes the module costs
     */
    size: number;
};
