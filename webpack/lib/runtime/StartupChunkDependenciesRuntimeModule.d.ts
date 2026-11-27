export = StartupChunkDependenciesRuntimeModule;
/** @import Chunk from "../graph/Chunk" */
/** @import ChunkGraph from "../graph/ChunkGraph" */
/** @import Compilation from "../Compilation" */
declare class StartupChunkDependenciesRuntimeModule extends RuntimeModule {
    /**
     * @param {boolean} asyncChunkLoading use async chunk loading
     */
    constructor(asyncChunkLoading: boolean);
    /** @type {boolean} */
    asyncChunkLoading: boolean;
}
import RuntimeModule = require("./RuntimeModule");
