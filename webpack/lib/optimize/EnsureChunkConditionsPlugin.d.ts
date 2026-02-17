export = EnsureChunkConditionsPlugin;
declare class EnsureChunkConditionsPlugin {
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace EnsureChunkConditionsPlugin {
    export { Chunk, ChunkGroup, Compiler };
}
type Chunk = import("../Chunk");
type ChunkGroup = import("../ChunkGroup");
type Compiler = import("../Compiler");
