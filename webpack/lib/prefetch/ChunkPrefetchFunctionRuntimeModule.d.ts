export = ChunkPrefetchFunctionRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
declare class ChunkPrefetchFunctionRuntimeModule extends RuntimeModule {
    /**
     * @param {"prefetch" | "preload"} type "prefetch" or "preload" chunk type function
     * @param {string} runtimeFunction the runtime function name
     * @param {string} runtimeHandlers the runtime handlers
     */
    constructor(type: "prefetch" | "preload", runtimeFunction: string, runtimeHandlers: string);
    runtimeFunction: string;
    runtimeHandlers: string;
}
declare namespace ChunkPrefetchFunctionRuntimeModule {
    export { Compilation };
}
import RuntimeModule = require("../RuntimeModule");
type Compilation = import("../Compilation");
