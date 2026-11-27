export = SystemImportDeprecationWarning;
/** @import { DependencyLocation } from "../graph/Dependency" */
declare class SystemImportDeprecationWarning extends WebpackError {
    /**
     * Creates an instance of SystemImportDeprecationWarning.
     * @param {DependencyLocation} loc location
     */
    constructor(loc: DependencyLocation);
}
import WebpackError = require("./WebpackError");
import type { DependencyLocation } from "../graph/Dependency";
