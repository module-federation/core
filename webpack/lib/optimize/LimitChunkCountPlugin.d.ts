export = LimitChunkCountPlugin;
declare class LimitChunkCountPlugin {
    /**
     * Creates an instance of LimitChunkCountPlugin.
     * @param {LimitChunkCountPluginOptions=} options options object
     */
    constructor(options?: LimitChunkCountPluginOptions | undefined);
    /** @type {LimitChunkCountPluginOptions} */
    options: LimitChunkCountPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the webpack compiler
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace LimitChunkCountPlugin {
    export { PositiveNumber, LimitChunkCountPluginOptions, ChunkCombination };
}
import type Compiler from "../Compiler";
type PositiveNumber = number;
type LimitChunkCountPluginOptions = {
    /**
     * Constant overhead for a chunk.
     */
    chunkOverhead?: number | undefined;
    /**
     * Multiplicator for initial chunks.
     */
    entryChunkMultiplicator?: number | undefined;
    /**
     * Limit the maximum number of chunks using a value greater than or equal to 1.
     */
    maxChunks: PositiveNumber;
};
/**
 * Defines the chunk combination type used by this module.
 */
type ChunkCombination = {
    /**
     * this is set to true when combination was removed
     */
    deleted: boolean;
    sizeDiff: number;
    integratedSize: number;
    a: Chunk;
    b: Chunk;
    aIdx: number;
    bIdx: number;
    aSize: number;
    bSize: number;
};
import type Chunk from "../graph/Chunk";
