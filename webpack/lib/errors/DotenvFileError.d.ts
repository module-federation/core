export = DotenvFileError;
/**
 * Error for a dotenv file that exists but could not be read. An absent file is
 * normal and reported through `missingDependencies` instead.
 */
declare class DotenvFileError extends WebpackError {
    /**
     * @param {string} file path of the dotenv file
     * @param {Error} error underlying file system error
     */
    constructor(file: string, error: Error);
    error: Error;
}
import WebpackError = require("./WebpackError");
