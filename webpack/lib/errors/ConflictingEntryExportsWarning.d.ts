export = ConflictingEntryExportsWarning;
/** @import Chunk from "../graph/Chunk" */
/**
 * Warning raised when several modules of an `entryExports: "all"` entry bind the same
 * export name, which leaves the name out of the merged exports.
 */
declare class ConflictingEntryExportsWarning extends WebpackError {
    /**
     * Captures the entry's chunk and the names it cannot expose.
     * @param {Chunk} chunk the chunk carrying the entry
     * @param {string[]} names the conflicting export names
     */
    constructor(chunk: Chunk, names: string[]);
}
import WebpackError = require("./WebpackError");
import type Chunk from "../graph/Chunk";
