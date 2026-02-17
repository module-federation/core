export = ChunkPrefetchPreloadPlugin;
declare class ChunkPrefetchPreloadPlugin {
    /**
     * @param {Compiler} compiler the compiler
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ChunkPrefetchPreloadPlugin {
    export { Compiler };
}
type Compiler = import("../Compiler");
