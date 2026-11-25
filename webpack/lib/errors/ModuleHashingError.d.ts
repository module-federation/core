export = ModuleHashingError;
/** @import Module from "../module/Module" */
declare class ModuleHashingError extends WebpackError {
    /**
     * Create a new ModuleHashingError
     * @param {Module} module related module
     * @param {Error} error Original error
     */
    constructor(module: Module, error: Error);
    /** @type {Error} */
    error: Error;
}
import WebpackError = require("./WebpackError");
import type Module from "../module/Module";
