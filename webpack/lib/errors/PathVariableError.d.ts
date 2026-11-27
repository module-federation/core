export = PathVariableError;
declare class PathVariableError extends WebpackError {
    /**
     * Creates an instance of PathVariableError.
     * @param {string} variable the placeholder that has no value here, e.g. `[contenthash:8]`
     * @param {string} template the path template the placeholder appears in
     */
    constructor(variable: string, template: string);
    /** @type {string} */
    variable: string;
    /** @type {string} */
    template: string;
}
import WebpackError = require("./WebpackError");
