export = GetChunkFilenameRuntimeModule;
/** @import Chunk, { ChunkId, ChunkFilenameTemplate } from "../graph/Chunk" */
/** @import ChunkGraph from "../graph/ChunkGraph" */
/**
 * @import Compilation, {
 * 	HashWithLengthFunction,
 * 	HashWithDigestFunction
 * } from "../Compilation"
 */
declare class GetChunkFilenameRuntimeModule extends RuntimeModule {
    /**
     * @param {string} contentType the contentType to use the content hash for
     * @param {string} name kind of filename
     * @param {string} global function name to be assigned
     * @param {(chunk: Chunk) => ChunkFilenameTemplate | false} getFilenameForChunk functor to get the filename or function
     * @param {boolean} allChunks when false, only async chunks are included
     * @param {boolean=} usesFullHashDigest the filename uses `[fullhash:<digest>]`/`[hash:<digest>]`, so the re-encoded full hash must be inlined (post-hash) instead of read from the runtime `getFullHash()` expression
     */
    constructor(contentType: string, name: string, global: string, getFilenameForChunk: (chunk: Chunk) => Chunk.ChunkFilenameTemplate | false, allChunks: boolean, usesFullHashDigest?: boolean | undefined);
    /** @type {string} */
    contentType: string;
    /** @type {string} */
    global: string;
    /** @type {(chunk: Chunk) => ChunkFilenameTemplate | false} */
    getFilenameForChunk: (chunk: Chunk) => Chunk.ChunkFilenameTemplate | false;
    /** @type {boolean} */
    allChunks: boolean;
}
import RuntimeModule = require("./RuntimeModule");
import type Chunk from "../graph/Chunk";
