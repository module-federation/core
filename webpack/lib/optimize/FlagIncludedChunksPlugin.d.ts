export = FlagIncludedChunksPlugin;
declare class FlagIncludedChunksPlugin {
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace FlagIncludedChunksPlugin {
    export { Chunk, ChunkId, Compiler, Module };
}
type Chunk = import("../Chunk");
type ChunkId = import("../Chunk").ChunkId;
type Compiler = import("../Compiler");
type Module = import("../Module");
