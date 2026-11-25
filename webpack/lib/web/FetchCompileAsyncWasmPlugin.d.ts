export = FetchCompileAsyncWasmPlugin;
/**
 * Enables asynchronous WebAssembly loading through `fetch` for environments
 * that can instantiate fetched binaries at runtime.
 */
declare class FetchCompileAsyncWasmPlugin {
    /**
     * Registers compilation hooks that attach the async fetch-based wasm runtime
     * to chunks containing async WebAssembly modules.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type Compiler from "../Compiler";
