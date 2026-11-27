export = BuildCycleError;
/** @import Module from "../module/Module" */
declare class BuildCycleError extends WebpackError {
    /**
     * Creates an instance of BuildCycleError.
     * @param {Module} module the module starting the cycle
     */
    constructor(module: Module);
}
import WebpackError = require("./WebpackError");
import type Module from "../module/Module";
