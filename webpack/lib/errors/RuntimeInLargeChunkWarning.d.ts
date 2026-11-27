export = RuntimeInLargeChunkWarning;
declare class RuntimeInLargeChunkWarning extends WebpackError {
    /**
     * Creates an instance of RuntimeInLargeChunkWarning.
     * @param {string[]} entrypoints names of the entrypoints carrying the runtime
     */
    constructor(entrypoints: string[]);
}
import WebpackError = require("./WebpackError");
