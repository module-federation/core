export = UnusedDefinesWarning;
declare class UnusedDefinesWarning extends WebpackError {
    /**
     * Creates an instance of UnusedDefinesWarning.
     * @param {string[]} keys the define keys nothing referenced
     */
    constructor(keys: string[]);
}
import WebpackError = require("./WebpackError");
