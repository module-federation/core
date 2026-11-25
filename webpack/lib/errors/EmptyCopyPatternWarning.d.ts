export = EmptyCopyPatternWarning;
declare class EmptyCopyPatternWarning extends WebpackError {
    /**
     * Creates an instance of EmptyCopyPatternWarning.
     * @param {string} from the `from` of the pattern as written in the configuration
     * @param {string} glob the glob `from` was resolved to
     */
    constructor(from: string, glob: string);
}
import WebpackError = require("./WebpackError");
