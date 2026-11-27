export = AsyncModuleRuntimeModule;
/** @import Compilation from "../Compilation" */
/** @import Chunk from "../graph/Chunk" */
declare class AsyncModuleRuntimeModule extends HelperRuntimeModule {
    /**
     * @param {boolean=} deferInterop if defer import is used.
     * @param {boolean=} strictModuleErrorHandling if a recorded evaluation error is kept.
     */
    constructor(deferInterop?: boolean | undefined, strictModuleErrorHandling?: boolean | undefined);
    /** @type {boolean} */
    _deferInterop: boolean;
    /** @type {boolean} */
    _strictModuleErrorHandling: boolean;
}
import HelperRuntimeModule = require("./HelperRuntimeModule");
