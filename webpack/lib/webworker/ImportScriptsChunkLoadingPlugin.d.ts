export = ImportScriptsChunkLoadingPlugin;
/**
 * Enables worker-side chunk loading via `importScripts` and wires in the
 * runtime helpers needed for startup, loading, and hot updates.
 */
declare class ImportScriptsChunkLoadingPlugin {
    /**
     * Registers compilation hooks that attach the `importScripts` chunk-loading
     * runtime and its supporting globals to chunks using that backend.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type Compiler from "../Compiler";
