export = JsonpChunkLoadingPlugin;
/**
 * Enables browser-side JavaScript chunk loading through the JSONP runtime and
 * adds the supporting runtime requirements for matching chunks.
 */
declare class JsonpChunkLoadingPlugin {
    /**
     * Registers compilation hooks that attach the JSONP chunk-loading runtime
     * module and its dependent runtime globals to chunks using `chunkLoading:
     * "jsonp"`.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type Compiler from "../Compiler";
