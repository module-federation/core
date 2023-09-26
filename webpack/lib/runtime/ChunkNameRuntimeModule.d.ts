export = ChunkNameRuntimeModule;
declare class ChunkNameRuntimeModule extends RuntimeModule {
  /**
   * @param {string} chunkName the chunk's name
   */
  constructor(chunkName: string);
  chunkName: string;
}
import RuntimeModule = require('../RuntimeModule');
