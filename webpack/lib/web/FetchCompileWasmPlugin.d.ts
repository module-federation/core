export = FetchCompileWasmPlugin;
/**
 * Enables synchronous WebAssembly chunk loading that fetches `.wasm` files and
 * compiles them in browser-like environments.
 */
declare class FetchCompileWasmPlugin {
    /**
     * Stores options that affect generated synchronous WebAssembly runtime code.
     * @param {FetchCompileWasmPluginOptions=} options options
     */
    constructor(options?: FetchCompileWasmPluginOptions | undefined);
    /** @type {FetchCompileWasmPluginOptions} */
    options: FetchCompileWasmPluginOptions;
    /**
     * Registers compilation hooks that attach the fetch-based synchronous wasm
     * runtime module to chunks containing sync WebAssembly modules.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace FetchCompileWasmPlugin {
    export { FetchCompileWasmPluginOptions };
}
import type Compiler from "../Compiler";
/**
 * Options that influence how synchronous WebAssembly modules are emitted for
 * the fetch-based wasm loading runtime.
 */
type FetchCompileWasmPluginOptions = {
    /**
     * mangle imports
     */
    mangleImports?: boolean | undefined;
};
