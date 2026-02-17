export = ChunkPrefetchTriggerRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("../Chunk").ChunkChildIdsByOrdersMap} ChunkChildIdsByOrdersMap */
declare class ChunkPrefetchTriggerRuntimeModule extends RuntimeModule {
  /**
   * @param {ChunkChildIdsByOrdersMap} chunkMap map from chunk to
   */
  constructor(chunkMap: ChunkChildIdsByOrdersMap);
  chunkMap: import('../Chunk').ChunkChildIdsByOrdersMap;
}
declare namespace ChunkPrefetchTriggerRuntimeModule {
  export { Compilation, ChunkChildIdsByOrdersMap };
}
import RuntimeModule = require('../RuntimeModule');
type Compilation = import('../Compilation');
type ChunkChildIdsByOrdersMap = import('../Chunk').ChunkChildIdsByOrdersMap;
