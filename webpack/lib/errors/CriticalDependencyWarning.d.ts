export = CriticalDependencyWarning;
declare class CriticalDependencyWarning extends WebpackError {
    /**
     * Creates an instance of CriticalDependencyWarning.
     * @param {string} message message
     */
    constructor(message: string);
}
import WebpackError = require("../errors/WebpackError");
