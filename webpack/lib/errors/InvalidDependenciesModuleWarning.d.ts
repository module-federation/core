export = InvalidDependenciesModuleWarning;
/** @import Module from "../module/Module" */
declare class InvalidDependenciesModuleWarning extends WebpackError {
    /**
     * Creates an instance of InvalidDependenciesModuleWarning.
     * @param {Module} module module tied to dependency
     * @param {Iterable<string>} deps invalid dependencies
     */
    constructor(module: Module, deps: Iterable<string>);
}
import WebpackError = require("./WebpackError");
import type Module from "../module/Module";
