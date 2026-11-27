export = OsDependentRuleWarning;
declare class OsDependentRuleWarning extends WebpackError {
    /**
     * Creates an instance of OsDependentRuleWarning.
     * @param {string[]} rules descriptions of the rules whose paths only match on one operating system
     */
    constructor(rules: string[]);
}
import WebpackError = require("./WebpackError");
