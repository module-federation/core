export = RuntimeModuleGenerationError;
declare class RuntimeModuleGenerationError extends WebpackError {
    /**
     * Creates an instance of RuntimeModuleGenerationError.
     * @param {RuntimeModule} module the runtime module whose `generate()` threw
     * @param {Error} error the error it threw
     */
    constructor(module: RuntimeModule, error: Error);
    /** @type {Error} */
    error: Error;
}
import WebpackError = require("./WebpackError");
import type RuntimeModule from "../runtime/RuntimeModule";
