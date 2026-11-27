export = UnhandledSchemeError;
/**
 * Error raised when webpack encounters a resource URI scheme that no installed
 * plugin knows how to read.
 */
declare class UnhandledSchemeError extends WebpackError {
    /**
     * Creates an error explaining that the current resource scheme is not
     * supported by the active plugin set.
     * @param {string} scheme scheme
     * @param {string} resource resource
     */
    constructor(scheme: string, resource: string);
}
import WebpackError = require("./WebpackError");
