export = UnsupportedWebAssemblyFeatureError;
declare class UnsupportedWebAssemblyFeatureError extends WebpackError {
    /**
     * Creates an instance of UnsupportedWebAssemblyFeatureError.
     * @param {string} message Error message
     */
    constructor(message: string);
}
import WebpackError = require("./WebpackError");
