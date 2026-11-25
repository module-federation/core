export = CommentCompilationWarning;
/** @import { DependencyLocation } from "../graph/Dependency" */
/**
 * Warning used for comment-related compilation issues, such as malformed magic
 * comments that webpack can parse but wants to report.
 */
declare class CommentCompilationWarning extends WebpackError {
    /**
     * Captures a warning message together with the dependency location that
     * triggered it.
     * @param {string} message warning message
     * @param {DependencyLocation} loc affected lines of code
     */
    constructor(message: string, loc: DependencyLocation);
}
import WebpackError = require("./WebpackError");
import type { DependencyLocation } from "../graph/Dependency";
