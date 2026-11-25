export = LoaderLoadingError;
declare class LoaderLoadingError extends WebpackError {
    /**
     * @param {string} message message
     */
    constructor(message: string);
}
import WebpackError = require("./WebpackError");
