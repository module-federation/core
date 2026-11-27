export = ChunkPrefetchPreloadPlugin;
/**
 * Adds runtime support for chunk prefetch and preload relationships discovered
 * in the chunk graph.
 */
declare class ChunkPrefetchPreloadPlugin {
    /**
     * Registers compilation hooks that emit the runtime modules responsible for
     * scheduling chunk prefetch and preload requests.
     * @param {Compiler} compiler the compiler
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type Compiler from "../Compiler";
