export = UniversalCompileAsyncWasmPlugin;
declare class UniversalCompileAsyncWasmPlugin {
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace UniversalCompileAsyncWasmPlugin {
    export { Chunk, Compiler };
}
type Chunk = import("../Chunk");
type Compiler = import("../Compiler");
