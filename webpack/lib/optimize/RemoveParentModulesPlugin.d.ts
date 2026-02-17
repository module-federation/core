export = RemoveParentModulesPlugin;
declare class RemoveParentModulesPlugin {
    /**
     * @param {Compiler} compiler the compiler
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace RemoveParentModulesPlugin {
    export { Chunk, ChunkGroup, Compiler, Module };
}
type Chunk = import("../Chunk");
type ChunkGroup = import("../ChunkGroup");
type Compiler = import("../Compiler");
type Module = import("../Module");
