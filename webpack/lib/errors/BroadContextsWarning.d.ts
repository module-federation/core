export = BroadContextsWarning;
/**
 * @typedef {object} BroadContextDetails
 * @property {string} name the context as written, shortened for the report
 * @property {number} modules how many distinct modules it matched
 * @property {number} size bytes those modules contribute
 */
declare class BroadContextsWarning extends WebpackError {
    /**
     * Creates an instance of BroadContextsWarning.
     * @param {BroadContextDetails[]} contexts the worst offenders, largest first
     * @param {number} total how many broad contexts there are in all
     */
    constructor(contexts: BroadContextDetails[], total: number);
}
declare namespace BroadContextsWarning {
    export { BroadContextDetails };
}
import WebpackError = require("./WebpackError");
type BroadContextDetails = {
    /**
     * the context as written, shortened for the report
     */
    name: string;
    /**
     * how many distinct modules it matched
     */
    modules: number;
    /**
     * bytes those modules contribute
     */
    size: number;
};
