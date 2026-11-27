export = UnusedExternalsWarning;
declare class UnusedExternalsWarning extends WebpackError {
    /**
     * Creates an instance of UnusedExternalsWarning.
     * @param {string[]} requests the external requests nothing imported
     */
    constructor(requests: string[]);
}
import WebpackError = require("./WebpackError");
