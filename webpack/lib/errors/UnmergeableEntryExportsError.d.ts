export = UnmergeableEntryExportsError;
/** @import Chunk from "../graph/Chunk" */
/**
 * Error raised when an entry asks for `entryExports: "all"` but webpack cannot build
 * the merged exports object from its modules.
 */
declare class UnmergeableEntryExportsError extends WebpackError {
    /**
     * Captures the chunk carrying the entry and why its exports cannot be merged.
     * @param {Chunk} chunk the chunk carrying the entry
     * @param {string} reason what stands in the way, as a sentence fragment
     */
    constructor(chunk: Chunk, reason: string);
}
import WebpackError = require("./WebpackError");
import type Chunk from "../graph/Chunk";
