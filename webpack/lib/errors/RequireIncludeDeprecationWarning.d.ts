export = RequireIncludeDeprecationWarning;
/** @import { DependencyLocation } from "../graph/Dependency" */
declare class RequireIncludeDeprecationWarning extends WebpackError {
    /**
     * Creates an instance of RequireIncludeDeprecationWarning.
     * @param {DependencyLocation} loc location
     */
    constructor(loc: DependencyLocation);
}
import WebpackError = require("./WebpackError");
import type { DependencyLocation } from "../graph/Dependency";
