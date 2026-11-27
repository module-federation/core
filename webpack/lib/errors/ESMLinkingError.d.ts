export = ESMLinkingError;
declare class ESMLinkingError extends WebpackError {
    /** @param {string} message Error message */
    constructor(message: string);
}
import WebpackError = require("./WebpackError");
