export = AggressiveSplittingPlugin;
declare class AggressiveSplittingPlugin {
    /**
     * Was chunk recorded.
     * @param {Chunk} chunk the chunk to test
     * @returns {boolean} true if the chunk was recorded
     */
    static wasChunkRecorded(chunk: Chunk): boolean;
    /**
     * Creates an instance of AggressiveSplittingPlugin.
     * @param {AggressiveSplittingPluginOptions=} options options object
     */
    constructor(options?: AggressiveSplittingPluginOptions | undefined);
    /** @type {AggressiveSplittingPluginOptions} */
    options: AggressiveSplittingPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace AggressiveSplittingPlugin {
    export { AggressiveSplittingPluginOptions, SplitData };
}
import type Compiler from "../Compiler";
import type Chunk from "../graph/Chunk";
type AggressiveSplittingPluginOptions = {
    /**
     * Extra cost for each chunk (Default: 9.8kiB).
     */
    chunkOverhead?: number | undefined;
    /**
     * Extra cost multiplicator for entry chunks (Default: 10).
     */
    entryChunkMultiplicator?: number | undefined;
    /**
     * Byte, max size of per file (Default: 50kiB).
     */
    maxSize?: number | undefined;
    /**
     * Byte, split point. (Default: 30kiB).
     */
    minSize?: number | undefined;
};
type SplitData = {
    id?: NonNullable<Chunk["id"]>;
    hash?: NonNullable<Chunk["hash"]>;
    modules: string[];
    size: number;
};
