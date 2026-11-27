export = ExternalStarReexportError;
/** @import ExternalModule from "../externals/ExternalModule" */
/** @import Module from "../module/Module" */
/**
 * Error raised when a `module` library reexports everything from an external
 * whose request names a property path instead of a module.
 */
declare class ExternalStarReexportError extends WebpackError {
    /**
     * Captures the external and the library entry reexporting from it.
     * @param {ExternalModule} externalModule the reexported external
     * @param {Module} module the library entry module
     */
    constructor(externalModule: ExternalModule, module: Module);
}
import WebpackError = require("./WebpackError");
import type ExternalModule from "../externals/ExternalModule";
import type Module from "../module/Module";
