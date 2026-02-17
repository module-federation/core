export = ReadFileCompileAsyncWasmPlugin;
declare class ReadFileCompileAsyncWasmPlugin {
    /**
     * @param {ReadFileCompileAsyncWasmPluginOptions=} options options object
     */
    constructor({ import: useImport }?: ReadFileCompileAsyncWasmPluginOptions | undefined);
    _import: boolean;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ReadFileCompileAsyncWasmPlugin {
    export { Chunk, Compiler, ReadFileCompileAsyncWasmPluginOptions };
}
type Chunk = import("../Chunk");
type Compiler = import("../Compiler");
type ReadFileCompileAsyncWasmPluginOptions = {
    /**
     * use import?
     */
    import?: boolean | undefined;
};
