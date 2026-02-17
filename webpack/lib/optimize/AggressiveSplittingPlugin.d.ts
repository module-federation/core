export = AggressiveSplittingPlugin;
declare class AggressiveSplittingPlugin {
    /**
     * @param {Chunk} chunk the chunk to test
     * @returns {boolean} true if the chunk was recorded
     */
    static wasChunkRecorded(chunk: Chunk): boolean;
    /**
     * @param {AggressiveSplittingPluginOptions=} options options object
     */
    constructor(options?: AggressiveSplittingPluginOptions | undefined);
    options: import("../../declarations/plugins/optimize/AggressiveSplittingPlugin").AggressiveSplittingPluginOptions;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace AggressiveSplittingPlugin {
    export { AggressiveSplittingPluginOptions, Chunk, ChunkId, ChunkGraph, Compiler, Module, SplitData };
}
type AggressiveSplittingPluginOptions = import("../../declarations/plugins/optimize/AggressiveSplittingPlugin").AggressiveSplittingPluginOptions;
type Chunk = import("../Chunk");
type ChunkId = import("../Chunk").ChunkId;
type ChunkGraph = import("../ChunkGraph");
type Compiler = import("../Compiler");
type Module = import("../Module");
type SplitData = {
    id?: NonNullable<Chunk["id"]>;
    hash?: NonNullable<Chunk["hash"]>;
    modules: Module[];
    size: number;
};
