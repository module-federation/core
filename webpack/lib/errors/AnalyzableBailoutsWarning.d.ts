export = AnalyzableBailoutsWarning;
/**
 * @typedef {object} BailoutDetails
 * @property {string} reason what keeps the runtime form, as the code generation recorded it
 * @property {string[]} modules the modules it was recorded on, as many as are printed
 * @property {number} count how many modules it was recorded on in all
 */
declare class AnalyzableBailoutsWarning extends WebpackError {
    /**
     * Creates an instance of AnalyzableBailoutsWarning.
     * @param {BailoutDetails[]} bailouts the reasons found, the most frequent first
     * @param {number} references how many module and reason pairs there are
     */
    constructor(bailouts: BailoutDetails[], references: number);
}
declare namespace AnalyzableBailoutsWarning {
    export { BailoutDetails };
}
import WebpackError = require("./WebpackError");
type BailoutDetails = {
    /**
     * what keeps the runtime form, as the code generation recorded it
     */
    reason: string;
    /**
     * the modules it was recorded on, as many as are printed
     */
    modules: string[];
    /**
     * how many modules it was recorded on in all
     */
    count: number;
};
