export = CodeGenerationError;
/** @import Module from "../module/Module" */
declare class CodeGenerationError extends WebpackError {
    /**
     * Create a new CodeGenerationError
     * @param {Module} module related module
     * @param {Error} error Original error
     */
    constructor(module: Module, error: Error);
    /** @type {Error} */
    error: Error;
}
import WebpackError = require("./WebpackError");
import type Module from "../module/Module";
