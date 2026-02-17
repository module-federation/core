export = AsyncModuleRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
declare class AsyncModuleRuntimeModule extends HelperRuntimeModule {
    /**
     * @param {boolean=} deferInterop if defer import is used.
     */
    constructor(deferInterop?: boolean | undefined);
    _deferInterop: boolean;
}
declare namespace AsyncModuleRuntimeModule {
    export { Compilation };
}
import HelperRuntimeModule = require("./HelperRuntimeModule");
type Compilation = import("../Compilation");
