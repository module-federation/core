export = NaturalChunkIdsPlugin;
declare class NaturalChunkIdsPlugin {
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace NaturalChunkIdsPlugin {
    export { Chunk, Compiler };
}
type Chunk = import("../Chunk");
type Compiler = import("../Compiler");
