export = UnusedRuleWarning;
declare class UnusedRuleWarning extends WebpackError {
    /**
     * Creates an instance of UnusedRuleWarning.
     * @param {string[]} rules descriptions of the rules that never matched
     */
    constructor(rules: string[]);
}
import WebpackError = require("./WebpackError");
