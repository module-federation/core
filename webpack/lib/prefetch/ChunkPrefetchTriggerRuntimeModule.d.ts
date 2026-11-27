export = ChunkPrefetchTriggerRuntimeModule;
/** @import Compilation from "../Compilation" */
/** @import { ChunkChildIdsByOrdersMap } from "../graph/Chunk" */
declare class ChunkPrefetchTriggerRuntimeModule extends RuntimeModule {
    /**
     * @param {ChunkChildIdsByOrdersMap} chunkMap map from chunk to
     */
    constructor(chunkMap: ChunkChildIdsByOrdersMap);
    /** @type {ChunkChildIdsByOrdersMap} */
    chunkMap: ChunkChildIdsByOrdersMap;
}
import RuntimeModule = require("../runtime/RuntimeModule");
import type { ChunkChildIdsByOrdersMap } from "../graph/Chunk";
