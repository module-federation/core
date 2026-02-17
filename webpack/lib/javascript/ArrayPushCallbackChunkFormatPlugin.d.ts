export = ArrayPushCallbackChunkFormatPlugin;
declare class ArrayPushCallbackChunkFormatPlugin {
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ArrayPushCallbackChunkFormatPlugin {
    export { Compiler, EntryModuleWithChunkGroup, CodeGenerationResults };
}
type Compiler = import("../Compiler");
type EntryModuleWithChunkGroup = import("../ChunkGraph").EntryModuleWithChunkGroup;
type CodeGenerationResults = import("../CodeGenerationResults");
