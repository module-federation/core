export = ChunkPreloadTriggerRuntimeModule;
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("../RuntimeTemplate")} RuntimeTemplate */
declare class ChunkPreloadTriggerRuntimeModule extends RuntimeModule {
  /**
   * @param {Record<string|number, (string|number)[]>} chunkMap map from chunk to chunks
   */
  constructor(chunkMap: Record<string | number, (string | number)[]>);
  chunkMap: Record<string | number, (string | number)[]>;
}
declare namespace ChunkPreloadTriggerRuntimeModule {
  export { Compilation, RuntimeTemplate };
}
import RuntimeModule = require('../RuntimeModule');
type Compilation = import('../Compilation');
type RuntimeTemplate = import('../RuntimeTemplate');
