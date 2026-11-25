export = DeprecatedOptionWarning;
declare class DeprecatedOptionWarning extends WebpackError {
    /**
     * Create an instance deprecated option warning
     * @param {string} option the target option
     * @param {string | number} value the deprecated option value
     * @param {string} suggestion the suggestion replacement
     */
    constructor(option: string, value: string | number, suggestion: string);
}
import WebpackError = require("./WebpackError");
