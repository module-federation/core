export = ChunkPreloadTriggerRuntimeModule;
/** @import Compilation from "../Compilation" */
/** @import { ChunkChildIdsByOrdersMap } from "../graph/Chunk" */
declare class ChunkPreloadTriggerRuntimeModule extends RuntimeModule {
    /**
     * @param {ChunkChildIdsByOrdersMap} chunkMap map from chunk to chunks
     * @param {string=} handlerKey the `ensureChunkHandlers` key to install under (default `"preload"`); `"cssPreload"` preloads only the CSS handler so it stays CSS-only even when the build also registers a JS preload handler
     */
    constructor(chunkMap: ChunkChildIdsByOrdersMap, handlerKey?: string | undefined);
    /** @type {ChunkChildIdsByOrdersMap} */
    chunkMap: ChunkChildIdsByOrdersMap;
    /** @type {string} */
    handlerKey: string;
}
import RuntimeModule = require("../runtime/RuntimeModule");
import type { ChunkChildIdsByOrdersMap } from "../graph/Chunk";
