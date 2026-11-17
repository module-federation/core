export = EvalUsageWarning;
declare class EvalUsageWarning extends WebpackError {
    /**
     * Creates an instance of EvalUsageWarning.
     * @param {string[]} modules the modules calling it, named for the report
     * @param {number} total how many call it in all
     */
    constructor(modules: string[], total: number);
}
import WebpackError = require("./WebpackError");
