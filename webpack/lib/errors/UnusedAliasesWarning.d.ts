export = UnusedAliasesWarning;
declare class UnusedAliasesWarning extends WebpackError {
    /**
     * Creates an instance of UnusedAliasesWarning.
     * @param {string[]} names the alias names no request matched
     */
    constructor(names: string[]);
}
import WebpackError = require("./WebpackError");
