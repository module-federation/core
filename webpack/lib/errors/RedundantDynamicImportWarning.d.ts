export = RedundantDynamicImportWarning;
declare class RedundantDynamicImportWarning extends WebpackError {
    /**
     * Creates an instance of RedundantDynamicImportWarning.
     * @param {string[]} imports descriptions of the `import()` calls that split nothing
     */
    constructor(imports: string[]);
}
import WebpackError = require("./WebpackError");
