export = UniversalCompileAsyncWasmPlugin;
/**
 * Enables async WebAssembly loading that works in both browser-like and Node.js
 * environments by selecting the appropriate binary-loading strategy at runtime.
 */
declare class UniversalCompileAsyncWasmPlugin {
    /**
     * Registers compilation hooks that attach the universal async wasm runtime
     * to chunks using `wasmLoading: "universal"`.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type Compiler from "../Compiler";
