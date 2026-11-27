export = ModuleNotFoundError;
declare class ModuleNotFoundError extends WebpackError {
    /**
     * Creates an instance of ModuleNotFoundError.
     * @param {Module | null} module module tied to dependency
     * @param {Error & { details?: string }} err error thrown
     * @param {DependencyLocation} loc location of dependency
     */
    constructor(module: Module | null, err: Error & {
        details?: string;
    }, loc: DependencyLocation);
    error: Error & {
        details?: string;
    };
}
import WebpackError = require("./WebpackError");
import type Module from "../module/Module";
import type { DependencyLocation } from "../graph/Dependency";
