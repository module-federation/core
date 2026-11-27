export = MinMaxSizeWarning;
declare class MinMaxSizeWarning extends WebpackError {
    /**
     * Creates an instance of MinMaxSizeWarning.
     * @param {string[] | undefined} keys keys
     * @param {number} minSize minimum size
     * @param {number} maxSize maximum size
     */
    constructor(keys: string[] | undefined, minSize: number, maxSize: number);
}
import WebpackError = require("./WebpackError");
