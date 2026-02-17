export = ChunkRenderError;
/** @typedef {import("./Chunk")} Chunk */
declare class ChunkRenderError extends WebpackError {
  /**
   * Create a new ChunkRenderError
   * @param {Chunk} chunk A chunk
   * @param {string} file Related file
   * @param {Error} error Original error
   */
  constructor(chunk: Chunk, file: string, error: Error);
  error: Error;
}
declare namespace ChunkRenderError {
  export { Chunk };
}
import WebpackError = require('./WebpackError');
type Chunk = import('./Chunk');
