export = ModuleChunkFormatPlugin;
declare class ModuleChunkFormatPlugin {
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ModuleChunkFormatPlugin {
    export { Source, Chunk, ChunkGraph, Compilation, Compiler, Entrypoint };
}
type Source = import("webpack-sources").Source;
type Chunk = import("../Chunk");
type ChunkGraph = import("../ChunkGraph");
type Compilation = import("../Compilation");
type Compiler = import("../Compiler");
type Entrypoint = import("../Entrypoint");
