export = ModuleRestoreError;
/** @import Module from "../module/Module" */
declare class ModuleRestoreError extends WebpackError {
    /**
     * Creates an instance of ModuleRestoreError.
     * @param {Module} module module tied to dependency
     * @param {string | Error} err error thrown
     */
    constructor(module: Module, err: string | Error);
    /** @type {string | Error} */
    error: string | Error;
}
import WebpackError = require("./WebpackError");
import type Module from "../module/Module";
