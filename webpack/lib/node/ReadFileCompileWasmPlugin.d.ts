export = ReadFileCompileWasmPlugin;
declare class ReadFileCompileWasmPlugin {
    /**
     * Creates an instance of ReadFileCompileWasmPlugin.
     * @param {ReadFileCompileWasmPluginOptions=} options options object
     */
    constructor(options?: ReadFileCompileWasmPluginOptions | undefined);
    /** @type {ReadFileCompileWasmPluginOptions} */
    options: ReadFileCompileWasmPluginOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ReadFileCompileWasmPlugin {
    export { ReadFileCompileWasmPluginOptions };
}
import type Compiler from "../Compiler";
/**
 * Defines the read file compile wasm plugin options type used by this module.
 */
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
