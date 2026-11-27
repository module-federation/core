export = ChunkRenderError;
/** @import Chunk from "../graph/Chunk" */
declare class ChunkRenderError extends WebpackError {
    /**
     * Create a new ChunkRenderError
     * @param {Chunk} chunk A chunk
     * @param {string} file Related file
     * @param {Error} error Original error
     */
    constructor(chunk: Chunk, file: string, error: Error);
    /** @type {Error} */
    error: Error;
}
import WebpackError = require("./WebpackError");
import type Chunk from "../graph/Chunk";
