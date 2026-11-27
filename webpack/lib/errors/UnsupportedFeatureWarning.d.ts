export = UnsupportedFeatureWarning;
/** @import { DependencyLocation } from "../graph/Dependency" */
declare class UnsupportedFeatureWarning extends WebpackError {
    /**
     * Creates an instance of UnsupportedFeatureWarning.
     * @param {string} message description of warning
     * @param {DependencyLocation} loc location start and end positions of the module
     */
    constructor(message: string, loc: DependencyLocation);
}
import WebpackError = require("./WebpackError");
import type { DependencyLocation } from "../graph/Dependency";
