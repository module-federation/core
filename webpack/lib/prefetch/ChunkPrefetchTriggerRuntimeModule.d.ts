export = ChunkPrefetchTriggerRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("../RuntimeTemplate")} RuntimeTemplate */
declare class ChunkPrefetchTriggerRuntimeModule extends RuntimeModule {
  /**
   * @param {Record<string|number, (string|number)[]>} chunkMap map from chunk to
   */
  constructor(chunkMap: Record<string | number, (string | number)[]>);
  chunkMap: Record<string | number, (string | number)[]>;
}
declare namespace ChunkPrefetchTriggerRuntimeModule {
  export { Compilation, RuntimeTemplate };
}
import RuntimeModule = require('../RuntimeModule');
type Compilation = import('../Compilation');
type RuntimeTemplate = import('../RuntimeTemplate');
