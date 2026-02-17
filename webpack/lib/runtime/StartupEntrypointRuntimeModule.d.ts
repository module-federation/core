export = StartupEntrypointRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
declare class StartupEntrypointRuntimeModule extends RuntimeModule {
    /**
     * @param {boolean} asyncChunkLoading use async chunk loading
     */
    constructor(asyncChunkLoading: boolean);
    asyncChunkLoading: boolean;
}
declare namespace StartupEntrypointRuntimeModule {
    export { Compilation };
}
import RuntimeModule = require("../RuntimeModule");
type Compilation = import("../Compilation");
