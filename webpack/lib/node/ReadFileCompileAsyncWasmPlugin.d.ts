export = ReadFileCompileAsyncWasmPlugin;
declare class ReadFileCompileAsyncWasmPlugin {
    /**
     * Creates an instance of ReadFileCompileAsyncWasmPlugin.
     * @param {ReadFileCompileAsyncWasmPluginOptions=} options options object
     */
    constructor({ import: useImport }?: ReadFileCompileAsyncWasmPluginOptions | undefined);
    /** @type {boolean} */
    _import: boolean;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ReadFileCompileAsyncWasmPlugin {
    export { ReadFileCompileAsyncWasmPluginOptions };
}
import type Compiler from "../Compiler";
/**
 * Defines the read file compile async wasm plugin options type used by this module.
 */
type ReadFileCompileAsyncWasmPluginOptions = {
    /**
     * use import?
     */
    import?: boolean | undefined;
};
