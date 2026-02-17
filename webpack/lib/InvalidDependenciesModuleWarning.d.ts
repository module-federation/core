export = InvalidDependenciesModuleWarning;
/** @typedef {import("./Module")} Module */
declare class InvalidDependenciesModuleWarning extends WebpackError {
    /**
     * @param {Module} module module tied to dependency
     * @param {Iterable<string>} deps invalid dependencies
     */
    constructor(module: Module, deps: Iterable<string>);
}
declare namespace InvalidDependenciesModuleWarning {
    export { Module };
}
import WebpackError = require("./WebpackError");
type Module = import("./Module");
