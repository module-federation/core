export = StartupEntrypointRuntimeModule;
/** @import Chunk from "../graph/Chunk" */
/** @import Compilation from "../Compilation" */
declare class StartupEntrypointRuntimeModule extends RuntimeModule {
    /**
     * @param {boolean} asyncChunkLoading use async chunk loading
     */
    constructor(asyncChunkLoading: boolean);
    /** @type {boolean} */
    asyncChunkLoading: boolean;
}
import RuntimeModule = require("./RuntimeModule");
