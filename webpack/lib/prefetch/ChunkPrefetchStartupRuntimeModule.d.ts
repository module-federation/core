export = ChunkPrefetchStartupRuntimeModule;
/** @import Chunk, { ChunkChildOfTypeInOrder } from "../graph/Chunk" */
/** @import Compilation from "../Compilation" */
declare class ChunkPrefetchStartupRuntimeModule extends RuntimeModule {
    /**
     * @param {ChunkChildOfTypeInOrder[]} startupChunks chunk ids to trigger when chunks are loaded
     */
    constructor(startupChunks: Chunk.ChunkChildOfTypeInOrder[]);
    /** @type {ChunkChildOfTypeInOrder[]} */
    startupChunks: Chunk.ChunkChildOfTypeInOrder[];
}
import RuntimeModule = require("../runtime/RuntimeModule");
import type Chunk from "../graph/Chunk";
