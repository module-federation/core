export = ChunkPrefetchFunctionRuntimeModule;
/** @import Compilation from "../Compilation" */
declare class ChunkPrefetchFunctionRuntimeModule extends RuntimeModule {
    /**
     * @param {"prefetch" | "preload"} type "prefetch" or "preload" chunk type function
     * @param {string | null} runtimeFunction the runtime function name, or `null` where nothing fans out over the handlers
     * @param {string} runtimeHandlers the runtime handlers
     */
    constructor(type: "prefetch" | "preload", runtimeFunction: string | null, runtimeHandlers: string);
    /** @type {string | null} */
    runtimeFunction: string | null;
    /** @type {string} */
    runtimeHandlers: string;
}
import RuntimeModule = require("../runtime/RuntimeModule");
