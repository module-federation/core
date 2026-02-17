export = ReadFileCompileWasmPlugin;
declare class ReadFileCompileWasmPlugin {
    /**
     * @param {ReadFileCompileWasmPluginOptions=} options options object
     */
    constructor(options?: ReadFileCompileWasmPluginOptions | undefined);
    options: ReadFileCompileWasmPluginOptions;
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ReadFileCompileWasmPlugin {
    export { Chunk, Compiler, ReadFileCompileWasmPluginOptions };
}
type Chunk = import("../Chunk");
type Compiler = import("../Compiler");
type ReadFileCompileWasmPluginOptions = {
    /**
     * mangle imports
     */
    mangleImports?: boolean | undefined;
    /**
     * use import?
     */
    import?: boolean | undefined;
};
