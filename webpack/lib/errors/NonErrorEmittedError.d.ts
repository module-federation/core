export = NonErrorEmittedError;
declare class NonErrorEmittedError extends WebpackError {
    /**
     * @param {EXPECTED_ANY} error value which is not an instance of Error
     */
    constructor(error: EXPECTED_ANY);
}
import WebpackError = require("./WebpackError");
