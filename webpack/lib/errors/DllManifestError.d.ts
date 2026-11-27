export = DllManifestError;
declare class DllManifestError extends WebpackError {
    /**
     * Creates an instance of DllManifestError.
     * @param {string} filename filename of the manifest
     * @param {string} message error message
     */
    constructor(filename: string, message: string);
}
import WebpackError = require("./WebpackError");
