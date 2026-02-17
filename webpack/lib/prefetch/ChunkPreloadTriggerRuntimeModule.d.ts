export = ChunkPreloadTriggerRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("../Chunk").ChunkChildIdsByOrdersMap} ChunkChildIdsByOrdersMap */
declare class ChunkPreloadTriggerRuntimeModule extends RuntimeModule {
    /**
     * @param {ChunkChildIdsByOrdersMap} chunkMap map from chunk to chunks
     */
    constructor(chunkMap: ChunkChildIdsByOrdersMap);
    chunkMap: import("../Chunk").ChunkChildIdsByOrdersMap;
}
declare namespace ChunkPreloadTriggerRuntimeModule {
    export { Compilation, ChunkChildIdsByOrdersMap };
}
import RuntimeModule = require("../RuntimeModule");
type Compilation = import("../Compilation");
type ChunkChildIdsByOrdersMap = import("../Chunk").ChunkChildIdsByOrdersMap;
